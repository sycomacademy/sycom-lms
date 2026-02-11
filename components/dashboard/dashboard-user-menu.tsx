"use client";

import { Facehash } from "facehash";
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
import { useUserQuery } from "@/packages/hooks/use-user";
import { Skeleton } from "../ui/skeleton";
import { toastManager } from "../ui/toast";

export function DashboardUserMenu() {
  const { user, isPending } = useUserQuery();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
        onError: (error) => {
          toastManager.add({
            title: "Error",
            description: error.error.message,
            type: "error",
          });
        },
      },
    });
  }

  if (!user) {
    return <Skeleton className="size-10 rounded-none" />;
  }
  const facehashName = user.email;

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
          disabled={isPending}
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          variant="destructive"
        >
          <LogOutIcon />
          <span>{isPending ? "Signing out…" : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
