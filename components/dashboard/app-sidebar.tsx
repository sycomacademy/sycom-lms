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
import { useIsMobile } from "@/packages/hooks/use-mobile";
import { useUserQuery } from "@/packages/hooks/use-user";
import { cn } from "@/packages/utils/cn";

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

/** Icon size one step up from default (size-4 → size-5) in both states. */
const menuButtonIconClass = "[&_svg]:size-5";

/** Keep menu button height/padding when collapsed, center icon, hide label to avoid letter peek. */
const menuButtonCollapseClass =
  "group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:min-h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span:last-child]:hidden";

/** Keep group label visible and centered when sidebar is collapsed (no layout shift). */
const groupLabelCollapseClass =
  "group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:justify-center";

export function AppSidebar() {
  const { role } = useUserQuery();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const isInstructor = role === "instructor";
  const isAdmin = role === "admin";

  return (
    <Sidebar
      className="border-sidebar-border"
      collapsible="icon"
      side={isMobile ? "right" : "left"}
      variant="inset"
    >
      <SidebarHeader className="border-sidebar-border">
        <Link
          className="flex items-center gap-2 font-semibold text-sidebar-foreground text-sm"
          href="/dashboard"
        >
          <span className="flex size-10 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            S
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={groupLabelCollapseClass}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    className={cn(
                      "text-sm",
                      menuButtonIconClass,
                      menuButtonCollapseClass
                    )}
                    isActive={pathname === href}
                    render={<Link href={href} />}
                    size="lg"
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
            <SidebarGroupLabel className={groupLabelCollapseClass}>
              Teach
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={cn(
                      "text-sm",
                      menuButtonIconClass,
                      menuButtonCollapseClass
                    )}
                    isActive={pathname === myCoursesNavItem.href}
                    render={<Link href={myCoursesNavItem.href} />}
                    size="lg"
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
            <SidebarGroupLabel className={groupLabelCollapseClass}>
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={cn(
                      "text-sm",
                      menuButtonIconClass,
                      menuButtonCollapseClass
                    )}
                    isActive={pathname === adminNavItem.href}
                    render={<Link href={adminNavItem.href} />}
                    size="lg"
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
              <SidebarMenuButton
                className={cn(
                  "text-sm",
                  menuButtonIconClass,
                  menuButtonCollapseClass
                )}
                size="lg"
                tooltip="Help & support"
              >
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
