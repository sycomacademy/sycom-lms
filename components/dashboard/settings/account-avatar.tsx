"use client";

import { CameraIcon } from "lucide-react";
import { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { FILE_CATEGORIES } from "@/packages/db/schema/files";
import { useFileUploadSimple } from "@/packages/hooks/use-file-upload";
import { useUserMutation, useUserQuery } from "@/packages/hooks/use-user";

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
  const { user, profile } = useUserQuery();
  const userMutation = useUserMutation();
  const { upload, isPending } = useFileUploadSimple();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const constraints = FILE_CATEGORIES.avatar;
    if (
      !constraints.allowedTypes.includes(
        file.type as (typeof constraints.allowedTypes)[number]
      )
    ) {
      toastManager.add({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        type: "error",
      });
      return;
    }

    // Validate file size
    if (file.size > constraints.maxSize) {
      toastManager.add({
        title: "File too large",
        description: `Maximum file size is ${Math.round(constraints.maxSize / 1024 / 1024)}MB`,
        type: "error",
      });
      return;
    }

    try {
      const fileRecord = await upload(file, {
        entityType: "profile",
        entityId: profile?.id ?? user?.id ?? "",
        category: "avatar",
        visibility: "public",
      });

      // Update the user's image URL
      userMutation.mutate(
        { image: fileRecord.url },
        {
          onSuccess: () => {
            toastManager.add({
              title: "Avatar updated",
              type: "success",
            });
          },
        }
      );
    } catch {
      // Error is already handled by the upload function
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isLoading = isPending || userMutation.isPending;

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
            className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background disabled:opacity-50"
            disabled={isLoading}
            onClick={handleAvatarClick}
            type="button"
          >
            {isLoading ? (
              <Spinner className="size-3" />
            ) : (
              <CameraIcon className="size-3" />
            )}
          </button>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
            ref={inputRef}
            tabIndex={-1}
            type="file"
          />
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
