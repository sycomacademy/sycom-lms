"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

export function LessonBottomBar({
  courseId,
  prevLessonId,
  nextLessonId,
  nextIsLocked,
  canMarkComplete,
  isCompleted,
  isMarkingComplete,
  onMarkComplete,
}: {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  nextIsLocked: boolean;
  canMarkComplete: boolean;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  onMarkComplete: () => void;
}) {
  const prevHref = prevLessonId
    ? `/learn/course/${courseId}/${prevLessonId}`
    : null;
  const nextHref = nextLessonId
    ? `/learn/course/${courseId}/${nextLessonId}`
    : null;

  let markLabel = "Mark complete";
  if (isCompleted) {
    markLabel = "Completed";
  } else if (isMarkingComplete) {
    markLabel = "Marking...";
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-2">
        {prevHref ? (
          <Button
            nativeButton={false}
            render={<Link href={prevHref as Route} />}
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
            render={<Link href={nextHref as Route} />}
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

      <div className="flex items-center gap-3">
        {isCompleted || canMarkComplete ? null : (
          <p className="text-muted-foreground text-xs">
            Scroll to the end to enable completion.
          </p>
        )}
        <Button
          // disabled={!canMarkComplete || isCompleted || isMarkingComplete}
          onClick={onMarkComplete}
          size="sm"
        >
          {markLabel}
        </Button>
      </div>
    </div>
  );
}
