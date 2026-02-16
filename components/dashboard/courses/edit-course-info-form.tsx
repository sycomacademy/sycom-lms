"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { Value } from "platejs";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PlateEditor } from "@/components/editor/plate-editor";
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
import { FileUploader } from "@/components/ui/file-uploader";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useFileUploadSimple } from "@/packages/hooks/use-file-upload";
import { useTRPC } from "@/packages/trpc/client";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

import Image from "next/image";

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const editCourseFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Must be lowercase letters, numbers, and hyphens only"
    ),
  description: z.string().max(2000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  status: z.enum(["draft", "published"]),
});

type EditCourseFormInput = z.infer<typeof editCourseFormSchema>;

interface EditCourseInfoFormProps {
  courseId: string;
}

export function EditCourseInfoForm({ courseId }: EditCourseInfoFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const anchor = useComboboxAnchor();

  const { data: course } = useSuspenseQuery(
    trpc.course.getById.queryOptions({ courseId })
  );

  const { data: categories = [] } = useSuspenseQuery(
    trpc.category.list.queryOptions()
  );

  const [files, setFiles] = useState<File[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true); // Start true since we're editing
  const [categoryIds, setCategoryIds] = useState<string[]>(
    () => course.categories?.map((c) => c.id) ?? []
  );
  const [summary, setSummary] = useState<Value>(
    () => (course.summary as Value) ?? []
  );
  const uploadedImageUrl = useRef<string | null>(course.imageUrl ?? null);

  const { upload: uploadImage, isPending: isUploading } = useFileUploadSimple();

  const form = useForm<EditCourseFormInput>({
    resolver: zodResolver(editCourseFormSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      description: course.description ?? "",
      difficulty: course.difficulty as EditCourseFormInput["difficulty"],
      status: course.status as EditCourseFormInput["status"],
    },
  });

  const selectedCategories: CategoryItem[] =
    categoryIds.length > 0
      ? categoryIds
          .map((id) => categories.find((c) => c.id === id))
          .filter((c): c is CategoryItem => c != null)
      : [];

  const updateMutation = useMutation(
    trpc.course.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.getById.queryKey({ courseId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.course.list.queryKey(),
        });
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

  const handleTitleChange = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    if (!slugManuallyEdited) {
      form.setValue("slug", slugify(value), {
        shouldValidate: form.formState.isSubmitted,
      });
    }
  };

  const handleCategoryValueChange = (next: CategoryItem[] | null) => {
    setCategoryIds(next ? next.map((c) => c.id) : []);
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    // Reset cached URL so a new file gets uploaded on next submit
    uploadedImageUrl.current = null;
    if (newFiles.length > 0) {
      // Clear any previous file error — no explicit fileError state here
    }
  };

  const isSubmitting = isUploading || updateMutation.isPending;

  const onSubmit = async (data: EditCourseFormInput) => {
    let imageUrl = uploadedImageUrl.current;

    // Upload new thumbnail if a file was selected
    if (files.length > 0 && !imageUrl) {
      try {
        const fileRecord = await uploadImage(files[0], {
          entityType: "course",
          entityId: courseId,
          category: "image",
          visibility: "public",
        });
        imageUrl = fileRecord.url;
        uploadedImageUrl.current = imageUrl;
      } catch {
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
      summary: summary.length > 0 ? summary : undefined,
      imageUrl: imageUrl ?? undefined,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex max-w-2xl flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Thumbnail */}
        <Field>
          <FieldLabel className="text-xs">Thumbnail</FieldLabel>
          {course.imageUrl && files.length === 0 && (
            <Image
              alt={course.title}
              className="mb-2 aspect-square size-32 w-auto rounded-md object-contain"
              height={128}
              src={course.imageUrl}
              width={256}
            />
          )}
          <FileUploader
            accept={{
              "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
            }}
            disabled={isSubmitting}
            maxFileCount={1}
            maxSize={1024 * 1024 * 10}
            onValueChange={handleFilesChange}
            value={files}
          />
          <p className="text-muted-foreground text-xs">
            Upload a new image to replace the current thumbnail.
          </p>
        </Field>

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
                      setSlugManuallyEdited(true);
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

        {/* Description (short) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of what students will learn..."
                    rows={3}
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
          <div>
            <PlateEditor
              onChange={setSummary}
              placeholder="Write a detailed course summary..."
              value={summary}
              variant="basic"
            />
            <p className="text-muted-foreground text-xs">
              Detailed overview shown on the course page. Supports rich text
              formatting.
            </p>
          </div>
        </Field>

        {/* Categories */}
        {categories.length > 0 && (
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
                  {(values: CategoryItem[]) => (
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
                  {(item: CategoryItem) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Field>
        )}

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
                        {DIFFICULTY_LABELS[field.value]}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
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
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : null}
          Save changes
        </Button>
      </form>
    </Form>
  );
}
