"use client";

import { CameraIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useUserQuery } from "@/packages/hooks/use-user";

const NAME_WORDS = /\s+/;
function getInitials(name: string) {
  return name
    .split(NAME_WORDS)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AccountAvatar() {
  const { user } = useUserQuery();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="relative">
          <Avatar className="size-16" size="lg">
            <AvatarImage
              alt={user?.name ?? "User"}
              src={user?.image ?? undefined}
            />
            <AvatarFallback className="text-lg">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <button
            aria-label="Change avatar"
            className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"
            type="button"
          >
            <CameraIcon className="size-3" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground text-sm">
            {user?.name ?? "User"}
          </p>
          <p className="text-muted-foreground text-xs">{user?.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
