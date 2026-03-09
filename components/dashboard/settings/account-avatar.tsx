"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { CameraIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import type { StorageFolder } from "@/packages/db/schema/storage";
import { uploadFile } from "@/packages/storage/upload";
import { useTRPC } from "@/packages/trpc/client";
import {
  type AvatarFormInput,
  avatarAccept,
  avatarFormSchema,
} from "@/packages/utils/schema";
import { getInitials } from "@/packages/utils/string";

const AVATAR_FOLDER = "avatars" satisfies StorageFolder;

export function AccountAvatar() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useSuspenseQuery(trpc.user.me.queryOptions());
  const user = data.user;

  const form = useForm<AvatarFormInput>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: {
      avatar: null,
    },
  });

  const signUploadMutation = useMutation(
    trpc.storage.signUpload.mutationOptions()
  );
  const saveAssetMutation = useMutation(
    trpc.storage.saveAsset.mutationOptions()
  );
  const updateUserMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.user.me.queryKey(),
        });
      },
    })
  );

  const isLoading =
    signUploadMutation.isPending ||
    saveAssetMutation.isPending ||
    updateUserMutation.isPending;

  const onSubmit = async ({ avatar }: AvatarFormInput) => {
    if (!(avatar && user?.id)) {
      return;
    }

    try {
      const signedParams = await signUploadMutation.mutateAsync({
        folder: AVATAR_FOLDER,
        entityId: user.id,
      });

      const uploadResult = await uploadFile({
        file: avatar,
        signedParams,
      });

      await saveAssetMutation.mutateAsync({
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        folder: AVATAR_FOLDER,
        resourceType: uploadResult.resourceType,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        width: uploadResult.width,
        height: uploadResult.height,
        entityId: user.id,
        entityType: "user",
      });

      await updateUserMutation.mutateAsync({ image: uploadResult.secureUrl });

      toastManager.add({
        title: "Avatar updated",
        type: "success",
      });

      form.reset();
    } catch (error) {
      toastManager.add({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        type: "error",
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const avatar = event.target.files?.[0] ?? null;

    form.setValue("avatar", avatar, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const isValid = await form.trigger("avatar");
    if (!isValid) {
      const error = form.getFieldState("avatar").error;
      toastManager.add({
        title: "Upload failed",
        description: error?.message ?? "Please choose a valid image",
        type: "error",
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    await form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="avatar"
              render={() => (
                <FormItem>
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
                      onClick={() => inputRef.current?.click()}
                      type="button"
                    >
                      {isLoading ? (
                        <Spinner className="size-3" />
                      ) : (
                        <CameraIcon className="size-3" />
                      )}
                    </button>
                    <FormControl>
                      <input
                        accept={Object.entries(avatarAccept)
                          .flatMap(([mimeType, extensions]) => [
                            mimeType,
                            ...extensions,
                          ])
                          .join(",")}
                        className="sr-only"
                        onChange={handleFileSelect}
                        ref={inputRef}
                        tabIndex={-1}
                        type="file"
                      />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
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
