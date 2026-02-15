"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  BookOpenIcon,
  LayersIcon,
  Loader2Icon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";
import { CourseActions } from "@/components/dashboard/courses/course-actions";
import { CreateCourseDialog } from "@/components/dashboard/courses/create-course-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserQuery } from "@/packages/hooks/use-user";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";
import { getInitials } from "@/packages/utils/string";

type Course = RouterOutputs["course"]["list"]["courses"][number];

// ---------------------------------------------------------------------------
// Badge variant maps
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
};

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  beginner: { label: "Beginner", variant: "outline" },
  intermediate: { label: "Intermediate", variant: "secondary" },
  advanced: { label: "Advanced", variant: "default" },
  expert: { label: "Expert", variant: "default" },
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "All statuses",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const DIFFICULTY_FILTER_LABELS: Record<string, string> = {
  all: "All levels",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function createColumns(
  userRole: string,
  userId: string
): ColumnDef<Course, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: "Course",
      size: 280,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{course.title}</span>
            <span className="text-muted-foreground text-xs">
              /{course.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const config = STATUS_CONFIG[status] ?? {
          label: status,
          variant: "outline" as const,
        };
        return (
          <Badge className="capitalize" variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      size: 120,
      enableSorting: false,
      cell: ({ row }) => {
        const difficulty = row.getValue("difficulty") as string;
        const config = DIFFICULTY_CONFIG[difficulty] ?? {
          label: difficulty,
          variant: "outline" as const,
        };
        return (
          <Badge className="capitalize" variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "content",
      header: "Content",
      size: 140,
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-3 text-muted-foreground text-xs">
            <span className="flex items-center gap-1" title="Sections">
              <LayersIcon className="size-3.5" />
              {course.sectionCount}
            </span>
            <span className="flex items-center gap-1" title="Lessons">
              <BookOpenIcon className="size-3.5" />
              {course.lessonCount}
            </span>
            <span className="flex items-center gap-1" title="Enrolled">
              <UsersIcon className="size-3.5" />
              {course.enrollmentCount}
            </span>
          </div>
        );
      },
    },
    {
      id: "instructor",
      header: "Instructor",
      size: 180,
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original;
        if (!course.instructorName) {
          return (
            <span className="text-muted-foreground text-xs">Unassigned</span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                alt={course.instructorName}
                src={course.instructorImage ?? undefined}
              />
              <AvatarFallback className="text-[10px]">
                {getInitials(course.instructorName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm">{course.instructorName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 130,
      cell: ({ row }) => {
        const date = new Date(row.getValue("updatedAt") as string);
        return (
          <span className="text-muted-foreground text-xs tabular-nums">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      size: 50,
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original;
        // Admin can always delete; main instructor can delete
        const canDelete = userRole === "admin" || course.createdBy === userId;
        return (
          <CourseActions
            canDelete={canDelete}
            courseId={course.id}
            courseTitle={course.title}
          />
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Table component
// ---------------------------------------------------------------------------

export function CoursesTable() {
  const trpc = useTRPC();
  const { role, user: currentUser } = useUserQuery();
  const [, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  const queryOptions = trpc.course.list.queryOptions({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: deferredSearch || undefined,
    filterStatus:
      filterStatus !== "all"
        ? (filterStatus as "draft" | "published" | "archived")
        : undefined,
    filterDifficulty:
      filterDifficulty !== "all"
        ? (filterDifficulty as
            | "beginner"
            | "intermediate"
            | "advanced"
            | "expert")
        : undefined,
    sortBy: "updatedAt",
    sortDirection: "desc",
  });

  const { data } = useSuspenseQuery(queryOptions);
  const isSearching = deferredSearch !== search;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    startTransition(() => {
      setter(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  const handlePaginationChange = (next: PaginationState) => {
    startTransition(() => {
      setPagination(next);
    });
  };

  const columns = createColumns(role ?? "student", currentUser.id);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            {isSearching ? (
              <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              className="pl-8"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search courses..."
              value={search}
            />
          </div>
          <Select
            onValueChange={(v) => {
              if (v) {
                handleFilterChange(setFilterStatus, v);
              }
            }}
            value={filterStatus}
          >
            <SelectTrigger className="w-fit data-[size=default]:h-9">
              <SelectValue>
                {STATUS_FILTER_LABELS[filterStatus] ?? "All statuses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) => {
              if (v) {
                handleFilterChange(setFilterDifficulty, v);
              }
            }}
            value={filterDifficulty}
          >
            <SelectTrigger className="w-fit data-[size=default]:h-9">
              <SelectValue>
                {DIFFICULTY_FILTER_LABELS[filterDifficulty] ?? "All levels"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTY_FILTER_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <CreateCourseDialog />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data.courses}
        manualPagination
        onPaginationChange={handlePaginationChange}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={data.total}
      />
    </div>
  );
}
