"use client";

import { MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardHeaderUser = NonNullable<
  Awaited<ReturnType<typeof import("@/packages/auth/helper").getSession>>
>["user"];

interface DashboardHeaderProps {
  title: string;
  description?: string;
  user: DashboardHeaderUser;
}

export function DashboardHeader({
  title,
  description,
  user,
}: DashboardHeaderProps) {
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
      <div className="flex items-center gap-2">
        <Button
          render={<Link href="/dashboard/feedback" />}
          size="sm"
          variant="ghost"
        >
          <MessageSquareIcon />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
        <DashboardUserMenu user={user} />
      </div>
    </header>
  );
}
