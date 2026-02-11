"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Session shape from getSession() after redirect (non-null): has user and session. */
type DashboardSession = NonNullable<
  Awaited<ReturnType<typeof import("@/packages/auth/helper").getSession>>
>;

const pathnameToTitle: Record<string, { title: string; description?: string }> =
  {
    "/dashboard": {
      title: "Overview",
      description: "Your learning platform at a glance",
    },
    "/dashboard/library": {
      title: "Library",
      description: "Browse learning content",
    },
    "/dashboard/journey": {
      title: "My journey",
      description: "Your progress and pathways",
    },
    "/dashboard/support": {
      title: "Support",
      description: "Get help and resources",
    },
    "/dashboard/account": {
      title: "Account",
      description: "Profile and preferences",
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
    "/dashboard/feedback": {
      title: "Feedback",
      description: "Send us your feedback",
    },
    "/dashboard/help": {
      title: "Help",
      description: "Documentation and support",
    },
    "/dashboard/admin": {
      title: "Admin",
      description: "Administration",
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

interface DashboardShellProps {
  children: React.ReactNode;
  session: DashboardSession;
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  const pathname = usePathname();
  const { title, description } = getHeaderForPath(pathname);

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <DashboardHeader
          description={description}
          title={title}
          user={session.user}
        />
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
