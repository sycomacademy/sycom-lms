"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/packages/utils/cn";
import { FeedbackPopover } from "./feedback-popover";

export function DashboardHeader() {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4"
      )}
    >
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <FeedbackPopover />
      </div>
    </header>
  );
}
