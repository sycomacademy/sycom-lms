"use client";

import { Facehash } from "facehash";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Icon } from "@/components/icons/old";
import { useAnimatedIcon } from "@/components/icons/old/use-animated-icon";
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
import { useDashboardOrg } from "./dashboard-org-context";

const {
  UserIcon,
  SettingsIcon,
  HomeIcon,
  LogoutIcon,
  CircleHelpIcon,
  ThemeToggleIcon,
} = Icon;

const PLATFORM_PREFIX_RE = /^platform_/;
const ORG_PREFIX_RE = /^org_/;
const UNDERSCORE_RE = /_/g;
const WORD_START_RE = /\b\w/g;

function formatRole(role: string, stripPrefix: "platform" | "org"): string {
  const prefix =
    stripPrefix === "platform" ? PLATFORM_PREFIX_RE : ORG_PREFIX_RE;
  return role
    .replace(prefix, "")
    .replace(UNDERSCORE_RE, " ")
    .replace(WORD_START_RE, (c) => c.toUpperCase());
}

export function DashboardUserMenu() {
  const router = useRouter();
  const { profile, user, isPending } = useUserQuery();
  const { setTheme, resolvedTheme } = useTheme();
  const { activeMember, orgs } = useDashboardOrg();
  const shortcuts = useKeyboardShortcutLabels();
  const [signOutPending, setSignOutPending] = useState(false);
  const [userIconRef, userHover] = useAnimatedIcon();
  const [settingsIconRef, settingsHover] = useAnimatedIcon();
  const [homeIconRef, homeHover] = useAnimatedIcon();
  const [helpIconRef, helpHover] = useAnimatedIcon();
  const [logoutIconRef, logoutHover] = useAnimatedIcon();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  async function handleSignOut() {
    setSignOutPending(true);
    const { error } = await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          // Refresh invalidates the RSC cache so server components see the logged-out state
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
    return <Skeleton className="size-10 rounded-none" />;
  }
  const enableFacehash = profile?.settings?.enableFacehash ?? true;
  const facehashName = `${user.name}`;
  const initial =
    user.name?.trim().charAt(0)?.toUpperCase() ??
    user.email?.charAt(0)?.toUpperCase() ??
    "?";
  const logoutDisabled = isPending || signOutPending;
  const logoutLabel = signOutPending ? "Signing out…" : "Log out";

  const activeOrg = orgs?.find((o) => o.id === activeMember?.organizationId);
  const isPublicOrg = !activeOrg || activeOrg.slug === "platform";
  let roleBadge: string;
  if (isPublicOrg || !activeMember) {
    roleBadge = formatRole(user.role ?? "platform_student", "platform");
  } else {
    roleBadge = `${formatRole(activeMember.role, "org")} @ ${activeOrg?.name}`;
  }

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
          <DropdownMenuItem {...userHover} render={<Link href="/dashboard" />}>
            <UserIcon ref={userIconRef} />
            <span className="flex-1">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            {...settingsHover}
            render={<Link href={"/dashboard/settings" as Route} />}
          >
            <SettingsIcon ref={settingsIconRef} />
            <span className="flex-1">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem
          className="py-2"
          closeOnClick={false}
          onClick={toggleTheme}
        >
          <ThemeToggleIcon
            className="size-3.5"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
          />
          <span className="flex">Switch theme</span>
          <DropdownMenuShortcut>{shortcuts.TOGGLE_THEME}</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem {...homeHover} render={<Link href="/" />}>
            <HomeIcon ref={homeIconRef} />
            <span>Homepage</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            {...helpHover}
            render={<Link href={"/dashboard/support" as Route} />}
          >
            <CircleHelpIcon ref={helpIconRef} />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logoutDisabled}
          onClick={handleSignOut}
          variant="destructive"
          {...logoutHover}
        >
          <LogoutIcon ref={logoutIconRef} />
          <span>{logoutLabel}</span>
          <DropdownMenuShortcut className="text-destructive group-focus/dropdown-menu-item:text-destructive">
            {shortcuts.LOGOUT}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
