"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCourseDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [difficulty, setDifficulty] = useState<string>("beginner");

  const createMutation = useMutation(
    trpc.course.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.course.list.queryKey(),
        });
        toastManager.add({
          title: "Course created",
          description: "Your new course has been created as a draft.",
          type: "success",
        });
        resetForm();
        setOpen(false);
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

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setSlugManuallyEdited(false);
    setDifficulty("beginner");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(title.trim() && slug.trim())) return;

    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim(),
      difficulty: difficulty as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert",
      status: "draft",
    });
  };

  return (
    <Dialog
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon className="size-4" />
            New course
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new course</DialogTitle>
            <DialogDescription>
              Start with a title and basic info. You can add sections and
              lessons after creation.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Title</Label>
              <Input
                autoFocus
                id="course-title"
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Introduction to Network Security"
                required
                value={title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input
                id="course-slug"
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="e.g. intro-to-network-security"
                required
                value={slug}
              />
              <p className="text-muted-foreground text-xs">
                URL-friendly identifier. Auto-generated from the title.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                onValueChange={(v) => {
                  if (v) setDifficulty(v);
                }}
                value={difficulty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              disabled={
                createMutation.isPending || !title.trim() || !slug.trim()
              }
              type="submit"
            >
              {createMutation.isPending && (
                <Loader2Icon className="size-4 animate-spin" />
              )}
              Create course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
