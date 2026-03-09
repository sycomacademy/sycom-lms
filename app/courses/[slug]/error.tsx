"use client";

import { AlertTriangle } from "lucide-react";
import type { Route } from "next";
import { useEffect } from "react";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { captureException } from "@/packages/analytics/client";
import { createLoggerWithContext } from "@/packages/utils/logger";

const logger = createLoggerWithContext("PublicCourseError");

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("unhandled public course error", error);
    captureException(error, { digest: error.digest, route: "public-course" });
  }, [error]);

  return (
    <main className="min-h-screen">
      <section className="container mx-auto flex min-h-[60vh] items-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertTriangle className="size-6" />
          </div>
          <p className="mb-3 font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Courses
          </p>
          <h1 className="mb-4 font-bold text-4xl text-foreground tracking-tight">
            We could not load this course
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground text-sm sm:text-base">
            Something unexpected happened while loading this course page. Try
            again, or return to the courses index.
          </p>
          {error.digest ? (
            <p className="mb-8 font-mono text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          ) : null}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={reset}>Try again</Button>
            <Button
              nativeButton={false}
              render={<Link href={"/courses" as Route} />}
              variant="outline"
            >
              Back to courses
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
