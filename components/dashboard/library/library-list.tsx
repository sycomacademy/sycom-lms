"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { useDeferredValue, useState } from "react";
import { CategoriesFilter } from "@/components/dashboard/courses/categories-filter";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import { LibraryCard } from "@/components/dashboard/library/library-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";

const DIFFICULTY_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

type LibraryCourse = RouterOutputs["course"]["listLibrary"]["courses"][number];

export function LibraryList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [filterDifficulties, setFilterDifficulties] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null
  );

  const deferredSearch = useDeferredValue(search);
  const deferredCategoryIds = useDeferredValue(categoryIds);
  const deferredDifficulties = useDeferredValue(filterDifficulties);
  const deferredPagination = useDeferredValue(pagination);

  const queryOptions = trpc.course.listLibrary.queryOptions({
    limit: deferredPagination.pageSize,
    offset: deferredPagination.pageIndex * deferredPagination.pageSize,
    search: deferredSearch || undefined,
    filterCategoryIds:
      deferredCategoryIds.length > 0 ? deferredCategoryIds : undefined,
    filterDifficulties:
      deferredDifficulties.length > 0
        ? (deferredDifficulties as
            | ["beginner"]
            | ["intermediate"]
            | ["advanced"]
            | ["expert"])
        : undefined,
    sortBy: "updatedAt",
    sortDirection: "desc",
  });

  const { data } = useSuspenseQuery(queryOptions);

  const enrollMutation = useMutation(
    trpc.course.enroll.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["course", "listLibrary"]],
        });
        setEnrollingCourseId(null);
        toastManager.add({ title: "Enrolled successfully", type: "success" });
      },
      onError: (err) => {
        setEnrollingCourseId(null);
        toastManager.add({
          title: "Enrollment failed",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  const isFetching =
    deferredSearch !== search ||
    deferredCategoryIds !== categoryIds ||
    deferredDifficulties !== filterDifficulties ||
    deferredPagination !== pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleEnroll = (courseId: string) => {
    setEnrollingCourseId(courseId);
    enrollMutation.mutate({ courseId });
  };

  const totalPages = Math.ceil(data.total / pagination.pageSize);

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center gap-3">
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CategoriesFilter
          className="min-w-72"
          onChange={(ids) => {
            setCategoryIds(ids);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          value={categoryIds}
        />
        <MultiSelectFilter
          allLabel="All levels"
          className="min-w-40"
          onChange={(v) => {
            setFilterDifficulties(v);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
          options={[...DIFFICULTY_OPTIONS]}
          triggerLabel="Difficulty"
          value={filterDifficulties}
        />
      </div>

      {data.courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No published courses found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.courses.map((course: LibraryCourse) => (
              <LibraryCard
                course={course}
                isEnrolling={
                  enrollMutation.isPending && enrollingCourseId === course.id
                }
                key={course.id}
                onEnroll={handleEnroll}
              />
            ))}
          </div>

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
                  disabled={pagination.pageIndex === 0}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex - 1,
                    }))
                  }
                  size="icon-sm"
                  variant="outline"
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <span className="text-sm tabular-nums">
                  {pagination.pageIndex + 1}{" "}
                  <span className="text-muted-foreground">
                    / {totalPages || 1}
                  </span>
                </span>
                <Button
                  disabled={pagination.pageIndex >= totalPages - 1}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }))
                  }
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
    </div>
  );
}
