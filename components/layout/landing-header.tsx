"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/packages/auth/auth-client";
import { cn } from "@/packages/utils/cn";

export function LandingHeader() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  function getInitials(name: string | undefined) {
    if (!name) {
      return "U";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          className="font-semibold text-foreground hover:text-primary"
          href="/"
        >
          Sycom LMS
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            className="text-muted-foreground text-sm hover:text-foreground"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-muted-foreground text-sm hover:text-foreground"
            href="/style-guide"
          >
            Style guide
          </Link>
          <ModeSwitcher />

          {!isPending && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    className="relative size-8 rounded-full"
                    size="icon"
                    variant="ghost"
                  >
                    <Avatar size="sm">
                      <AvatarImage
                        alt={session.user.name ?? "User avatar"}
                        src={session.user.image ?? undefined}
                      />
                      <AvatarFallback>
                        {getInitials(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" sideOffset={8}>
                <div className="px-2 py-1.5">
                  <p className="font-medium text-foreground text-sm">
                    {session.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {!(isPending || session?.user) && (
            <div className="flex items-center gap-2">
              <Link
                className={cn(buttonVariants({ variant: "ghost" }))}
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link className={cn(buttonVariants())} href="/sign-up">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
