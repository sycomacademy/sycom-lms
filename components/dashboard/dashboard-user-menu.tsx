"use client";

import {
  HelpCircleIcon,
  HomeIcon,
  LogOutIcon,
  MoonIcon,
  PaletteIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/packages/auth/auth-client";

type DashboardUserMenuUser = NonNullable<
  Awaited<ReturnType<typeof import("@/packages/auth/helper").getSession>>
>["user"];

interface DashboardUserMenuProps {
  user: DashboardUserMenuUser;
}

const NAME_WORDS = /\s+/;
function getInitials(name: string) {
  return name
    .split(NAME_WORDS)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function DashboardUserMenu({ user }: DashboardUserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open user menu"
            className="rounded-full"
            size="icon-sm"
            variant="ghost"
          >
            <Avatar className="size-8" size="sm">
              <AvatarImage alt={user.name} src={user.image ?? undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-foreground text-sm">{user.name}</p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard/account" />}>
            <UserIcon />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <SettingsIcon />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PaletteIcon />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              onValueChange={(v) => setTheme(v)}
              value={theme ?? "system"}
            >
              <DropdownMenuRadioItem value="light">
                <SunIcon />
                <span>Light</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <MoonIcon />
                <span>Dark</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <PaletteIcon />
                <span>System</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/" />}>
            <HomeIcon />
            <span>Homepage</span>
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/dashboard/help" />}>
            <HelpCircleIcon />
            <span>Help</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          variant="destructive"
        >
          <LogOutIcon />
          <span>{pending ? "Signing out…" : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
