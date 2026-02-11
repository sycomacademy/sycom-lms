"use client";

import { CameraIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/packages/auth/auth-client";

const NAME_WORDS = /\s+/;
function getInitials(name: string) {
  return name
    .split(NAME_WORDS)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AccountGeneral() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Avatar */}
      <Card>
        <CardContent className="flex items-center gap-4">
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

      {/* Name */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">Full name</h3>
            <p className="text-muted-foreground text-xs">
              Your display name across the platform.
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs" htmlFor="first-name">
                First name
              </Label>
              <Input
                defaultValue={user?.name?.split(" ")[0] ?? ""}
                id="first-name"
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs" htmlFor="last-name">
                Last name
              </Label>
              <Input
                defaultValue={user?.name?.split(" ").slice(1).join(" ") ?? ""}
                id="last-name"
                placeholder="Last name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">
                Email address
              </h3>
              <p className="text-muted-foreground text-xs">
                Used for sign-in, notifications, and account recovery.
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Input
              defaultValue={user?.email ?? ""}
              id="email"
              placeholder="you@example.com"
              type="email"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">Bio</h3>
            <p className="text-muted-foreground text-xs">
              A short description about yourself. Visible on your profile.
            </p>
          </div>
          <div className="mt-3">
            <Textarea
              className="resize-none"
              id="bio"
              placeholder="Tell us a little about yourself..."
              rows={3}
            />
            <p className="mt-1.5 text-muted-foreground text-xs">
              Maximum 500 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button size="sm">Save changes</Button>
      </div>
    </div>
  );
}
