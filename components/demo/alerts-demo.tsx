"use client";

import { InfoIcon } from "lucide-react";
import { BlockWrapper } from "@/components/demo/wrapper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertsDemo() {
  return (
    <BlockWrapper title="Alerts">
      <div className="flex flex-col gap-4">
        <Alert>
          <InfoIcon />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>
            This is a default alert with a title and description.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    </BlockWrapper>
  );
}
