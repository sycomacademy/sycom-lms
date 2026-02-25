"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { MyValue } from "@/components/editor/plate-types";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { CourseSidebar } from "./course-sidebar";
import { LearnShell } from "./learn-shell";
import { LessonBottomBar } from "./lesson-bottom-bar";
import { LessonViewer } from "./lesson-viewer";

export function LearnLessonPage({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [reachedEnd, setReachedEnd] = useState(false);

  const courseQueryOptions = trpc.course.getEnrolledCourse.queryOptions({
    courseId,
  });
  const lessonQueryOptions = trpc.course.getEnrolledLesson.queryOptions({
    courseId,
    lessonId,
  });

  const { data: courseData } = useSuspenseQuery(courseQueryOptions);
  const { data: lessonData } = useSuspenseQuery(lessonQueryOptions);

  const lesson = lessonData.lesson as {
    deadlineAt?: Date | string | null;
    isPastDeadline?: boolean;
    isCompleted: boolean;
    [key: string]: unknown;
  };
  const isPastDeadline = lesson.isPastDeadline ?? false;
  const canMarkComplete = reachedEnd && !isPastDeadline;

  const markCompleteMutation = useMutation(
    trpc.course.markLessonComplete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["course", "getEnrolledCourse"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["course", "getEnrolledLesson"]],
        });
        toastManager.add({ title: "Lesson marked complete", type: "success" });
      },
      onError: (err) => {
        toastManager.add({
          title: "Couldn’t mark complete",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  const header = (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <Button
        nativeButton={false}
        render={<Link href="/dashboard/library" />}
        size="sm"
        variant="outline"
      >
        <ArrowLeftIcon />
        Back
      </Button>
      <div className="min-w-0 text-right">
        <p className="truncate font-medium text-sm">
          {lessonData.course.title}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          {lessonData.lesson.title}
        </p>
      </div>
    </div>
  );

  return (
    <LearnShell
      bottomBar={
        <LessonBottomBar
          canMarkComplete={canMarkComplete}
          courseId={courseId}
          deadlineAt={lesson.deadlineAt ?? null}
          isCompleted={lessonData.lesson.isCompleted}
          isMarkingComplete={markCompleteMutation.isPending}
          isPastDeadline={isPastDeadline}
          nextIsLocked={lessonData.nav.nextIsLocked}
          nextLessonId={lessonData.nav.nextLessonId}
          onMarkComplete={() =>
            markCompleteMutation.mutate({ courseId, lessonId })
          }
          prevLessonId={lessonData.nav.prevLessonId}
        />
      }
      content={
        <LessonViewer
          key={lessonId}
          onReachedEndChange={setReachedEnd}
          value={lessonData.lesson.content as MyValue}
        />
      }
      header={header}
      sidebar={
        <CourseSidebar
          courseId={courseId}
          currentLessonId={lessonId}
          data={courseData}
        />
      }
    />
  );
}
