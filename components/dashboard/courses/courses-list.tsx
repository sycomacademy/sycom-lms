"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  BookOpenIcon,
  InfoIcon,
  LayoutGridIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
  Trash2Icon,
} from "lucide-react";
import type { Route } from "next";
import { useQueryStates } from "nuqs";
import { useDeferredValue, useState, useTransition } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CategoriesFilter } from "@/components/dashboard/courses/categories-filter";
import { CourseCard } from "@/components/dashboard/courses/course-card";
import { CoursePeopleDialog } from "@/components/dashboard/courses/course-people-dialog";
import { coursesListParsers } from "@/components/dashboard/courses/courses-list-parsers";
import { CreateCourseForm } from "@/components/dashboard/courses/create-course-form";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import { Link } from "@/components/layout/foresight-link";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/packages/trpc/client";
import { DIFFICULTY_OPTIONS, STATUS_OPTIONS } from "@/packages/utils/schema";
import { formatCourseDate } from "@/packages/utils/time";

type Course = RouterOutputs["course"]["list"]["courses"][number];

interface CoursesTableColumnOptions {
  deleteCourse: (courseId: string) => void;
  isDeleting: boolean;
  onViewPeople: (course: Pick<Course, "id" | "title">) => void;
}

function getColumns({
  deleteCourse,
  isDeleting,
  onViewPeople,
}: CoursesTableColumnOptions): ColumnDef<Course, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      size: 220,
      cell: ({ row }) => (
        <Link
          className="font-medium hover:underline"
          href={`/dashboard/courses/${row.original.id}/edit` as Route}
        >
          <span className="line-clamp-1">{row.original.title}</span>
        </Link>
      ),
    },
    {
      id: "categories",
      header: "Categories",
      size: 220,
      enableSorting: false,
      cell: ({ row }) => {
        const categoriesLabel =
          row.original.categories.length > 0
            ? row.original.categories
                .map((category) => category.name)
                .join(", ")
            : null;

        if (!categoriesLabel) {
          return <span className="text-muted-foreground">&mdash;</span>;
        }

        return (
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="block max-w-56 cursor-default truncate text-muted-foreground text-sm">
                  {categoriesLabel}
                </span>
              }
            />
            <TooltipContent>{categoriesLabel}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      size: 120,
      enableSorting: false,
      cell: ({ row }) => (
        <Badge className="capitalize">{row.original.difficulty}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => (
        <Badge className="capitalize" variant="outline">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 130,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatCourseDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const course = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={() =>
                      onViewPeople({
                        id: course.id,
                        title: course.title,
                      })
                    }
                    size="icon-xs"
                    variant="outline"
                  >
                    <InfoIcon />
                  </Button>
                }
              />
              <TooltipContent>Instructor & students</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    disabled={isDeleting}
                    onClick={() => deleteCourse(course.id)}
                    size="icon-xs"
                    variant="destructive"
                  >
                    <Trash2Icon />
                  </Button>
                }
              />
              <TooltipContent>Delete course</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/dashboard/courses/${course.id}/edit` as Route}
                      />
                    }
                    size="icon-xs"
                    variant="outline"
                  >
                    <PencilIcon />
                  </Button>
                }
              />
              <TooltipContent>Edit course</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}

export function CoursesList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const [peopleDialogCourse, setPeopleDialogCourse] = useState<Course | null>(
    null
  );
  const [deleteAlertCourse, setDeleteAlertCourse] = useState<Course | null>(
    null
  );

  const [
    {
      view,
      search,
      categories: categoryIds,
      difficulties: filterDifficulties,
      statuses: filterStatuses,
      sortBy,
      sortDirection,
      page,
      pageSize,
    },
    setParams,
  ] = useQueryStates(coursesListParsers);

  const pageIndex = Math.max(0, page - 1);
  const pagination = {
    pageIndex,
    pageSize,
  };
  const deferredSearch = useDeferredValue(search);
  const deferredCategoryIds = useDeferredValue(categoryIds);
  const deferredDifficulties = useDeferredValue(filterDifficulties);
  const deferredStatuses = useDeferredValue(filterStatuses);
  const deferredPagination = useDeferredValue(pagination);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredSortDirection = useDeferredValue(sortDirection);

  const queryOptions = trpc.course.list.queryOptions({
    limit: deferredPagination.pageSize,
    offset: deferredPagination.pageIndex * deferredPagination.pageSize,
    search: deferredSearch,
    filterCategoryIds: deferredCategoryIds,
    filterDifficulties: deferredDifficulties,
    filterStatuses: deferredStatuses,
    sortBy: deferredSortBy,
    sortDirection: deferredSortDirection,
  });

  const { data, isFetching, isPending } = useQuery(queryOptions);

  const deleteCourseMutation = useMutation(
    trpc.course.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.list.queryKey(),
        });
        setDeleteAlertCourse(null);
        toastManager.add({ title: "Course deleted", type: "success" });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to delete course",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const courses = data?.courses ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pagination.pageSize);
  const startCount =
    total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const endCount = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    total
  );

  const handleTablePaginationChange = (next: PaginationState) => {
    startTransition(() => {
      setParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    });
  };

  const handleTableSortingChange = (next: SortingState) => {
    const nextSort = next[0];

    startTransition(() => {
      setParams({
        page: 1,
        sortBy:
          (nextSort?.id as "title" | "createdAt" | "updatedAt" | "status") ??
          "updatedAt",
        sortDirection: nextSort?.desc === false ? "asc" : "desc",
      });
    });
  };

  const columns = getColumns({
    deleteCourse: (courseId) => {
      const course = courses.find((item) => item.id === courseId);
      if (course) {
        setDeleteAlertCourse(course);
      }
    },
    isDeleting: deleteCourseMutation.isPending,
    onViewPeople: (course) => {
      const match = courses.find((item) => item.id === course.id);
      if (match) {
        setPeopleDialogCourse(match);
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          {isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            className="pl-8"
            onChange={(event) =>
              setParams({ search: event.target.value, page: 1 })
            }
            placeholder="Search courses..."
            value={search}
          />
        </div>
        <Sheet>
          <SheetTrigger
            render={
              <Button size="sm">
                <PlusIcon className="size-4" />
                <span className="hidden sm:inline">Create course</span>
              </Button>
            }
          />
          <SheetContent side="right" variant="inset">
            <SheetHeader>
              <SheetTitle>Create course</SheetTitle>
              <SheetDescription>
                Add the core course details here, then continue editing lessons
                and curriculum on the next screen.
              </SheetDescription>
            </SheetHeader>
            <SheetPanel>
              <CreateCourseForm className="max-w-none" />
            </SheetPanel>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoriesFilter
            className="min-w-72"
            onChange={(ids) => setParams({ categories: ids, page: 1 })}
            value={categoryIds}
          />
          <MultiSelectFilter
            allLabel="All levels"
            className="w-40"
            onChange={(nextDifficulties) =>
              setParams({
                difficulties: nextDifficulties as typeof filterDifficulties,
                page: 1,
              })
            }
            options={[...DIFFICULTY_OPTIONS]}
            resetLabel="Reset"
            showAllAsUnchecked
            triggerLabel="Difficulty"
            value={filterDifficulties as string[]}
          />
          <MultiSelectFilter
            allLabel="All statuses"
            className="w-40"
            onChange={(nextStatuses) =>
              setParams({
                page: 1,
                statuses: nextStatuses as typeof filterStatuses,
              })
            }
            options={[...STATUS_OPTIONS]}
            resetLabel="Reset"
            showAllAsUnchecked
            triggerLabel="Status"
            value={filterStatuses as string[]}
          />
        </div>

        <Tabs
          onValueChange={(nextView) =>
            setParams({
              page: 1,
              pageSize: nextView === "table" ? 10 : 12,
              view: nextView as "card" | "table",
            })
          }
          value={view}
        >
          <TabsList>
            <TabsTab value="card">
              <LayoutGridIcon className="size-4" />
              Card
            </TabsTab>
            <TabsTab value="table">
              <TableIcon className="size-4" />
              Table
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <CoursesResults
        columns={columns}
        courses={courses}
        dataLoaded={Boolean(data) || !isPending}
        deleteCourse={(courseId) => {
          const course = courses.find((item) => item.id === courseId);
          if (course) {
            setDeleteAlertCourse(course);
          }
        }}
        onTablePaginationChange={handleTablePaginationChange}
        onTableSortingChange={handleTableSortingChange}
        onViewPeople={(course) => {
          const match = courses.find((item) => item.id === course.id);
          if (match) {
            setPeopleDialogCourse(match);
          }
        }}
        pageIndex={pageIndex}
        pageSize={pagination.pageSize}
        sorting={[{ id: sortBy, desc: sortDirection === "desc" }]}
        total={total}
        view={view}
      />

      {view === "card" && totalPages > 1 && (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startCount}-{endCount}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </p>

          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={pageIndex === 0}
                  className={
                    pageIndex === 0
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageIndex > 0) {
                      setParams({ page: page - 1 });
                    }
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  isActive
                  onClick={(event) => event.preventDefault()}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={(event) => event.preventDefault()}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={pageIndex >= totalPages - 1}
                  className={
                    pageIndex >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageIndex < totalPages - 1) {
                      setParams({ page: page + 1 });
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CoursePeopleDialog
        courseId={peopleDialogCourse?.id ?? ""}
        courseTitle={peopleDialogCourse?.title ?? ""}
        onOpenChange={(open) => {
          if (!open) {
            setPeopleDialogCourse(null);
          }
        }}
        open={peopleDialogCourse !== null}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeleteAlertCourse(null);
          }
        }}
        open={deleteAlertCourse !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteAlertCourse
                ? `This will permanently delete "${deleteAlertCourse.title}".`
                : "This will permanently delete this course."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourseMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                deleteCourseMutation.isPending || deleteAlertCourse === null
              }
              onClick={() => {
                if (deleteAlertCourse) {
                  deleteCourseMutation.mutate({
                    courseId: deleteAlertCourse.id,
                  });
                }
              }}
              variant="destructive"
            >
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CoursesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-[2.2fr_1.6fr_0.9fr_0.9fr_120px] gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="grid grid-cols-[2.2fr_1.6fr_0.9fr_0.9fr_120px] items-center gap-4 px-4 py-4"
              key={index}
            >
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoursesCardSkeleton() {
  return (
    <Card size="default">
      <AspectRatio ratio={16 / 10}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>

      <CardHeader className="gap-3 pb-0">
        <Skeleton className="h-6 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>

      <CardFooter className="items-center justify-between gap-3 border-t bg-muted/20">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
}

function CoursesCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <CoursesCardSkeleton key={index} />
      ))}
    </div>
  );
}

function CoursesEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No courses yet</EmptyTitle>
        <EmptyDescription>
          Create your first course to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

interface CoursesTableContentProps {
  columns: ColumnDef<Course, unknown>[];
  courses: Course[];
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  total: number;
}

function CoursesTableContent({
  columns,
  courses,
  onPaginationChange,
  onSortingChange,
  pageIndex,
  pageSize,
  sorting,
  total,
}: CoursesTableContentProps) {
  return (
    <DataTable
      columns={columns}
      data={courses}
      manualPagination
      manualSorting
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      pageIndex={pageIndex}
      pageSize={pageSize}
      sorting={sorting}
      total={total}
    />
  );
}

interface CoursesCardsContentProps {
  courses: Course[];
  deleteCourse: (courseId: string) => void;
  onViewPeople: (course: Pick<Course, "id" | "title">) => void;
}

function CoursesCardsContent({
  courses,
  deleteCourse,
  onViewPeople,
}: CoursesCardsContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          course={course}
          key={course.id}
          onDelete={deleteCourse}
          onViewPeople={() =>
            onViewPeople({
              id: course.id,
              title: course.title,
            })
          }
        />
      ))}
    </div>
  );
}

interface CoursesResultsProps {
  columns: ColumnDef<Course, unknown>[];
  courses: Course[];
  dataLoaded: boolean;
  deleteCourse: (courseId: string) => void;
  onViewPeople: (course: Pick<Course, "id" | "title">) => void;
  onTablePaginationChange: (pagination: PaginationState) => void;
  onTableSortingChange: (sorting: SortingState) => void;
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  total: number;
  view: "card" | "table";
}

function CoursesResults({
  columns,
  courses,
  dataLoaded,
  deleteCourse,
  onViewPeople,
  onTablePaginationChange,
  onTableSortingChange,
  pageIndex,
  pageSize,
  sorting,
  total,
  view,
}: CoursesResultsProps) {
  if (!dataLoaded) {
    return view === "table" ? (
      <CoursesTableSkeleton />
    ) : (
      <CoursesCardsSkeleton />
    );
  }

  if (courses.length === 0) {
    return <CoursesEmptyState />;
  }

  if (view === "table") {
    return (
      <CoursesTableContent
        columns={columns}
        courses={courses}
        onPaginationChange={onTablePaginationChange}
        onSortingChange={onTableSortingChange}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        total={total}
      />
    );
  }

  return (
    <CoursesCardsContent
      courses={courses}
      deleteCourse={deleteCourse}
      onViewPeople={onViewPeople}
    />
  );
}
