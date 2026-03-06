"use client";

import { cn } from "@/packages/utils/cn";

export function LearnShell({
  className,
  sidebar,
  header,
  content,
  bottomBar,
}: {
  className?: string;
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  content: React.ReactNode;
  bottomBar: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-h-dvh w-full", className)}>
      <aside className="hidden w-80 shrink-0 border-border border-r bg-muted/20 lg:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {header ? (
          <div className="sticky top-0 z-10 border-border border-b bg-background/80 backdrop-blur">
            {header}
          </div>
        ) : null}
        <div className="min-h-0 flex-1">{content}</div>
        <div className="sticky bottom-0 z-10 border-border border-t bg-background/80 backdrop-blur">
          {bottomBar}
        </div>
      </div>
    </div>
  );
}
