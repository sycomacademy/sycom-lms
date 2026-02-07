"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderAuth } from "@/components/layout/header-auth";
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

const breadcrumbLabels: Record<string, string> = {
  "/instructor": "Dashboard",
  "/instructor/courses": "Courses",
  "/instructor/pathways": "Pathways",
};

function getPageLabel(pathname: string): string {
  if (pathname === "/instructor") {
    return "Dashboard";
  }
  if (
    pathname.startsWith("/instructor/courses/") &&
    pathname.includes("/edit")
  ) {
    return "Edit course";
  }
  if (
    pathname.startsWith("/instructor/courses/") &&
    pathname.includes("/curriculum")
  ) {
    return "Curriculum";
  }
  if (
    pathname.startsWith("/instructor/pathways/") &&
    pathname.includes("/edit")
  ) {
    return "Edit pathway";
  }
  return breadcrumbLabels[pathname] ?? "Instructor";
}

export function InstructorHeader() {
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);
  const isRoot = pathname === "/instructor";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-border border-b bg-background px-4 sm:px-6">
      <SidebarTrigger />
      <Separator className="h-4" orientation="vertical" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            {isRoot ? (
              <BreadcrumbPage>Instructor</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link href="/instructor" />}>
                Instructor
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

      <HeaderAuth />
    </header>
  );
}
