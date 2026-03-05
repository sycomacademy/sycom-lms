"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart2Icon,
  BookOpenIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
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
import { authClient } from "@/packages/auth/auth-client";
import { useDelayedValue } from "@/packages/hooks/use-delayed-value";
import { useIsMobile } from "@/packages/hooks/use-mobile";
import { useUserQuery } from "@/packages/hooks/use-user";
import { cn } from "@/packages/utils/cn";
import { capitalize } from "@/packages/utils/string";
import { OrgSwitcher } from "./org-switcher";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// ── Shared item groups ─────────────────────────────────────────────────────

const GENERAL: NavItem[] = [
  { href: "/dashboard/support", label: "Support", icon: HeadphonesIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

// ── Nav config keyed by effective role ────────────────────────────────────

type NavRole =
  | "platform_admin"
  | "content_creator"
  | "platform_student"
  | "org_owner"
  | "org_admin"
  | "org_teacher"
  | "org_auditor"
  | "org_student";

/**
 * Groups displayed in the sidebar per effective role.
 * Keys become the section labels (capitalized with spaces).
 */
const NAV: Record<NavRole, Record<string, NavItem[]>> = {
  // ── Platform roles ──────────────────────────────────────────────────────
  platform_admin: {
    platform: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/admin", label: "Admin", icon: ShieldIcon },
      {
        href: "/dashboard/admin/reports",
        label: "Reports",
        icon: BarChart2Icon,
      },
    ],
    courses: [
      {
        href: "/dashboard/courses",
        label: "All Courses",
        icon: GraduationCapIcon,
      },
    ],
    general: GENERAL,
  },

  content_creator: {
    workspace: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      {
        href: "/dashboard/courses",
        label: "My Courses",
        icon: GraduationCapIcon,
      },
    ],
    general: GENERAL,
  },

  platform_student: {
    learning: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/library", label: "Library", icon: LibraryIcon },
      {
        href: "/dashboard/journey",
        label: "My Courses",
        icon: BookOpenIcon,
      },
    ],
    general: GENERAL,
  },

  // ── Org roles ────────────────────────────────────────────────────────────
  org_owner: {
    overview: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
    ],
    courses: [
      {
        href: "/dashboard/courses",
        label: "Courses",
        icon: GraduationCapIcon,
      },
    ],
    general: GENERAL,
  },

  org_admin: {
    overview: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
    ],
    courses: [
      {
        href: "/dashboard/courses",
        label: "Courses",
        icon: GraduationCapIcon,
      },
    ],
    general: GENERAL,
  },

  org_teacher: {
    teaching: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      {
        href: "/dashboard/courses",
        label: "My Courses",
        icon: GraduationCapIcon,
      },
    ],
    general: GENERAL,
  },

  org_auditor: {
    overview: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      {
        href: "/dashboard/admin/reports",
        label: "Reports",
        icon: BarChart2Icon,
      },
    ],
    general: GENERAL,
  },

  org_student: {
    learning: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/library", label: "Library", icon: LibraryIcon },
      {
        href: "/dashboard/journey",
        label: "My Courses",
        icon: BookOpenIcon,
      },
    ],
    general: GENERAL,
  },
};

// ── Styles ────────────────────────────────────────────────────────────────

const menuButtonIconClass = "[&_svg]:size-5";

const menuButtonCollapseClass =
  "group-data-[collapsible=icon]:size-auto! group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:min-h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-2!  group-data-[collapsible=icon]:[&>span:last-child]:hidden";

const groupLabelCollapseClass =
  "group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:opacity-100";

// ── Component ─────────────────────────────────────────────────────────────

const PUBLIC_ORG_SLUG = "platform";

export function AppSidebar() {
  const { user } = useUserQuery();
  const { open } = useSidebar();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isOpen = useDelayedValue(open, 195);

  const { data: orgs } = authClient.useListOrganizations();
  const { data: activeMember } = authClient.useActiveMember();

  const activeOrg = orgs?.find((o) => o.id === activeMember?.organizationId);
  const isPublicOrg = !activeOrg || activeOrg.slug === PUBLIC_ORG_SLUG;

  const effectiveRole: NavRole = isPublicOrg
    ? ((user?.role as NavRole | undefined) ?? "platform_student")
    : ((activeMember?.role as NavRole | undefined) ?? "org_student");

  const navGroups = NAV[effectiveRole];

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
        <OrgSwitcher />
      </SidebarFooter>
    </Sidebar>
  );
}
