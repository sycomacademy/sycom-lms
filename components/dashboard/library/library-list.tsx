"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpenIcon,
  ClockIcon,
  Loader2Icon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useQueryStates } from "nuqs";
import { useDeferredValue, useTransition } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CategoriesFilter } from "@/components/dashboard/courses/categories-filter";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import { Link } from "@/components/layout/foresight-link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/packages/trpc/client";
import { DIFFICULTY_OPTIONS } from "@/packages/utils/schema";
import { libraryListParsers } from "./library-list-parsers";

type PublicCourse = RouterOutputs["course"]["listPublic"]["courses"][number];

const SORT_OPTIONS = {
  updatedAt_desc: "Recently updated",
  updatedAt_asc: "Oldest updated",
  createdAt_desc: "Newest",
  createdAt_asc: "Oldest",
  title_asc: "Title A-Z",
  title_desc: "Title Z-A",
} as const;

type SortValue = keyof typeof SORT_OPTIONS;

function getSortValue(
  sortBy: "title" | "createdAt" | "updatedAt",
  sortDirection: "asc" | "desc"
): SortValue {
  return `${sortBy}_${sortDirection}` as SortValue;
}

export function LibraryList() {
  const trpc = useTRPC();
  const [, startTransition] = useTransition();
  const [
    {
      search,
      categories: categoryIds,
      difficulties: filterDifficulties,
      sortBy,
      sortDirection,
      page,
      pageSize,
    },
    setParams,
  ] = useQueryStates(libraryListParsers);

  const pageIndex = Math.max(0, page - 1);
  const pagination = {
    pageIndex,
    pageSize,
  };
  const deferredSearch = useDeferredValue(search);
  const deferredCategoryIds = useDeferredValue(categoryIds);
  const deferredDifficulties = useDeferredValue(filterDifficulties);
  const deferredPagination = useDeferredValue(pagination);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredSortDirection = useDeferredValue(sortDirection);

  const { data, isFetching, isPending } = useQuery(
    trpc.course.listPublic.queryOptions({
      limit: deferredPagination.pageSize,
      offset: deferredPagination.pageIndex * deferredPagination.pageSize,
      search: deferredSearch,
      filterCategoryIds: deferredCategoryIds,
      filterDifficulties: deferredDifficulties,
      sortBy: deferredSortBy,
      sortDirection: deferredSortDirection,
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
  const sortValue = getSortValue(sortBy, sortDirection);

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-3">
        <div className="relative max-w-md flex-1">
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
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              const nextValue = value as SortValue;
              const [nextSortBy, nextSortDirection] = nextValue.split("_") as [
                "title" | "createdAt" | "updatedAt",
                "asc" | "desc",
              ];

              startTransition(() => {
                setParams({
                  page: 1,
                  sortBy: nextSortBy,
                  sortDirection: nextSortDirection,
                });
              });
            }}
            value={sortValue}
          >
            <SelectTrigger className="w-48">
              <SelectValue>{SORT_OPTIONS[sortValue]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoriesFilter
          className="min-w-72"
          onChange={(ids) =>
            startTransition(() => {
              setParams({ categories: ids, page: 1 });
            })
          }
          value={categoryIds}
        />
        <MultiSelectFilter
          allLabel="All levels"
          className="w-40"
          onChange={(nextDifficulties) =>
            startTransition(() => {
              setParams({
                difficulties: nextDifficulties as typeof filterDifficulties,
                page: 1,
              });
            })
          }
          options={[...DIFFICULTY_OPTIONS]}
          resetLabel="Reset"
          showAllAsUnchecked
          triggerLabel="Difficulty"
          value={filterDifficulties as string[]}
        />
      </div>

      {!data && isPending ? <LibraryCardsSkeleton /> : null}
      {data && courses.length === 0 ? <LibraryEmptyState /> : null}
      {data && courses.length > 0 ? <LibraryGrid courses={courses} /> : null}

      {data && totalPages > 1 ? (
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
      ) : null}
    </div>
  );
}

function LibraryGrid({ courses }: { courses: PublicCourse[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const categoriesLabel =
          course.categories.length > 0
            ? course.categories.map((category) => category.name).join(", ")
            : "Uncategorized";
        const courseHref =
          `/dashboard/library/${course.slug ?? course.id}` as Route;

        return (
          <Card className="overflow-hidden" key={course.id} size="default">
            <Link
              className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={courseHref}
            >
              <AspectRatio ratio={16 / 10}>
                {course.imageUrl ? (
                  <Image
                    alt={course.title}
                    className="h-full w-full object-cover"
                    height={220}
                    src={course.imageUrl}
                    width={360}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs uppercase tracking-widest">
                    No image
                  </div>
                )}
              </AspectRatio>
            </Link>

            <CardHeader className="gap-3 pb-0">
              <CardTitle className="line-clamp-1 font-semibold text-base">
                <Link href={courseHref}>{course.title}</Link>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="capitalize">{course.difficulty}</Badge>
              </div>
              <p className="truncate text-[11px] text-muted-foreground uppercase tracking-widest">
                {categoriesLabel}
              </p>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pt-0">
              <p className="line-clamp-3 text-muted-foreground text-sm leading-6">
                {course.description ?? "No description."}
              </p>

              <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
                {course.estimatedDuration ? (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="size-3.5" />
                    {Math.round(course.estimatedDuration / 60)}h
                  </span>
                ) : null}
                <span className="flex items-center gap-1">
                  <BookOpenIcon className="size-3.5" />
                  {course.lessonCount} lessons
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="size-3.5" />
                  {course.enrollmentCount.toLocaleString()} enrolled
                </span>
              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/20">
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href={courseHref} />}
              >
                View course
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function LibraryEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpenIcon />
        </EmptyMedia>
        <EmptyTitle>No courses found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find a different course.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function LibraryCardSkeleton() {
  return (
    <Card size="default">
      <AspectRatio ratio={16 / 10}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>

      <CardHeader className="gap-3 pb-0">
        <Skeleton className="h-6 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-4/5" />
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>

      <CardFooter className="border-t bg-muted/20">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

function LibraryCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <LibraryCardSkeleton key={index} />
      ))}
    </div>
  );
}
