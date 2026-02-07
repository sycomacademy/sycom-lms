"use client";

import { useFormStatus } from "react-dom";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import {
  createPathwayAction,
  updatePathwayAction,
} from "@/lib/actions/instructor";
import type { pathway } from "@/packages/db/schema/pathway";

type PathwayRow = typeof pathway.$inferSelect;

interface PathwayFormProps {
  pathway?: PathwayRow;
}

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function PathwayForm({ pathway }: PathwayFormProps) {
  const isEdit = Boolean(pathway);

  return (
    <form
      action={
        isEdit && pathway
          ? updatePathwayAction.bind(null, pathway.id)
          : createPathwayAction
      }
      className="space-y-6"
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="pathway-title">Title</FieldLabel>
            <Input
              defaultValue={pathway?.title}
              id="pathway-title"
              name="title"
              placeholder="Pathway title"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pathway-slug">Slug (URL)</FieldLabel>
            <Input
              defaultValue={pathway?.slug}
              id="pathway-slug"
              name="slug"
              placeholder="pathway-slug"
            />
          </Field>
          <Field>
            <FieldLabel>Description</FieldLabel>
            <RichTextEditor
              defaultValue={pathway?.description ?? ""}
              name="description"
              placeholder="Full pathway description…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pathway-shortDescription">
              Short description
            </FieldLabel>
            <Input
              defaultValue={pathway?.shortDescription}
              id="pathway-shortDescription"
              name="shortDescription"
              placeholder="Brief summary"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pathway-estimatedDuration">
              Estimated duration (minutes)
            </FieldLabel>
            <Input
              defaultValue={pathway?.estimatedDuration ?? 0}
              id="pathway-estimatedDuration"
              min={0}
              name="estimatedDuration"
              type="number"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pathway-level">Level</FieldLabel>
            <NativeSelect
              defaultValue={pathway?.level}
              id="pathway-level"
              name="level"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="pathway-price">
              Price (pence/cents, optional)
            </FieldLabel>
            <Input
              defaultValue={pathway?.price ?? ""}
              id="pathway-price"
              min={0}
              name="price"
              placeholder="Leave empty for free"
              type="number"
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <SubmitButton label={isEdit ? "Save changes" : "Create pathway"} />
    </form>
  );
}
