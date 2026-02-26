"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createLoggerWithContext } from "@/packages/utils/logger";

const logger = createLoggerWithContext("Error");
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("unhandled error", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="font-semibold text-foreground text-lg">
        Something went wrong
      </h2>
      <p className="max-w-md text-muted-foreground text-sm">
        An unexpected error occurred while loading this page. Please try again
        or contact support if the problem persists.
      </p>
      {error.digest && (
        <p className="font-mono text-muted-foreground text-xs">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          size="sm"
          variant="outline"
        >
          Home
        </Button>
        <Button onClick={reset} size="sm" variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
