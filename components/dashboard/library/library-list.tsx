"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { Route } from "next";
import { useDeferredValue, useState } from "react";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

export function LibraryList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data } = useSuspenseQuery(
    trpc.course.listLibrary.queryOptions({
      limit: 24,
      offset: 0,
      search: deferredSearch || undefined,
    })
  );

  const enrollMutation = useMutation(
    trpc.course.enroll.mutationOptions({
      onMutate: ({ courseId }) => {
        setPendingCourseId(courseId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.listLibrary.queryKey(),
        });
        toastManager.add({ title: "Enrolled successfully", type: "success" });
      },
      onError: (err) => {
        toastManager.add({
          title: "Enrollment failed",
          description: err.message,
          type: "error",
        });
      },
      onSettled: () => {
        setPendingCourseId(null);
      },
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-sm">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          value={search}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.courses.map((c) => {
          const percent =
            c.lessonCount > 0
              ? Math.round((c.completedLessonCount / c.lessonCount) * 100)
              : 0;
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  {c.isEnrolled ? (
                    <Link
                      className="font-medium hover:underline"
                      href={`/learn/${c.id}` as Route}
                    >
                      {c.title}
                    </Link>
                  ) : (
                    <span className="font-medium">{c.title}</span>
                  )}
                  <Badge variant="outline">{c.difficulty}</Badge>
                </div>
                <p className="line-clamp-2 text-muted-foreground text-sm">
                  {c.description ?? "No description"}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-muted-foreground text-xs">
                  {c.sectionCount} sections · {c.lessonCount} lessons
                </div>
                {c.isEnrolled && (
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} />
                  </div>
                )}
                {c.isEnrolled ? (
                  <Button
                    nativeButton={false}
                    render={<Link href={`/learn/${c.id}` as Route} />}
                    variant="outline"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    disabled={enrollMutation.isPending}
                    onClick={() => enrollMutation.mutate({ courseId: c.id })}
                  >
                    {enrollMutation.isPending && pendingCourseId === c.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      "Enroll"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {data.courses.length === 0 && (
        <p className="py-8 text-center text-muted-foreground text-sm">
          No courses found.
        </p>
      )}
    </div>
  );
}
