"use client";

import type { Route } from "next";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { type ComponentType, Suspense } from "react";
import { Blocks } from "@/components/icons/animated/blocks";
import { Layers } from "@/components/icons/animated/layers";
import { LayoutDashboard } from "@/components/icons/animated/layout-dashboard";
import { MessageCircleQuestion } from "@/components/icons/animated/message-circle-question";
import { MessageSquareCode } from "@/components/icons/animated/message-square-code";
import { Settings } from "@/components/icons/animated/settings";
import { Users } from "@/components/icons/animated/users";
import { AnimateIcon } from "@/components/icons/core/icon";
import { Link } from "@/components/layout/foresight-link";
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
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/packages/db/schema/auth";
import { useDelayedValue } from "@/packages/hooks/use-delayed-value";
import { useIsMobile } from "@/packages/hooks/use-mobile";
import { useUserQuery } from "@/packages/hooks/use-user";
import { cn } from "@/packages/utils/cn";
import { capitalize } from "@/packages/utils/string";

interface NavItem {
  href: Route;
  label: string;
  icon: ComponentType<{ size?: number; animateOnHover?: boolean }>;
}

const GENERAL: NavItem[] = [
  { href: "/dashboard/support", label: "Support", icon: MessageCircleQuestion },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

/**
 * Groups displayed in the sidebar per effective role.
 * Keys become the section labels (capitalized with spaces).
 */
const NAV: Record<UserRole, Record<string, NavItem[]>> = {
  // ── Platform roles ──────────────────────────────────────────────────────
  platform_admin: {
    Main: [
      {
        href: "/dashboard/admin",
        label: "Overview",
        icon: LayoutDashboard,
      },
      { href: "/dashboard/admin/users", label: "Users", icon: Users },
    ],
    courses: [
      {
        href: "/dashboard/courses",
        label: "All Courses",
        icon: Layers,
      },
      {
        href: "/dashboard/blog" as Route,
        label: "All Posts",
        icon: MessageSquareCode,
      },
    ],
    general: GENERAL,
  },

  content_creator: {
    Main: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      {
        href: "/dashboard/courses",
        label: "My Courses",
        icon: Layers,
      },
      {
        href: "/dashboard/blog" as Route,
        label: "My Posts",
        icon: MessageSquareCode,
      },
    ],
    general: GENERAL,
  },

  platform_student: {
    learning: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/library", label: "Library", icon: Blocks },
      {
        href: "/dashboard/journey",
        label: "My Courses",
        icon: Layers,
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

export function AppSidebar() {
  return (
    <Suspense fallback={<AppSidebarSkeleton />}>
      <AppSidebarContent />
    </Suspense>
  );
}

export function AppSidebarSkeleton() {
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
          <Image
            alt="Sycom"
            className="h-10 w-auto group-data-[collapsible=icon]:hidden"
            height={40}
            priority
            src="/logos/logo.jpg"
            width={160}
          />
          <Image
            alt="Sycom"
            className="hidden size-10 rounded-md group-data-[collapsible=icon]:block"
            height={40}
            priority
            src="/logos/logo.jpg"
            width={40}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {Array.from({ length: 2 }, (_, groupIndex) => (
          <SidebarGroup key={`sidebar-skeleton-group-${groupIndex}`}>
            <SidebarGroupLabel>Loading</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {Array.from(
                  { length: groupIndex === 0 ? 3 : 2 },
                  (_, itemIndex) => (
                    <SidebarMenuItem
                      key={`sidebar-skeleton-item-${groupIndex}-${itemIndex}`}
                    >
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}

function AppSidebarContent() {
  const { user } = useUserQuery();
  const { open } = useSidebar();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isOpen = useDelayedValue(open, 195);

  if (!user) {
    return <AppSidebarSkeleton />;
  }

  const role = (user.role ?? "platform_student") as UserRole;
  const navGroups = NAV[role];
  const navEntries = Object.entries(navGroups) as [string, NavItem[]][];

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
          <Image
            alt="Sycom"
            className="h-10 w-auto group-data-[collapsible=icon]:hidden"
            height={40}
            priority
            src="/logo/logo.jpg"
            width={160}
          />
          <Image
            alt="Sycom"
            className="hidden size-10 rounded-md group-data-[collapsible=icon]:block"
            height={40}
            priority
            src="/logo/logo.jpg"
            width={40}
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navEntries.map(([groupLabel, items]) => (
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
                {items.map(({ href, label, icon: Icon }) => {
                  return (
                    <SidebarMenuItem key={href}>
                      <AnimateIcon animateOnHover>
                        <SidebarMenuButton
                          className={cn(
                            "text-sm",
                            menuButtonIconClass,
                            menuButtonCollapseClass,
                            isOpen || isMobile ? "" : "justify-center"
                          )}
                          isActive={pathname === href}
                          render={<Link href={href} />}
                          size="lg"
                          tooltip={label}
                        >
                          <Icon size={20} />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </AnimateIcon>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>{/* <OrgSwitcher /> */}</SidebarFooter>
    </Sidebar>
  );
}
