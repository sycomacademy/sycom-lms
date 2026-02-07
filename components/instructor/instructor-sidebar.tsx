"use client";

import {
  BookOpenIcon,
  LayoutDashboardIcon,
  MapIcon,
  RouteIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const instructorNav = [
  {
    label: "Dashboard",
    href: "/instructor",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    label: "Courses",
    href: "/instructor/courses",
    icon: BookOpenIcon,
    exact: false,
  },
  {
    label: "Pathways",
    href: "/instructor/pathways",
    icon: RouteIcon,
    exact: false,
  },
];

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href || pathname === href.split("#")[0];
  }
  return pathname.startsWith(href);
}

export function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <Link className="flex items-center gap-2" href="/instructor">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <MapIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            Instructor
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {instructorNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(pathname, item.href, item.exact)}
                    render={<Link href={item.href} />}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
