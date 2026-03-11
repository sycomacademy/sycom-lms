"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

function getMarkLabel(
  isFinalLesson: boolean,
  isCompleted: boolean,
  isMarkingComplete: boolean
) {
  if (isCompleted) {
    return isFinalLesson ? "Finished" : "Completed";
  }
  if (isMarkingComplete) {
    return isFinalLesson ? "Finishing..." : "Marking...";
  }
  return isFinalLesson ? "Finish" : "Mark complete";
}

function getTooltipContent(
  isFinalLesson: boolean,
  canMarkComplete: boolean,
  completionBlocker: "scroll" | "quiz" | null | undefined,
  isCompleted: boolean
) {
  if (!canMarkComplete && completionBlocker === "quiz") {
    return "Answer the quiz correctly to enable completion";
  }
  if (!canMarkComplete) {
    return "Scroll to the end to enable completion";
  }
  if (isCompleted) {
    return isFinalLesson ? "Course already finished" : "Already completed";
  }
  return isFinalLesson ? "Finish this course" : "Mark this lesson as complete";
}

export function LessonBottomBar({
  courseId,
  prevLessonId,
  nextLessonId,
  nextIsLocked,
  isFinalLesson,
  canMarkComplete,
  completionBlocker,
  isCompleted,
  isMarkingComplete,
  onMarkComplete,
  onScrollToQuiz,
}: {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  nextIsLocked: boolean;
  isFinalLesson: boolean;
  canMarkComplete: boolean;
  completionBlocker?: "scroll" | "quiz" | null;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  onMarkComplete: () => void;
  onScrollToQuiz?: () => void;
}) {
  const prevHref = prevLessonId
    ? (`/learn/${courseId}?lesson=${prevLessonId}` as Route)
    : null;
  const nextHref = nextLessonId
    ? (`/learn/${courseId}?lesson=${nextLessonId}` as Route)
    : null;

  const markLabel = getMarkLabel(isFinalLesson, isCompleted, isMarkingComplete);
  const tooltipText = getTooltipContent(
    isFinalLesson,
    canMarkComplete,
    completionBlocker,
    isCompleted
  );
  const quizBlocking = !canMarkComplete && completionBlocker === "quiz";

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        {prevHref ? (
          <Button
            nativeButton={false}
            render={<Link href={prevHref} />}
            size="sm"
            variant="outline"
          >
            <ChevronLeftIcon />
            Previous
          </Button>
        ) : (
          <Button disabled size="sm" variant="outline">
            <ChevronLeftIcon />
            Previous
          </Button>
        )}

        {nextHref ? (
          <Button
            className={cn(nextIsLocked && "cursor-not-allowed")}
            disabled={nextIsLocked}
            nativeButton={false}
            render={<Link href={nextHref} />}
            size="sm"
            variant="outline"
          >
            Next
            <ChevronRightIcon />
          </Button>
        ) : (
          <Button disabled size="sm" variant="outline">
            Next
            <ChevronRightIcon />
          </Button>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-block">
              <Button
                disabled={
                  isCompleted ||
                  isMarkingComplete ||
                  !(canMarkComplete || quizBlocking)
                }
                onClick={() => {
                  if (quizBlocking) {
                    onScrollToQuiz?.();
                    return;
                  }
                  onMarkComplete();
                }}
                size="sm"
                variant={quizBlocking ? "outline" : "default"}
              >
                {markLabel}
              </Button>
            </span>
          }
        />
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </div>
  );
}
