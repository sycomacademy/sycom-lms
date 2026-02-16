"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useFileUploadSimple } from "@/packages/hooks/use-file-upload";
import { useTRPC } from "@/packages/trpc/client";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

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

const createCourseFormSchema = z.object({
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
});

type CreateCourseFormInput = z.infer<typeof createCourseFormSchema>;

export function CreateCourseForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const anchor = useComboboxAnchor();

  const { data: categories = [] } = useSuspenseQuery(
    trpc.category.list.queryOptions()
  );

  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const uploadedImageUrl = useRef<string | null>(null);

  const { upload: uploadImage, isPending: isUploading } = useFileUploadSimple();

  const form = useForm<CreateCourseFormInput>({
    resolver: zodResolver(createCourseFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      difficulty: "beginner",
    },
  });

  const selectedCategories: CategoryItem[] =
    categoryIds.length > 0
      ? categoryIds
          .map((id) => categories.find((c) => c.id === id))
          .filter((c): c is CategoryItem => c != null)
      : [];

  const createMutation = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: (course) => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.list.queryKey(),
        });
        toastManager.add({
          title: "Course created",
          description: "Redirecting to edit page to add lessons.",
          type: "success",
        });
        router.push(`/dashboard/courses/${course.id}/edit`);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create course",
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
      setFileError(null);
    }
  };

  const isSubmitting = isUploading || createMutation.isPending;

  const onSubmit = async (data: CreateCourseFormInput) => {
    if (files.length === 0) {
      setFileError("Thumbnail is required");
      return;
    }

    // Reuse the URL from a previous upload if the file hasn't changed
    let imageUrl = uploadedImageUrl.current;

    if (!imageUrl) {
      try {
        const fileRecord = await uploadImage(files[0], {
          entityType: "course",
          entityId: "new",
          category: "image",
          visibility: "public",
        });
        imageUrl = fileRecord.url;
        uploadedImageUrl.current = imageUrl;
      } catch {
        // Upload error is handled by the hook via toast
        return;
      }
    }

    // If the mutation fails (e.g. duplicate slug), the image stays in storage
    // and uploadedImageUrl.current persists so the next submit skips re-upload.
    createMutation.mutate({
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || undefined,
      difficulty: data.difficulty,
      status: "draft",
      imageUrl,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex max-w-2xl flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Field>
          <FieldLabel className="text-xs">Thumbnail</FieldLabel>
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
          {fileError && <p className="text-destructive text-sm">{fileError}</p>}
        </Field>

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
                  URL-friendly identifier. Auto-generated from the title.
                </p>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-xs">Description</FieldLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what students will learn..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </Field>
            </FormItem>
          )}
        />

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

        <Button
          className="mb-8"
          disabled={isSubmitting || isUploading}
          type="submit"
        >
          {isSubmitting || isUploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : null}
          Create course
        </Button>
      </form>
    </Form>
  );
}
