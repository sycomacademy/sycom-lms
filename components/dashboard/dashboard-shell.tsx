"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { DashboardHeader } from "./dashboard-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className="flex flex-col md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0"
        role="main"
      >
        <DashboardHeader />
        <Separator aria-hidden="true" className="bg-secondary" />
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
