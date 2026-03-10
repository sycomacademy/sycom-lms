"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Editor } from "@/components/editor/editor";
import { FileUploader } from "@/components/elements/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import type { StorageFolder } from "@/packages/db/schema/storage";
import { uploadFile } from "@/packages/storage/upload";
import { useTRPC } from "@/packages/trpc/client";
import {
  DIFFICULTY_OPTIONS,
  type EditCourseFormInput,
  editCourseFormSchema,
} from "@/packages/utils/schema";
import { slugify } from "@/packages/utils/string";

type CourseDetail = RouterOutputs["course"]["getById"];
type CategoryListItem = RouterOutputs["category"]["list"][number];

const THUMBNAILS_FOLDER = "thumbnails" satisfies StorageFolder;

interface EditCourseInfoFormProps {
  courseId: string;
}

export function EditCourseInfoForm({ courseId }: EditCourseInfoFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();

  const { data: courseData } = useSuspenseQuery(
    trpc.course.getById.queryOptions({ courseId })
  );
  const course = courseData as CourseDetail;

  const { data: categoriesData } = useSuspenseQuery(
    trpc.category.list.queryOptions()
  );
  const categories: CategoryListItem[] = categoriesData ?? [];

  const [categoryIds, setCategoryIds] = useState<string[]>(
    () => course.categories?.map((c: { id: string }) => c.id) ?? []
  );
  const [summary, setSummary] = useState<JSONContent | undefined>(() => {
    const raw = course.summary as JSONContent | unknown[] | null | undefined;
    if (!raw) {
      return undefined;
    }
    if (typeof raw === "object" && "type" in (raw as object)) {
      return raw as JSONContent;
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return { type: "doc", content: raw as JSONContent[] };
    }
    return undefined;
  });
  const slugManuallyEdited = useRef(true);

  const form = useForm<EditCourseFormInput>({
    resolver: zodResolver(editCourseFormSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      description: course.description ?? "",
      difficulty: course.difficulty as EditCourseFormInput["difficulty"],
      status: course.status as EditCourseFormInput["status"],
      thumbnail: null,
    },
  });

  const selectedCategories: CategoryListItem[] =
    categoryIds.length > 0
      ? categoryIds
          .map((id) => categories.find((c) => c.id === id))
          .filter((c): c is CategoryListItem => c != null)
      : [];

  const signUploadMutation = useMutation(
    trpc.storage.signUpload.mutationOptions()
  );
  const saveAssetMutation = useMutation(
    trpc.storage.saveAsset.mutationOptions()
  );
  const updateMutation = useMutation(
    trpc.course.update.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.getById.queryKey({ courseId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.course.list.queryKey(),
        });

        if (variables.status && variables.status !== course.status) {
          const event =
            variables.status === "published"
              ? analyticsEvents.coursePublished
              : analyticsEvents.courseUnpublished;
          track({
            event,
            course_id: courseId,
            course_title: variables.title ?? course.title,
          });
        }

        toastManager.add({
          title: "Course updated",
          description: "Your changes have been saved.",
          type: "success",
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update course",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const isSubmitting =
    signUploadMutation.isPending ||
    saveAssetMutation.isPending ||
    updateMutation.isPending;

  const handleTitleChange = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    if (!slugManuallyEdited.current) {
      form.setValue("slug", slugify(value), {
        shouldValidate: form.formState.isSubmitted,
      });
    }
  };

  const handleCategoryValueChange = (next: CategoryListItem[] | null) => {
    setCategoryIds(next ? next.map((c) => c.id) : []);
  };

  const onSubmit = async (data: EditCourseFormInput) => {
    let imageUrl: string | undefined = course.imageUrl ?? undefined;

    if (data.thumbnail) {
      try {
        const signedParams = await signUploadMutation.mutateAsync({
          folder: THUMBNAILS_FOLDER,
          entityId: courseId,
        });

        const uploadResult = await uploadFile({
          file: data.thumbnail,
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
          entityId: courseId,
          entityType: "course",
        });

        imageUrl = uploadResult.secureUrl;
      } catch (err) {
        toastManager.add({
          title: "Failed to upload image",
          description: err instanceof Error ? err.message : "Upload failed",
          type: "error",
        });
        return;
      }
    }

    updateMutation.mutate({
      courseId,
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || undefined,
      difficulty: data.difficulty,
      status: data.status,
      summary: summary ? summary : undefined,
      imageUrl,
      categoryIds,
    });
  };

  const thumbnailFile = form.watch("thumbnail");

  return (
    <Form {...form}>
      <form
        className="flex max-w-2xl flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Thumbnail */}
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Thumbnail</FieldLabel>
                {course.imageUrl && !thumbnailFile && (
                  <Image
                    alt={course.title}
                    className="mb-2 aspect-square size-32 w-auto rounded-md object-contain"
                    height={128}
                    src={course.imageUrl}
                    width={256}
                  />
                )}
                <FormControl>
                  <FileUploader
                    accept={{
                      "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
                    }}
                    disabled={isSubmitting}
                    maxFileCount={1}
                    maxSize={1024 * 1024 * 10}
                    onValueChange={(files) => {
                      field.onChange(files[0] ?? null);
                    }}
                    value={field.value ? [field.value] : []}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  Upload a new image to replace the current thumbnail.
                </p>
              </Field>
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Title</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Introduction to Network Security"
                    {...field}
                    onChange={(e) =>
                      handleTitleChange(e.target.value, field.onChange)
                    }
                  />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Slug</FieldLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. intro-to-network-security"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      slugManuallyEdited.current = true;
                    }}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  URL-friendly identifier for this course.
                </p>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <FormControl>
                  <Textarea
                    className="min-h-28"
                    placeholder="A brief description of what students will learn..."
                    {...field}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  Short description shown in course cards and listings.
                </p>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        {/* Summary (rich text editor) */}
        <Field>
          <FieldLabel className="text-xs">Summary</FieldLabel>
          <Editor
            content={summary}
            onUpdate={setSummary}
            placeholder="Write a detailed course summary..."
            variant="basic"
          />
          <p className="text-muted-foreground text-xs">
            Detailed overview shown on the course page. Supports rich text
            formatting.
          </p>
        </Field>

        {/* Categories */}
        <Field>
          <FieldLabel className="text-xs">Categories</FieldLabel>
          <Combobox
            autoHighlight
            isItemEqualToValue={(a, b) => a?.id === b?.id}
            items={categories}
            itemToStringLabel={(c) => c.name}
            itemToStringValue={(c) => c.id}
            multiple
            onValueChange={handleCategoryValueChange}
            value={selectedCategories}
          >
            <ComboboxChips ref={anchor}>
              <ComboboxValue>
                {(values: CategoryListItem[]) => (
                  <>
                    {values.map((c) => (
                      <ComboboxChip key={c.id}>{c.name}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput placeholder="Add categories..." />
                  </>
                )}
              </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No categories found.</ComboboxEmpty>
              <ComboboxList>
                {(item: CategoryListItem) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        {/* Difficulty */}
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Difficulty</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {
                          DIFFICULTY_OPTIONS.find(
                            (option) => option.value === field.value
                          )?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        {/* Status toggle */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Field>
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel className="text-xs">Publish course</FieldLabel>
                    <p className="text-muted-foreground text-xs">
                      {field.value === "published"
                        ? "This course is visible to students."
                        : "This course is hidden from students."}
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

        <Button className="mb-8" disabled={isSubmitting} type="submit">
          <span className="relative inline-flex items-center justify-center">
            <span className={isSubmitting ? "invisible" : undefined}>
              Save changes
            </span>
            {isSubmitting && <Spinner className="absolute size-3" />}
          </span>
        </Button>
      </form>
    </Form>
  );
}
