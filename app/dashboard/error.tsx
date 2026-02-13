"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error so it's visible in the console for client-side debugging
    console.error("[dashboard] unhandled error", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
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
      <Button onClick={reset} size="sm" variant="outline">
        Try again
      </Button>
    </div>
  );
}
