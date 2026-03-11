"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { ArrowLeftIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { Suspense, useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { useTRPC } from "@/packages/trpc/client";
import { CourseFinishedDialog } from "./course-finished-dialog";
import { CourseSidebar } from "./course-sidebar";
import { learnParsers } from "./learn-parsers";
import { LearnShell } from "./learn-shell";
import { LessonBottomBar } from "./lesson-bottom-bar";
import type { LessonRequirements } from "./lesson-viewer";
import { LessonViewer } from "./lesson-viewer";

type EnrolledCourse = RouterOutputs["enrollment"]["getEnrolledCourse"];

export function LearnLessonPage({ courseId }: { courseId: string }) {
  const trpc = useTRPC();
  const [lessonId, setLessonId] = useQueryState("lesson", learnParsers.lesson);

  const { data: courseData } = useSuspenseQuery(
    trpc.enrollment.getEnrolledCourse.queryOptions({ courseId })
  );

  useEffect(() => {
    if (lessonId) {
      return;
    }
    const first = courseData.sections
      .flatMap((s) => s.lessons)
      .find((l) => !l.isLocked);
    if (first) {
      setLessonId(first.id);
    }
  }, [lessonId, courseData.sections, setLessonId]);

  if (!lessonId) {
    return null;
  }

  return (
    <Suspense>
      <LessonInner
        courseData={courseData}
        courseId={courseId}
        key={lessonId}
        lessonId={lessonId}
        onNavigateToLesson={setLessonId}
      />
    </Suspense>
  );
}

function LessonInner({
  courseId,
  lessonId,
  courseData,
  onNavigateToLesson,
}: {
  courseId: string;
  lessonId: string;
  courseData: EnrolledCourse;
  onNavigateToLesson: (id: string) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [requirements, setRequirements] = useState<LessonRequirements>({
    hasQuizBlocks: false,
    quizSatisfied: true,
    scrollReachedEnd: false,
    scrollToQuiz: () => undefined,
  });
  const [showFinished, setShowFinished] = useState(false);
  const lessonStartTimeRef = useRef(Date.now());

  // Track course started on first lesson load
  useEffect(() => {
    track({
      event: analyticsEvents.enrollmentCourseStarted,
      course_id: courseId,
      course_title: courseData.course.title,
      progress_percent: courseData.progress.percent,
    });
  }, [courseId, courseData.course.title, courseData.progress.percent]);

  // Track time spent on lesson when unmounting
  useEffect(() => {
    const startTime = lessonStartTimeRef.current;
    return () => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      if (seconds > 2) {
        track({
          event: analyticsEvents.enrollmentLessonTimeSpent,
          course_id: courseId,
          lesson_id: lessonId,
          duration_seconds: seconds,
        });
      }
    };
  }, [courseId, lessonId]);

  const canMarkComplete =
    requirements.scrollReachedEnd && requirements.quizSatisfied;

  let completionBlocker: "scroll" | "quiz" | null = null;
  if (!canMarkComplete) {
    if (requirements.scrollReachedEnd) {
      completionBlocker = "quiz";
    } else {
      completionBlocker = "scroll";
    }
  }

  const { data: lessonData } = useSuspenseQuery(
    trpc.enrollment.getEnrolledLesson.queryOptions({ courseId, lessonId })
  );

  const markCompleteMutation = useMutation(
    trpc.enrollment.markLessonComplete.mutationOptions({
      onSuccess: (result) => {
        queryClient.invalidateQueries({
          queryKey: trpc.enrollment.getEnrolledCourse.queryKey({ courseId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.enrollment.getEnrolledLesson.queryKey({
            courseId,
            lessonId,
          }),
        });

        track({
          event: analyticsEvents.enrollmentLessonCompleted,
          course_id: courseId,
          lesson_id: lessonId,
          lesson_title: lessonData.lesson.title,
          course_title: lessonData.course.title,
        });

        if (result.allComplete) {
          track({
            event: analyticsEvents.enrollmentCourseCompleted,
            course_id: courseId,
            course_title: lessonData.course.title,
          });
          setShowFinished(true);
          return;
        }

        toastManager.add({ title: "Lesson marked complete", type: "success" });

        if (lessonData.nav.nextLessonId && !lessonData.nav.nextIsLocked) {
          onNavigateToLesson(lessonData.nav.nextLessonId);
        }
      },
      onError: (err) => {
        toastManager.add({
          title: "Couldn't mark complete",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  const isFinalLesson = !lessonData.nav.nextLessonId;
  const isMarkingComplete =
    markCompleteMutation.isPending ||
    (markCompleteMutation.isSuccess && !lessonData.lesson.isCompleted);

  const header = (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <Button
        nativeButton={false}
        render={<Link href="/dashboard/journey" />}
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
    <>
      <LearnShell
        bottomBar={
          <LessonBottomBar
            canMarkComplete={canMarkComplete}
            completionBlocker={completionBlocker}
            courseId={courseId}
            isCompleted={lessonData.lesson.isCompleted}
            isFinalLesson={isFinalLesson}
            isMarkingComplete={isMarkingComplete}
            nextIsLocked={lessonData.nav.nextIsLocked}
            nextLessonId={lessonData.nav.nextLessonId}
            onMarkComplete={() =>
              markCompleteMutation.mutate({ courseId, lessonId })
            }
            onScrollToQuiz={requirements.scrollToQuiz}
            prevLessonId={lessonData.nav.prevLessonId}
          />
        }
        content={
          <LessonViewer
            content={lessonData.lesson.content as JSONContent}
            onRequirementsChange={setRequirements}
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
      <CourseFinishedDialog
        courseTitle={lessonData.course.title}
        onOpenChange={setShowFinished}
        open={showFinished}
      />
    </>
  );
}
