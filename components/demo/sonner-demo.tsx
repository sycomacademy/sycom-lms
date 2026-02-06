"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function SonnerDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          toast.success("Success! Your changes have been saved.");
        }}
      >
        Success Toast
      </Button>
      <Button
        onClick={() => {
          toast.error("Error! Something went wrong.");
        }}
        variant="destructive"
      >
        Error Toast
      </Button>
      <Button
        onClick={() => {
          toast.warning("Warning! Please review your input.");
        }}
        variant="outline"
      >
        Warning Toast
      </Button>
      <Button
        onClick={() => {
          toast.info("Info: This is an informational message.");
        }}
        variant="secondary"
      >
        Info Toast
      </Button>
      <Button
        onClick={() => {
          const toastId = toast.loading("Loading...");
          setTimeout(() => {
            toast.success("Loaded successfully!", { id: toastId });
          }, 2000);
        }}
        variant="outline"
      >
        Loading Toast
      </Button>
      <Button
        onClick={() => {
          toast("Default toast message", {
            description: "This is a description for the toast.",
          });
        }}
        variant="ghost"
      >
        Default Toast
      </Button>
      <Button
        onClick={() => {
          toast.success("Action completed", {
            description: "Your profile has been updated successfully.",
            action: {
              label: "Undo",
              onClick: () => toast.info("Undo clicked"),
            },
          });
        }}
        variant="outline"
      >
        Toast with Action
      </Button>
      <Button
        onClick={() => {
          toast.success("Persistent toast", {
            duration: Number.POSITIVE_INFINITY,
            description: "This toast will stay until dismissed.",
          });
        }}
        variant="secondary"
      >
        Persistent Toast
      </Button>
    </div>
  );
}
