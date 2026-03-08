"use client";

import { AlertCircleIcon } from "lucide-react";
import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";

export default function EditCourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNotFound =
    error.message === "Course not found" ||
    error.message === "You do not have access to this course";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="min-w-0">
        <BackButton className="px-0" />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircleIcon className="size-6 text-destructive" />
        </div>
        <h2 className="font-semibold text-foreground text-lg">
          {isNotFound ? "Course not found" : "Something went wrong"}
        </h2>
        <p className="max-w-md text-muted-foreground text-sm">
          {isNotFound
            ? "This course doesn't exist or you don't have permission to edit it."
            : "An unexpected error occurred while loading this course. Please try again."}
        </p>
        {!isNotFound && (
          <Button onClick={reset} size="sm" variant="outline">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
