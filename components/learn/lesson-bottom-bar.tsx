"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

export function LessonBottomBar({
  courseId,
  prevLessonId,
  nextLessonId,
  nextIsLocked,
  canMarkComplete,
  completionBlocker,
  isCompleted,
  isMarkingComplete,
  onMarkComplete,
}: {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  nextIsLocked: boolean;
  canMarkComplete: boolean;
  completionBlocker?: "scroll" | "quiz" | null;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  onMarkComplete: () => void;
}) {
  const prevHref = prevLessonId
    ? (`/learn/${courseId}?lesson=${prevLessonId}` as Route)
    : null;
  const nextHref = nextLessonId
    ? (`/learn/${courseId}?lesson=${nextLessonId}` as Route)
    : null;

  let markLabel = "Mark complete";
  if (isCompleted) {
    markLabel = "Completed";
  } else if (isMarkingComplete) {
    markLabel = "Marking...";
  }

  let tooltipContent = "Mark this lesson as complete";
  if (!canMarkComplete && completionBlocker === "quiz") {
    tooltipContent = "Answer the quiz correctly to enable completion";
  } else if (!canMarkComplete) {
    tooltipContent = "Scroll to the end to enable completion";
  } else if (isCompleted) {
    tooltipContent = "Already completed";
  }

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
                disabled={!canMarkComplete || isCompleted || isMarkingComplete}
                onClick={onMarkComplete}
                size="sm"
              >
                {markLabel}
              </Button>
            </span>
          }
        />
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </div>
  );
}
