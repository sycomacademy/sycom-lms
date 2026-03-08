"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import { useDeferredValue, useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DIFFICULTY_OPTIONS,
  STATUS_OPTIONS,
} from "@/packages/db/schema/course";
import { useTRPC } from "@/packages/trpc/client";

type Course = RouterOutputs["course"]["list"]["courses"][number];

export function CoursesList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
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
            setParams({ view: nextView as "card" | "table" })
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
        courses={courses}
        dataLoaded={Boolean(data) || !isPending}
        deleteCourse={(courseId) => {
          const course = courses.find((item) => item.id === courseId);
          if (course) {
            setDeleteAlertCourse(course);
          }
        }}
        isDeleting={deleteCourseMutation.isPending}
        onViewPeople={(course) => {
          const match = courses.find((item) => item.id === course.id);
          if (match) {
            setPeopleDialogCourse(match);
          }
        }}
        view={view}
      />

      {totalPages > 1 && (
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
                  href="#"
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
                  href="#"
                  isActive
                  onClick={(event) => event.preventDefault()}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(event) => event.preventDefault()}
                >
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
                  href="#"
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <p className="text-muted-foreground text-sm">
        No courses found. Create your first course to get started.
      </p>
    </div>
  );
}

interface CoursesTableContentProps {
  courses: Course[];
  deleteCourse: (courseId: string) => void;
  isDeleting: boolean;
  onViewPeople: (course: Pick<Course, "id" | "title">) => void;
}

function CoursesTableContent({
  courses,
  deleteCourse,
  isDeleting,
  onViewPeople,
}: CoursesTableContentProps) {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[28%]">Categories</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => {
            const categoriesLabel =
              course.categories.length > 0
                ? course.categories.map((category) => category.name).join(", ")
                : null;

            return (
              <TableRow key={course.id}>
                <TableCell>
                  <Link
                    className="font-medium hover:underline"
                    href={`/dashboard/courses/${course.id}/edit` as Route}
                  >
                    <span className="line-clamp-1">{course.title}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  {categoriesLabel ? (
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
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className="capitalize">{course.difficulty}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className="capitalize" variant="outline">
                    {course.status}
                  </Badge>
                </TableCell>
                <TableCell>
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
                                href={
                                  `/dashboard/courses/${course.id}/edit` as Route
                                }
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
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
  courses: Course[];
  dataLoaded: boolean;
  deleteCourse: (courseId: string) => void;
  isDeleting: boolean;
  onViewPeople: (course: Pick<Course, "id" | "title">) => void;
  view: "card" | "table";
}

function CoursesResults({
  courses,
  dataLoaded,
  deleteCourse,
  isDeleting,
  onViewPeople,
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
        courses={courses}
        deleteCourse={deleteCourse}
        isDeleting={isDeleting}
        onViewPeople={onViewPeople}
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
