"use client";

import { useState } from "react";
import { MessageSquareMore } from "@/components/icons/animated/message-square-more";
import { AnimateIcon } from "@/components/icons/core/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { FeedbackForm } from "./feedback-form";

export function FeedbackPopover() {
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <AnimateIcon animateOnHover>
        <PopoverTrigger
          className="hidden md:flex"
          render={
            <Button variant="ghost">
              <MessageSquareMore size={20} />
              Feedback
            </Button>
          }
        />
      </AnimateIcon>

      <PopoverContent align="end" className="w-80" side="top">
        <div className="mb-2 w-full space-y-1">
          <h3 className="font-medium text-foreground text-sm">Send feedback</h3>
          <p className="text-muted-foreground text-xs">
            Help us improve by sharing your thoughts.
          </p>
        </div>
        <FeedbackForm onSubmitted={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
