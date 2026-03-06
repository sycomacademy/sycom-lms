"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

interface CohortsCourseAssignerProps {
  cohortId: string;
  currentCourses: {
    courseId: string;
    title: string;
    slug: string;
    assignedAt: Date;
    status?: string;
  }[];
}

export function CohortsCourseAssigner({
  cohortId,
  currentCourses,
}: CohortsCourseAssignerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: assignableData } = useQuery(
    trpc.course.listAssignableCourses.queryOptions({})
  );

  const assignMutation = useMutation(
    trpc.course.assignCourseToCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Course assigned", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.course.listCohortCourses.queryKey({ cohortId }),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to assign course",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const unassignMutation = useMutation(
    trpc.course.unassignCourseFromCohort.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Course unassigned", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.course.listCohortCourses.queryKey({ cohortId }),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to unassign course",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const assignedIds = new Set(currentCourses.map((c) => c.courseId));
  const availableToAssign =
    assignableData?.courses.filter((c) => !assignedIds.has(c.id)) ?? [];

  return (
    <div className="mt-1 space-y-2">
      {currentCourses.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentCourses.map((c) => (
            <span
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
              key={c.courseId}
            >
              {c.title}
              <button
                className="text-muted-foreground hover:text-destructive"
                onClick={() =>
                  unassignMutation.mutate({ cohortId, courseId: c.courseId })
                }
                title="Unassign"
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size="sm" variant="outline">
              <PlusIcon className="size-4" />
              Assign course
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-60 w-64">
          {availableToAssign.length === 0 ? (
            <div className="px-2 py-4 text-center text-muted-foreground text-xs">
              No more courses to assign. All published courses are assigned.
            </div>
          ) : (
            availableToAssign.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() =>
                  assignMutation.mutate({ cohortId, courseId: c.id })
                }
              >
                <span className="truncate">{c.title}</span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
