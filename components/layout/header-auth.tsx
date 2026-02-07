"use client";

import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
            <span className="hidden font-medium sm:inline">Account</span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href="/dashboard">Dashboard</Link>} />
        <DropdownMenuItem onClick={handleSignOut} variant="destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
