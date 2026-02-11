"use client";

import type React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { getSession } from "@/packages/auth/helper";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";

type DashboardShellUser = NonNullable<
  Awaited<ReturnType<typeof getSession>>
>["user"];

interface DashboardShellProps {
  children: React.ReactNode;
  user: DashboardShellUser;
  title?: string;
  description?: string;
}

export function DashboardShell({
  children,
  user,
  title = "Dashboard",
  description,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset
        className="flex flex-col md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0"
        role="main"
      >
        <DashboardHeader
          title={title}
          description={description}
          user={user}
        />
        <Separator aria-hidden="true" className="bg-secondary" />
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
