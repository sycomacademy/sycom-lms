"use client";

import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useUserMutation, useUserQuery } from "@/packages/hooks/use-user";
import { uploadFile } from "@/packages/storage/upload";
import {
  getAvatarUploadParams,
  persistAvatarAsset,
} from "./account-avatar-actions";

const NAME_WORDS = /\s+/;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 1024 * 1024 * 4;

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
  const userMutation = useUserMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadPending, setUploadPending] = useState(false);

  const handleAvatarClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toastManager.add({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        type: "error",
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      toastManager.add({
        title: "File too large",
        description: "Maximum file size is 4MB",
        type: "error",
      });
      return;
    }

    setUploadPending(true);

    try {
      const signedParams = await getAvatarUploadParams();
      if (!signedParams) {
        toastManager.add({
          title: "Upload failed",
          description: "You must be signed in to update your avatar",
          type: "error",
        });
        return;
      }

      const result = await uploadFile({
        file,
        signedParams,
      });

      const persistResult = await persistAvatarAsset(result);
      if (!persistResult.success) {
        toastManager.add({
          title: "Upload failed",
          description: persistResult.error,
          type: "error",
        });
        return;
      }

      userMutation.mutate(
        { image: result.secureUrl },
        {
          onSuccess: () => {
            toastManager.add({
              title: "Avatar updated",
              type: "success",
            });
          },
          onError: () => {
            toastManager.add({
              title: "Update failed",
              description: "Could not update your profile image",
              type: "error",
            });
          },
        }
      );
    } catch (err) {
      toastManager.add({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        type: "error",
      });
    } finally {
      setUploadPending(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const isLoading = uploadPending || userMutation.isPending;

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
