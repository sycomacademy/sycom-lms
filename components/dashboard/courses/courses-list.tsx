"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { useDeferredValue, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CategoriesFilter } from "@/components/dashboard/courses/categories-filter";
import { CourseCard } from "@/components/dashboard/courses/course-card";
import { CoursePeopleDialog } from "@/components/dashboard/courses/course-people-dialog";
import { coursesListParsers } from "@/components/dashboard/courses/courses-list-parsers";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
] as const;

const DIFFICULTY_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  beginner: "outline",
  intermediate: "secondary",
  advanced: "default",
  expert: "default",
};

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  draft: "outline",
  published: "default",
};

type Course = RouterOutputs["course"]["list"]["courses"][number];

function buildCourseColumns(
  openPeopleDialog: (course: Course) => void,
  onDeleteClick: (course: Course) => void
): ColumnDef<Course, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      size: 300,
      cell: ({ row }) => (
        <Link
          className="font-medium hover:underline"
          href={`/dashboard/courses/${row.original.id}/edit`}
        >
          <span className="line-clamp-1">{row.original.title}</span>
        </Link>
      ),
    },
    {
      id: "categories",
      header: "Categories",
      size: 200,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.length > 0 ? (
            row.original.categories.map((cat) => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">&mdash;</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      size: 120,
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          className="capitalize"
          variant={
            DIFFICULTY_BADGE_VARIANT[row.original.difficulty] ?? "outline"
          }
        >
          {row.original.difficulty}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          className="capitalize"
          variant={STATUS_BADGE_VARIANT[row.original.status] ?? "outline"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      size: 80,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={() => openPeopleDialog(row.original)}
            size="icon-xs"
            title="Instructor & students"
            variant="outline"
          >
            <UsersIcon />
          </Button>
          <Button
            onClick={() => onDeleteClick(row.original)}
            size="icon-xs"
            variant="destructive"
          >
            <Trash2Icon />
          </Button>
          <Button
            nativeButton={false}
            render={
              <Link href={`/dashboard/courses/${row.original.id}/edit`} />
            }
            size="icon-xs"
            variant="outline"
          >
            <PencilIcon />
          </Button>
        </div>
      ),
    },
  ];
}

export function CoursesList() {
  const trpc = useTRPC();

  const [
    {
      view,
      search,
      categories: categoryIds,
      difficulties: filterDifficulties,
      statuses: filterStatuses,
      page,
      pageSize,
    },
    setParams,
  ] = useQueryStates(coursesListParsers);

  const pageIndex = Math.max(0, page - 1);
  const pagination: PaginationState = {
    pageIndex,
    pageSize,
  };

  const [peopleDialogCourse, setPeopleDialogCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const deleteMutation = useMutation(
    trpc.course.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["course", "list"]] });
        setCourseToDelete(null);
        toastManager.add({ title: "Course deleted", type: "success" });
      },
      onError: (err) => {
        toastManager.add({
          title: "Failed to delete course",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  // Deferred values for the query — UI updates immediately (checkboxes, input),
  // while the query re-fetches in the background without suspending.
  const deferredSearch = useDeferredValue(search);
  const deferredCategoryIds = useDeferredValue(categoryIds);
  const deferredDifficulties = useDeferredValue(filterDifficulties);
  const deferredStatuses = useDeferredValue(filterStatuses);
  const deferredPagination = useDeferredValue(pagination);

  const queryOptions = trpc.course.list.queryOptions({
    limit: deferredPagination.pageSize,
    offset: deferredPagination.pageIndex * deferredPagination.pageSize,
    search: deferredSearch || undefined,
    filterCategoryIds:
      deferredCategoryIds.length > 0 ? deferredCategoryIds : undefined,
    filterDifficulties:
      deferredDifficulties.length > 0 ? deferredDifficulties : undefined,
    filterStatuses: deferredStatuses.length > 0 ? deferredStatuses : undefined,
    sortBy: "updatedAt",
    sortDirection: "desc",
  });

  const { data } = useSuspenseQuery(queryOptions);

  const isFetching =
    deferredSearch !== search ||
    deferredCategoryIds !== categoryIds ||
    deferredDifficulties !== filterDifficulties ||
    deferredStatuses !== filterStatuses ||
    deferredPagination.pageIndex !== pageIndex ||
    deferredPagination.pageSize !== pageSize;

  const handleSearchChange = (value: string) => {
    setParams({ search: value, page: 1 });
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete({ id: course.id, title: course.title });
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) {
      return;
    }
    deleteMutation.mutate({ courseId: courseToDelete.id });
  };

  const handlePaginationChange = (next: PaginationState) => {
    setParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
  };

  const totalPages = Math.ceil(data.total / pagination.pageSize);

  return (
    <div className="space-y-4">
      {/* Search row */}
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          {isFetching ? (
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
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/courses/new" />}
          size="sm"
        >
          <PlusIcon className="size-4" />
          <span className="hidden sm:inline">Create course</span>
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <CategoriesFilter
          className="min-w-72"
          onChange={(ids) => setParams({ categories: ids, page: 1 })}
          value={categoryIds}
        />
        <MultiSelectFilter
          allLabel="All levels"
          className="min-w-40"
          onChange={(v) =>
            setParams({
              difficulties: v as (
                | "beginner"
                | "intermediate"
                | "advanced"
                | "expert"
              )[],
              page: 1,
            })
          }
          options={[...DIFFICULTY_OPTIONS]}
          triggerLabel="Difficulty"
          value={filterDifficulties}
        />
        <MultiSelectFilter
          allLabel="All statuses"
          className="min-w-40"
          onChange={(v) =>
            setParams({
              statuses: v as ("draft" | "published")[],
              page: 1,
            })
          }
          options={[...STATUS_OPTIONS]}
          triggerLabel="Status"
          value={filterStatuses}
        />
        <div className="flex rounded-md border border-input">
          <Button
            onClick={() => setParams({ view: "card" })}
            size="sm"
            variant={view === "card" ? "secondary" : "ghost"}
          >
            <LayoutGridIcon className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Card</span>
          </Button>
          <Button
            onClick={() => setParams({ view: "table" })}
            size="sm"
            variant={view === "table" ? "secondary" : "ghost"}
          >
            <TableIcon className="size-4" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Table</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      {view === "table" ? (
        <DataTable
          columns={buildCourseColumns(
            (course) =>
              setPeopleDialogCourse({ id: course.id, title: course.title }),
            handleDeleteClick
          )}
          data={data.courses}
          manualPagination
          onPaginationChange={handlePaginationChange}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={data.total}
        />
      ) : (
        <>
          {data.courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No courses found. Create your first course to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((course) => (
                <CourseCard
                  course={course}
                  key={course.id}
                  onDelete={(courseId) => {
                    const c = data.courses.find((x) => x.id === courseId);
                    if (c) {
                      handleDeleteClick(c);
                    }
                  }}
                  onViewPeople={() =>
                    setPeopleDialogCourse({
                      id: course.id,
                      title: course.title,
                    })
                  }
                />
              ))}
            </div>
          )}

          {/* Card pagination */}
          {totalPages > 1 && (
            <div className="my-8 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {pagination.pageIndex * pagination.pageSize + 1}-
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    data.total
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {data.total}
                </span>
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  disabled={pageIndex === 0}
                  onClick={() => setParams({ page: page - 1 })}
                  size="icon-sm"
                  variant="outline"
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <span className="text-sm tabular-nums">
                  {page}{" "}
                  <span className="text-muted-foreground">
                    / {totalPages || 1}
                  </span>
                </span>
                <Button
                  disabled={pageIndex >= totalPages - 1}
                  onClick={() => setParams({ page: page + 1 })}
                  size="icon-sm"
                  variant="outline"
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CoursePeopleDialog
        courseId={peopleDialogCourse?.id ?? null}
        courseTitle={peopleDialogCourse?.title ?? ""}
        onOpenChange={(open) => !open && setPeopleDialogCourse(null)}
        open={peopleDialogCourse !== null}
      />

      <AlertDialog
        onOpenChange={(open) => !open && setCourseToDelete(null)}
        open={courseToDelete !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{courseToDelete?.title ?? ""}</strong>. Sections, lessons,
              and enrollments for this course will be removed. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
