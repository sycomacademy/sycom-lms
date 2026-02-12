import { useState } from "react";
import { Icon } from "@/components/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAnimatedIcon } from "@/packages/hooks/use-animated-icon";
import { Button } from "../ui/button";
import { FeedbackForm } from "./feedback-form";

const { MessageSquareMoreIcon } = Icon;

export function FeedbackPopover() {
  const [open, setOpen] = useState(false);
  const [iconRef, iconHover] = useAnimatedIcon();

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        {...iconHover}
        className="hidden md:flex"
        render={
          <Button variant="ghost">
            <MessageSquareMoreIcon ref={iconRef} size={20} />
            Feedback
          </Button>
        }
      />
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
