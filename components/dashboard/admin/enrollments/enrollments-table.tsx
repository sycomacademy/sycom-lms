"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { BookOpenIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import { capitalize } from "@/packages/utils/string";

type Enrollment =
  RouterOutputs["admin"]["listEnrollments"]["enrollments"][number];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "suspended", label: "Suspended" },
] as const;

const SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "public", label: "Public" },
  { value: "cohort_assignment", label: "Cohort Assignment" },
  { value: "admin_assigned", label: "Admin Assigned" },
] as const;

const STATUS_BADGE_VARIANTS: Record<
  Enrollment["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  completed: "secondary",
  dropped: "destructive",
  suspended: "outline",
};

const SOURCE_LABELS: Record<Enrollment["source"], string> = {
  public: "Public",
  cohort_assignment: "Cohort",
  admin_assigned: "Admin",
};

function EnrollmentsEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No enrollments found</EmptyTitle>
        <EmptyDescription>
          No enrollments match your current filters.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function EnrollmentsTable() {
  const trpc = useTRPC();
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [source, setSource] =
    useState<(typeof SOURCE_OPTIONS)[number]["value"]>("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const query = useQuery(
    trpc.admin.listEnrollments.queryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
      filterStatus: status === "all" ? undefined : status,
      filterSource: source === "all" ? undefined : source,
    })
  );

  const columns = useMemo<ColumnDef<Enrollment, unknown>[]>(
    () => [
      {
        accessorKey: "userName",
        header: "Student",
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={row.original.userImage ?? undefined} />
              <AvatarFallback>
                {row.original.userName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-sm">
                {row.original.userName}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {row.original.userEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "courseTitle",
        header: "Course",
        size: 220,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.courseTitle}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANTS[row.original.status]}>
            {capitalize(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        size: 140,
        cell: ({ row }) => {
          const { lessonsCompleted, lessonsTotal } = row.original;
          const percent =
            lessonsTotal > 0
              ? Math.round((lessonsCompleted / lessonsTotal) * 100)
              : 0;
          return (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-muted-foreground text-xs tabular-nums">
                {lessonsCompleted}/{lessonsTotal}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        size: 120,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {SOURCE_LABELS[row.original.source]}
          </span>
        ),
      },
      {
        accessorKey: "enrolledAt",
        header: "Enrolled",
        size: 140,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs tabular-nums">
            {new Date(row.original.enrolledAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "completedAt",
        header: "Completed",
        size: 140,
        cell: ({ row }) =>
          row.original.completedAt ? (
            <span className="text-muted-foreground text-xs tabular-nums">
              {new Date(row.original.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
    ],
    []
  );

  const enrollments = query.data?.enrollments ?? [];
  const total = query.data?.total ?? 0;
  const dataLoaded = Boolean(query.data) || !query.isPending;

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-3">
        <div className="relative max-w-sm flex-1">
          {query.isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            className="pl-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
            placeholder="Search by name, email, or course..."
            value={search}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select
          onValueChange={(nextValue) => {
            setStatus(nextValue as (typeof STATUS_OPTIONS)[number]["value"]);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          value={status}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(nextValue) => {
            setSource(nextValue as (typeof SOURCE_OPTIONS)[number]["value"]);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          value={source}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {SOURCE_OPTIONS.find((o) => o.value === source)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!dataLoaded && (
        <div className="h-80 w-full animate-pulse rounded-md border bg-muted/30" />
      )}
      {dataLoaded && enrollments.length === 0 && <EnrollmentsEmptyState />}
      {dataLoaded && enrollments.length > 0 && (
        <DataTable
          columns={columns}
          data={enrollments}
          manualPagination
          onPaginationChange={setPagination}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={total}
        />
      )}
    </div>
  );
}
