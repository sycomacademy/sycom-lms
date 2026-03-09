"use client";

import { Facehash } from "facehash";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Suspense, useState } from "react";
import { LayoutDashboard } from "@/components/icons/animated/layout-dashboard";
import { LogOut } from "@/components/icons/animated/log-out";
import { MessageCircleQuestion } from "@/components/icons/animated/message-circle-question";
import { Settings } from "@/components/icons/animated/settings";
import { User } from "@/components/icons/animated/user";
import { AnimateIcon } from "@/components/icons/core/icon";
import { ThemeToggleIcon } from "@/components/icons/theme-toggle-icon";
import { Link } from "@/components/layout/foresight-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";
import { useKeyboardShortcutLabels } from "../layout/keyboard-shortcuts";
import { toastManager } from "../ui/toast";

const PLATFORM_PREFIX_RE = /^platform_/;
const ORG_PREFIX_RE = /^org_/;
const UNDERSCORE_RE = /_/g;
const WORD_START_RE = /\b\w/g;

function formatRole(role: string): string {
  const prefix = role.startsWith("platform_")
    ? PLATFORM_PREFIX_RE
    : ORG_PREFIX_RE;
  return role
    .replace(prefix, "")
    .replace(UNDERSCORE_RE, " ")
    .replace(WORD_START_RE, (c) => c.toUpperCase());
}

export function DashboardUserMenu() {
  return (
    <Suspense fallback={<DashboardUserMenuSkeleton />}>
      <DashboardUserMenuContent />
    </Suspense>
  );
}

export function DashboardUserMenuSkeleton() {
  return <Skeleton className="size-10" />;
}

function DashboardUserMenuContent() {
  const router = useRouter();
  const { profile, user, isPending } = useUserQuery();
  const { setTheme, resolvedTheme } = useTheme();
  const shortcuts = useKeyboardShortcutLabels();
  const [signOutPending, setSignOutPending] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  async function handleSignOut() {
    setSignOutPending(true);
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
          router.push("/");
        },
      },
    });
    if (error) {
      setSignOutPending(false);
      toastManager.add({
        title: "Error",
        description: error.message ?? "Something went wrong. Please try again.",
        type: "error",
      });
    }
  }

  if (!user) {
    return <DashboardUserMenuSkeleton />;
  }
  const enableFacehash = profile?.settings?.enableFacehash ?? true;
  const facehashName = `${user.name}`;
  const initial =
    user.name?.trim().charAt(0)?.toUpperCase() ??
    user.email?.charAt(0)?.toUpperCase() ??
    "?";
  const logoutDisabled = isPending || signOutPending;
  const logoutLabel = signOutPending ? "Signing out…" : "Log out";

  const roleBadge = formatRole(user.role ?? "platform_student");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button aria-label="Open user menu" size="icon-lg" variant="ghost">
            <Avatar>
              {user.image ? (
                <AvatarImage alt={user.name ?? "User"} src={user.image} />
              ) : null}
              <AvatarFallback>
                {enableFacehash ? (
                  <Facehash
                    enableBlink
                    intensity3d="dramatic"
                    name={facehashName}
                    size={32}
                  />
                ) : (
                  initial
                )}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-foreground text-sm">
                {user.name ?? "User"}
              </p>
              {user.email ? (
                <p className="truncate text-muted-foreground text-xs">
                  {user.email}
                </p>
              ) : null}
            </div>
            <Badge className="mt-2 text-[10px]" variant="outline">
              {roleBadge}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AnimateIcon animateOnHover>
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <User size={16} />
              <span className="flex-1">Profile</span>
            </DropdownMenuItem>
          </AnimateIcon>
          <AnimateIcon animateOnHover>
            <DropdownMenuItem
              render={<Link href={"/dashboard/settings" as Route} />}
            >
              <Settings size={16} />
              <span className="flex-1">Settings</span>
            </DropdownMenuItem>
          </AnimateIcon>
        </DropdownMenuGroup>
        <DropdownMenuItem
          className="py-2"
          closeOnClick={false}
          onClick={toggleTheme}
        >
          <ThemeToggleIcon
            size={16}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
          />
          <span className="flex">Switch theme</span>
          <DropdownMenuShortcut>{shortcuts.TOGGLE_THEME}</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <AnimateIcon animateOnHover>
            <DropdownMenuItem render={<Link href="/" />}>
              <LayoutDashboard size={16} />
              <span>Homepage</span>
            </DropdownMenuItem>
          </AnimateIcon>
          <AnimateIcon animateOnHover>
            <DropdownMenuItem
              render={<Link href={"/dashboard/support" as Route} />}
            >
              <MessageCircleQuestion size={16} />
              <span>Help</span>
            </DropdownMenuItem>
          </AnimateIcon>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <AnimateIcon animateOnHover>
          <DropdownMenuItem
            disabled={logoutDisabled}
            onClick={handleSignOut}
            variant="destructive"
          >
            <LogOut size={16} />
            <span>{logoutLabel}</span>
            <DropdownMenuShortcut className="text-destructive group-focus/dropdown-menu-item:text-destructive">
              {shortcuts.LOGOUT}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </AnimateIcon>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
