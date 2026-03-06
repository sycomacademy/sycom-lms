"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/packages/trpc/client";

interface LearnLessonPageProps {
  courseId: string;
  lessonId: string;
}

export function LearnLessonPage({ courseId, lessonId }: LearnLessonPageProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setHasScrolledToEnd(true);
        }
      },
      { threshold: 1, rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { data } = useSuspenseQuery(
    trpc.course.getEnrolledLesson.queryOptions({ courseId, lessonId })
  );

  const markComplete = useMutation(
    trpc.course.markLessonComplete.mutationOptions({
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.getEnrolledLesson.queryKey({
            courseId,
            lessonId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.course.getEnrolledCourse.queryKey({ courseId }),
        });
        if (result.courseCompleted) {
          toastManager.add({ title: "Course completed!", type: "success" });
        }
      },
    })
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      <Card>
        <CardHeader>
          <h1 className="font-semibold text-2xl tracking-tight">
            {data.lesson.title}
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.lesson.content ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none [&_.editor-content]:min-h-0 [&_.editor-content]:p-0">
              <Editor
                content={
                  data.lesson.content as
                    | import("@tiptap/react").JSONContent
                    | string
                }
                editable={false}
                variant="full"
              />
            </div>
          ) : (
            <p className="text-muted-foreground">No content for this lesson.</p>
          )}

          {/* Sentinel for scroll-to-end detection */}
          <div ref={sentinelRef} />

          {!data.lesson.isCompleted && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-block">
                    <Button
                      disabled={markComplete.isPending || !hasScrolledToEnd}
                      onClick={() =>
                        markComplete.mutate({ courseId, lessonId })
                      }
                    >
                      {markComplete.isPending ? (
                        <Loader2Icon className="size-4 animate-spin" />
                      ) : (
                        "Mark as complete"
                      )}
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {hasScrolledToEnd
                  ? "Mark this lesson as complete"
                  : "Scroll to the end of the lesson to unlock Mark as complete"}
              </TooltipContent>
            </Tooltip>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {data.nav.prevLessonId ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={
                  `/learn/course/${courseId}/${data.nav.prevLessonId}` as Route
                }
              />
            }
            variant="outline"
          >
            <ChevronLeftIcon className="size-4" />
            Previous
          </Button>
        ) : (
          <div />
        )}
        {data.nav.nextLessonId ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={
                  `/learn/course/${courseId}/${data.nav.nextLessonId}` as Route
                }
              />
            }
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link href={"/dashboard/journey" as Route} />}
          >
            Back to journey
          </Button>
        )}
      </div>
    </div>
  );
}
