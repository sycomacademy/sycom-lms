import { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageSquareMoreIcon,
  type MessageSquareMoreIconHandle,
} from "../icons/feedback";
import { Button } from "../ui/button";
import { FeedbackForm } from "./feedback-form";

export function FeedbackPopover() {
  const iconRef = useRef<MessageSquareMoreIconHandle>(null);
  const [open, setOpen] = useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        render={
          <Button size="icon" variant="ghost">
            <MessageSquareMoreIcon ref={iconRef} size={20} />
          </Button>
        }
      />
      <PopoverContent className="w-80" side="top">
        <div className="space-y-1">
          <h3 className="font-medium text-foreground text-sm">Send feedback</h3>
          <p className="text-muted-foreground text-xs">
            Help us improve Sycom by sharing your thoughts.
          </p>
        </div>
        <FeedbackForm onSubmitted={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
