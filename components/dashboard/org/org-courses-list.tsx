"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

export function OrgCoursesList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data } = useSuspenseQuery(trpc.course.listOrgCourses.queryOptions());

  const enrollMutation = useMutation(
    trpc.course.enroll.mutationOptions({
      onMutate: ({ courseId }) => {
        setPendingCourseId(courseId);
      },
      onSuccess: () => {
        toastManager.add({ title: "Enrolled successfully", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.course.listOrgCourses.queryKey(),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Enrollment failed",
          description: error.message,
          type: "error",
        });
      },
      onSettled: () => {
        setPendingCourseId(null);
      },
    })
  );

  const filteredCourses = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return data.courses;
    }

    return data.courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(query) ||
        (course.description ?? "").toLowerCase().includes(query) ||
        course.cohorts.some((cohort) =>
          cohort.name.toLowerCase().includes(query)
        )
      );
    });
  }, [data.courses, deferredSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-foreground text-sm">Courses</h2>
        <p className="text-muted-foreground text-xs">
          Courses assigned to your organization cohorts.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Input
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search courses or cohorts..."
          value={search}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            No assigned courses found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredCourses.map((course) => {
            const percent =
              course.lessonCount > 0
                ? Math.round(
                    (course.completedLessonCount / course.lessonCount) * 100
                  )
                : 0;

            return (
              <Card key={course.id}>
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm">{course.title}</h3>
                    <Badge variant="outline">{course.difficulty}</Badge>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {course.description ?? "No description"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {course.cohorts.map((cohort) => (
                      <Badge key={cohort.id} variant="secondary">
                        {cohort.name}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/learn/course/${course.id}` as Route} />
                      }
                      size="sm"
                      variant="outline"
                    >
                      Continue
                    </Button>
                    {!course.isEnrolled && (
                      <Button
                        disabled={enrollMutation.isPending}
                        onClick={() =>
                          enrollMutation.mutate({ courseId: course.id })
                        }
                        size="sm"
                      >
                        {enrollMutation.isPending &&
                        pendingCourseId === course.id ? (
                          <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                          "Enroll"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
