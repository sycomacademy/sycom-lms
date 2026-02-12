"use client";

import {
  BookOpenIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/library", label: "Library", icon: LibraryIcon },
  { href: "/dashboard/journey", label: "My journey", icon: BookOpenIcon },
  { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
  { href: "/dashboard/account", label: "Account", icon: UserIcon },
] as const;

const myCoursesNavItem = {
  href: "/dashboard/courses",
  label: "My courses",
  icon: BookOpenIcon,
} as const;

const adminNavItem = {
  href: "/dashboard/admin",
  label: "Admin",
  icon: ShieldCheckIcon,
} as const;

export function AppSidebar() {
  const pathname = usePathname();
  const isInstructor = false;
  const isAdmin = false;

  return (
    <Sidebar
      className="border-sidebar-border"
      collapsible="icon"
      variant="inset"
    >
      <SidebarHeader className="border-sidebar-border">
        <Link
          className="flex items-center gap-2 font-semibold text-sidebar-foreground"
          href="/dashboard"
        >
          <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            S
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={pathname === href}
                    render={<Link href={href} />}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isInstructor ? (
          <SidebarGroup>
            <SidebarGroupLabel>Instructor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === myCoursesNavItem.href}
                    render={<Link href={myCoursesNavItem.href} />}
                    tooltip={myCoursesNavItem.label}
                  >
                    <BookOpenIcon />
                    <span>{myCoursesNavItem.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === adminNavItem.href}
                    render={<Link href={adminNavItem.href} />}
                    tooltip={adminNavItem.label}
                  >
                    <ShieldCheckIcon />
                    <span>{adminNavItem.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton tooltip="Help & support">
                <HelpCircleIcon />
                <span>Help</span>
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent align="start" side="right" sideOffset={4}>
            <DropdownMenuItem render={<Link href="/dashboard/help" />}>
              Help
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/support" />}>
              Contact us
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/help#faq" />}>
              FAQ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
