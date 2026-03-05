"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { useDelayedValue } from "@/packages/hooks/use-delayed-value";
import { useIsMobile } from "@/packages/hooks/use-mobile";
import { useUserQuery } from "@/packages/hooks/use-user";
import { cn } from "@/packages/utils/cn";
import { capitalize } from "@/packages/utils/string";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Role-keyed sidebar config: each role has groups (label → array of links). No shared main group. */
const SIDEBAR_NAV_CONFIG: Record<
  "student" | "instructor" | "admin",
  Record<string, NavItem[]>
> = {
  student: {
    main: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/library", label: "Library", icon: LibraryIcon },
      { href: "/dashboard/journey", label: "My courses", icon: BookOpenIcon },
      { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
      { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
  instructor: {
    main: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      {
        href: "/dashboard/courses",
        label: "My Courses",
        icon: GraduationCapIcon,
      },
      // { href: "/dashboard/library", label: "Library", icon: LibraryIcon },
      { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
      { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
  admin: {
    admin: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/admin", label: "Admin", icon: ShieldIcon },
      { href: "/dashboard/courses", label: "Courses", icon: GraduationCapIcon },
    ],
    other: [
      { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
      { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
};

/** Icon size one step up from default (size-4 → size-5) in both states. */
const menuButtonIconClass = "[&_svg]:size-5";

/** Keep menu button height/padding when collapsed, center icon, hide label to avoid letter peek. */
const menuButtonCollapseClass =
  "group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:min-h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-2!  group-data-[collapsible=icon]:[&>span:last-child]:hidden";

/** Keep group label visible and centered when sidebar is collapsed (no layout shift). */
const groupLabelCollapseClass =
  "group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:opacity-100 ";

const DEFAULT_ROLE: keyof typeof SIDEBAR_NAV_CONFIG = "student";

export function AppSidebar() {
  const { role } = useUserQuery();
  const { open } = useSidebar();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isOpen = useDelayedValue(open, 195);
  const roleKey =
    role === "instructor" || role === "admin" ? role : DEFAULT_ROLE;
  const navGroups = SIDEBAR_NAV_CONFIG[roleKey];

  return (
    <Sidebar
      className="border-sidebar-border"
      collapsible="icon"
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
        {Object.entries(navGroups).map(([groupLabel, items]) => (
          <SidebarGroup key={groupLabel}>
            <SidebarGroupLabel
              className={cn(
                groupLabelCollapseClass,
                isOpen || isMobile ? "" : "justify-center"
              )}
            >
              {capitalize(groupLabel)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      className={cn(
                        "text-sm",
                        menuButtonIconClass,
                        menuButtonCollapseClass,
                        isOpen || isMobile ? "" : "justify-center"
                      )}
                      isActive={pathname === href}
                      render={
                        <Link
                          href={href as ComponentProps<typeof Link>["href"]}
                        />
                      }
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
        ))}
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                className={cn(
                  "text-sm",
                  menuButtonIconClass,
                  menuButtonCollapseClass,
                  !isOpen && "justify-center"
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
            <DropdownMenuItem render={<Link href="/dashboard/support" />}>
              Help
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/support" />}>
              Contact us
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard/support" />}>
              FAQ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
