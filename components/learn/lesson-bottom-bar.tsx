"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

function formatDeadline(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function LessonBottomBar({
  courseId,
  prevLessonId,
  nextLessonId,
  nextIsLocked,
  canMarkComplete,
  isCompleted,
  isMarkingComplete,
  isPastDeadline,
  deadlineAt,
  onMarkComplete,
}: {
  courseId: string;
  prevLessonId: string | null;
  nextLessonId: string | null;
  nextIsLocked: boolean;
  canMarkComplete: boolean;
  isCompleted: boolean;
  isMarkingComplete: boolean;
  isPastDeadline?: boolean;
  deadlineAt?: Date | string | null;
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
  } else if (isPastDeadline) {
    markLabel = "Deadline passed";
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
        {deadlineAt != null && !isPastDeadline && (
          <p className="text-muted-foreground text-xs">
            Due by {formatDeadline(deadlineAt)}
          </p>
        )}
        {isPastDeadline && (
          <p className="text-muted-foreground text-xs">
            Time limit passed. Completion is no longer available.
          </p>
        )}
        {!(deadlineAt || isPastDeadline || isCompleted || canMarkComplete) && (
          <p className="text-muted-foreground text-xs">
            Scroll to the end to enable completion.
          </p>
        )}
        <Button
          disabled={
            !canMarkComplete ||
            isCompleted ||
            isMarkingComplete ||
            isPastDeadline
          }
          onClick={onMarkComplete}
          size="sm"
        >
          {markLabel}
        </Button>
      </div>
    </div>
  );
}
