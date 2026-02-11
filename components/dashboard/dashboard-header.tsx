"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-border border-b px-4">
      <SidebarTrigger />
      <Separator className="h-6" orientation="vertical" />
      <div className="flex flex-1 flex-col gap-0.5">
        <h1 className="font-semibold text-foreground text-sm tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
