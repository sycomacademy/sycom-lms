"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Editor } from "@/components/editor/editor";
import { FileUploader } from "@/components/elements/file-uploader";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import type { StorageFolder } from "@/packages/db/schema/storage";
import { uploadFile } from "@/packages/storage/upload";
import { useTRPC } from "@/packages/trpc/client";
import {
  type BlogPostFormInput,
  blogPostFormSchema,
} from "@/packages/utils/schema";
import { slugify } from "@/packages/utils/string";

const THUMBNAILS_FOLDER = "thumbnails" satisfies StorageFolder;

type BlogPostDetail = RouterOutputs["blog"]["getById"];

const EMPTY_DOC: JSONContent = { type: "doc", content: [] };

function normalizeContent(
  value: JSONContent | unknown[] | null | undefined
): JSONContent {
  if (!value) {
    return EMPTY_DOC;
  }

  if (typeof value === "object" && "type" in (value as object)) {
    return value as JSONContent;
  }

  if (Array.isArray(value)) {
    return { type: "doc", content: value as JSONContent[] };
  }

  return EMPTY_DOC;
}

interface BaseBlogPostFormProps {
  mode: "create" | "edit";
  onSuccess?: () => void;
  post?: BlogPostDetail;
  postId: string;
}

function BaseBlogPostForm({
  mode,
  onSuccess,
  post,
  postId,
}: BaseBlogPostFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const slugManuallyEdited = useRef(mode === "edit");
  const [content, setContent] = useState<JSONContent>(() =>
    normalizeContent(
      post?.content as JSONContent | unknown[] | null | undefined
    )
  );

  const form = useForm<BlogPostFormInput>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      status: post?.status ?? "draft",
      thumbnail: null,
    },
  });

  const signUploadMutation = useMutation(
    trpc.storage.signUpload.mutationOptions()
  );
  const saveAssetMutation = useMutation(
    trpc.storage.saveAsset.mutationOptions()
  );

  const invalidateBlogQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.blog.list.queryKey() }),
      queryClient.invalidateQueries({
        queryKey: trpc.blog.listPublic.queryKey(),
      }),
      queryClient.invalidateQueries({ queryKey: trpc.blog.getById.queryKey() }),
      queryClient.invalidateQueries({
        queryKey: trpc.blog.getPublicBySlug.queryKey(),
      }),
    ]);
  };

  const createMutation = useMutation(
    trpc.blog.create.mutationOptions({
      onSuccess: async () => {
        await invalidateBlogQueries();
        toastManager.add({ title: "Blog post created", type: "success" });
        onSuccess?.();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create blog post",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const updateMutation = useMutation(
    trpc.blog.update.mutationOptions({
      onSuccess: async () => {
        await invalidateBlogQueries();
        toastManager.add({ title: "Blog post updated", type: "success" });
        onSuccess?.();
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update blog post",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const isSubmitting =
    signUploadMutation.isPending ||
    saveAssetMutation.isPending ||
    createMutation.isPending ||
    updateMutation.isPending;

  const handleTitleChange = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    if (!slugManuallyEdited.current) {
      form.setValue("slug", slugify(value), {
        shouldValidate: form.formState.isSubmitted,
      });
    }
  };

  const uploadThumbnail = async (file: File) => {
    const signedParams = await signUploadMutation.mutateAsync({
      folder: THUMBNAILS_FOLDER,
      entityId: postId,
    });

    const uploadResult = await uploadFile({
      file,
      signedParams,
    });

    await saveAssetMutation.mutateAsync({
      publicId: uploadResult.publicId,
      secureUrl: uploadResult.secureUrl,
      folder: THUMBNAILS_FOLDER,
      resourceType: uploadResult.resourceType,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      entityId: postId,
      entityType: "blog-post",
    });

    return uploadResult.secureUrl;
  };

  const onSubmit = async (data: BlogPostFormInput) => {
    let imageUrl = post?.imageUrl ?? undefined;

    if (data.thumbnail) {
      try {
        imageUrl = await uploadThumbnail(data.thumbnail);
      } catch (error) {
        toastManager.add({
          title: "Failed to upload image",
          description: error instanceof Error ? error.message : "Upload failed",
          type: "error",
        });
        return;
      }
    }

    const payload = {
      title: data.title.trim(),
      slug: data.slug.trim(),
      excerpt: data.excerpt.trim(),
      status: data.status,
      content,
      imageUrl,
    };

    if (mode === "create") {
      createMutation.mutate({ id: postId, ...payload });
      return;
    }

    updateMutation.mutate({ postId, ...payload });
  };

  const thumbnailFile = form.watch("thumbnail");

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Cover image</FieldLabel>
                {post?.imageUrl && !thumbnailFile ? (
                  <Image
                    alt={post.title}
                    className="mb-2 aspect-video w-full rounded-md object-cover sm:max-w-md"
                    height={180}
                    src={post.imageUrl}
                    width={320}
                  />
                ) : null}
                <FormControl>
                  <FileUploader
                    accept={{
                      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
                    }}
                    disabled={isSubmitting}
                    maxFileCount={1}
                    maxSize={1024 * 1024 * 10}
                    onValueChange={(files) => field.onChange(files[0] ?? null)}
                    value={field.value ? [field.value] : []}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  Optional cover image used on the public blog and dashboard.
                </p>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Title</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. How to build a secure home lab"
                    {...field}
                    onChange={(event) =>
                      handleTitleChange(event.target.value, field.onChange)
                    }
                  />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Slug</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. how-to-build-a-secure-home-lab"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      slugManuallyEdited.current = true;
                    }}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  URL-friendly identifier for this blog post.
                </p>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Excerpt</FieldLabel>
                <FormControl>
                  <Textarea
                    className="min-h-28"
                    placeholder="Short summary shown on cards and the blog index..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <Field>
          <FieldLabel className="text-xs">Content</FieldLabel>
          <Editor
            className="min-h-96"
            content={content}
            mediaUploadEntityType="blog-post"
            mediaUploadOwnerId={postId}
            onUpdate={setContent}
            placeholder="Write your article..."
            variant="full"
          />
        </Field>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Field>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <FieldLabel className="text-xs">Publish post</FieldLabel>
                    <p className="text-muted-foreground text-xs">
                      {field.value === "published"
                        ? "This post is visible on the public blog."
                        : "This post stays hidden until you publish it."}
                    </p>
                  </div>
                  <Switch
                    checked={field.value === "published"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "published" : "draft")
                    }
                  />
                </div>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <Button disabled={isSubmitting} type="submit">
          <span className="relative inline-flex items-center justify-center">
            <span className={isSubmitting ? "invisible" : undefined}>
              {mode === "create" ? "Create post" : "Save changes"}
            </span>
            {isSubmitting ? <Spinner className="absolute size-3" /> : null}
          </span>
        </Button>
      </form>
    </Form>
  );
}

export function CreateBlogPostForm({ onSuccess }: { onSuccess?: () => void }) {
  const postId = useMemo(() => `blg_${crypto.randomUUID()}`, []);

  return (
    <BaseBlogPostForm mode="create" onSuccess={onSuccess} postId={postId} />
  );
}

export function EditBlogPostForm({
  onSuccess,
  postId,
}: {
  postId: string;
  onSuccess?: () => void;
}) {
  const trpc = useTRPC();
  const { data: post } = useSuspenseQuery(
    trpc.blog.getById.queryOptions({ postId })
  );

  return (
    <BaseBlogPostForm
      mode="edit"
      onSuccess={onSuccess}
      post={post}
      postId={postId}
    />
  );
}

export function BlogPostFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-96 w-full rounded-lg" />
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
