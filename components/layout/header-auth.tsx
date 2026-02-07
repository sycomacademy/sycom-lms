"use client";

import {
  ChevronDownIcon,
  HeartIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/packages/auth/auth-client";

export function HeaderAuth() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (!session) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/sign-in">Sign in</Link>}
        variant="outline"
      />
    );
  }

  const user = session.user;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            type="button"
          >
            <Avatar className="size-6">
              <AvatarImage
                alt={user.name ?? ""}
                src={user.image ?? undefined}
              />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate font-medium sm:inline">
              {user.name ?? "Account"}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* User info block */}
        <div className="flex items-center gap-3 px-2 py-2.5">
          <Avatar className="size-8">
            <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{user.name}</p>
            {user.email && (
              <p className="truncate text-muted-foreground text-xs">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Navigation */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Navigate</DropdownMenuLabel>
          <DropdownMenuItem
            render={
              <Link href="/dashboard">
                <LayoutDashboardIcon />
                Dashboard
              </Link>
            }
          />
          <DropdownMenuItem
            render={
              <Link href="/dashboard/wishlist">
                <HeartIcon />
                Wishlist
              </Link>
            }
          />
          <DropdownMenuItem
            render={
              <Link href="/dashboard/settings">
                <SettingsIcon />
                Settings
              </Link>
            }
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
