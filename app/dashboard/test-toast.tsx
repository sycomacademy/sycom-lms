"use client";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";

export function TestToast() {
  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: "Hello",
          description: "This is a test toast",
          type: "success",
        })
      }
    >
      Test Toast
    </Button>
  );
}
