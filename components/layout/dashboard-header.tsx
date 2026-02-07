"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderAuth } from "./header-auth";

const breadcrumbLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/courses": "Modules",
  "/dashboard/wishlist": "Wishlist",
  "/dashboard/faq": "FAQ",
  "/dashboard/feedback": "Report Feedback",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/general": "Settings",
  "/dashboard/settings/auth": "Settings",
  "/dashboard/settings/notifications": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();

  const pageLabel = breadcrumbLabels[pathname] ?? "Dashboard";
  const isRoot = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-border border-b bg-background px-4 sm:px-6">
      <SidebarTrigger />
      <Separator className="h-4" orientation="vertical" />

      {/* Breadcrumbs */}
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            {isRoot ? (
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/dashboard" />}>
                Dashboard
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isRoot && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right side */}
      <HeaderAuth />
    </header>
  );
}
