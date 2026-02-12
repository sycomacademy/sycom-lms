"use client";

import { Facehash } from "facehash";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { authClient } from "@/packages/auth/auth-client";
import { useAnimatedIcon } from "@/packages/hooks/use-animated-icon";
import { useUserQuery } from "@/packages/hooks/use-user";
import { Skeleton } from "../ui/skeleton";
import { KEYBOARD_SHORTCUTS } from "./dashboard-keyboard-shortcuts";

const {
  UserIcon,
  SettingsIcon,
  HomeIcon,
  LogoutIcon,
  CircleHelpIcon,
  ThemeToggleIcon,
} = Icon;

export function DashboardUserMenu() {
  const router = useRouter();
  const { user, isPending } = useUserQuery();
  const { setTheme, resolvedTheme } = useTheme();
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
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } finally {
      setSignOutPending(false);
    }
  }

  if (!user) {
    return <Skeleton className="size-10 rounded-none" />;
  }
  const facehashName = `${user.name} ${user.email}`;
  const logoutDisabled = isPending || signOutPending;
  const logoutLabel = signOutPending ? "Signing out…" : "Log out";

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
                <Facehash
                  enableBlink
                  intensity3d="dramatic"
                  name={facehashName}
                  size={32}
                />
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-foreground text-sm">
                {user.name ?? "User"}
              </p>
              {user.email ? (
                <p className="text-muted-foreground text-xs">{user.email}</p>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            {...userHover}
            render={<Link href="/dashboard/account" />}
          >
            <UserIcon ref={userIconRef} />
            <span className="flex-1">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            {...settingsHover}
            render={<Link href="/dashboard/settings" />}
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
          <DropdownMenuShortcut>
            {KEYBOARD_SHORTCUTS.TOGGLE_THEME}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem {...homeHover} render={<Link href="/" />}>
            <HomeIcon ref={homeIconRef} />
            <span>Homepage</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            {...helpHover}
            render={<Link href="/dashboard/help" />}
          >
            <CircleHelpIcon ref={helpIconRef} />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logoutDisabled}
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          variant="destructive"
          {...logoutHover}
        >
          <LogoutIcon ref={logoutIconRef} />
          <span>{logoutLabel}</span>
          <DropdownMenuShortcut>
            {KEYBOARD_SHORTCUTS.LOGOUT}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
