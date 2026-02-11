"use client";

import {
  BarChart3Icon,
  BookOpenIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/packages/auth/auth-client";

function SidebarSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => router.push("/"),
        },
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-full items-center justify-end px-2 py-2 group-data-[collapsible=icon]:justify-center">
      <Button
        aria-label="Sign out"
        className="w-full justify-start gap-2 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        disabled={pending}
        onClick={handleSignOut}
        size="sm"
        variant="ghost"
      >
        <LogOutIcon className="size-4 shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden">
          {pending ? "Signing out…" : "Sign out"}
        </span>
      </Button>
    </div>
  );
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/dashboard/users", label: "Users", icon: UsersIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3Icon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-sidebar-border border-b">
        <Link
          className="flex items-center gap-2 px-2 py-2 font-semibold text-sidebar-foreground"
          href="/dashboard"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            S
          </span>
          <span className="group-data-[collapsible=icon]:hidden">
            Sycom LMS
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ href, label, icon: Icon }) => (
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
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t">
        <SidebarSignOut />
      </SidebarFooter>
    </Sidebar>
  );
}
