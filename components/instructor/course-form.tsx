"use client";

import { useFormStatus } from "react-dom";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  createCourseAction,
  updateCourseAction,
} from "@/lib/actions/instructor";
import type { course } from "@/packages/db/schema/course";

type CourseRow = typeof course.$inferSelect;

interface CourseFormProps {
  course?: CourseRow;
  instructorId: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving…" : label}
    </Button>
  );
}

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function CourseForm({
  course,
  instructorId: _instructorId,
}: CourseFormProps) {
  const isEdit = Boolean(course);

  return (
    <form
      action={
        isEdit && course
          ? updateCourseAction.bind(null, course.id)
          : createCourseAction
      }
      className="space-y-6"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              defaultValue={course?.title}
              id="title"
              name="title"
              placeholder="Course title"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="slug">Slug (URL)</FieldLabel>
            <Input
              defaultValue={course?.slug}
              id="slug"
              name="slug"
              placeholder="course-slug"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <RichTextEditor
              defaultValue={course?.description ?? ""}
              name="description"
              placeholder="Full course description…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="shortDescription">
              Short description
            </FieldLabel>
            <Input
              defaultValue={course?.shortDescription}
              id="shortDescription"
              name="shortDescription"
              placeholder="Brief summary (e.g. for cards)"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <Input
              defaultValue={course?.category}
              id="category"
              name="category"
              placeholder="e.g. comptia, isc2"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="level">Level</FieldLabel>
            <NativeSelect defaultValue={course?.level} id="level" name="level">
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="price">Price (pence/cents)</FieldLabel>
            <Input
              defaultValue={course?.price ?? 0}
              id="price"
              min={0}
              name="price"
              type="number"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="duration">Duration (minutes)</FieldLabel>
            <Input
              defaultValue={course?.duration ?? 0}
              id="duration"
              min={0}
              name="duration"
              type="number"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="thumbnailUrl">Thumbnail URL</FieldLabel>
            <Input
              defaultValue={course?.thumbnailUrl ?? ""}
              id="thumbnailUrl"
              name="thumbnailUrl"
              placeholder="https://…"
              type="url"
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <SubmitButton label={isEdit ? "Save changes" : "Create course"} />
    </form>
  );
}
