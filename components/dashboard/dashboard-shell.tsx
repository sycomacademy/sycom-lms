"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const pathnameToTitle: Record<string, { title: string; description?: string }> =
  {
    "/dashboard": {
      title: "Overview",
      description: "Your learning platform at a glance",
    },
    "/dashboard/courses": {
      title: "Courses",
      description: "Manage courses and content",
    },
    "/dashboard/users": {
      title: "Users",
      description: "Learners and instructors",
    },
    "/dashboard/analytics": {
      title: "Analytics",
      description: "Reports and insights",
    },
    "/dashboard/settings": {
      title: "Settings",
      description: "Platform configuration",
    },
  };

function getHeaderForPath(pathname: string) {
  return (
    pathnameToTitle[pathname] ?? {
      title: "Dashboard",
      description: undefined,
    }
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { title, description } = getHeaderForPath(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader description={description} title={title} />
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
