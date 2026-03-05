"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { FileUploader } from "@/components/ui/file-uploader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useFileUploadSimple } from "@/packages/hooks/use-file-upload";
import { useUserQuery } from "@/packages/hooks/use-user";
import { submitReport } from "./actions";

const REPORT_TYPES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

export function ReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const { user } = useUserQuery();
  const { upload, isPending: isUploading } = useFileUploadSimple();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let imageUrl: string | null = null;

      // Upload file if present
      if (files.length > 0 && user?.id) {
        const file = files[0];
        const result = await upload(file, {
          entityType: "report",
          entityId: user.id,
          category: "image",
        });
        imageUrl = result?.url ?? null;
      }

      // Add image URL to form data
      if (imageUrl) {
        formData.set("imageUrl", imageUrl);
      }

      // Submit the report
      const result = await submitReport(formData);

      if (result.success) {
        toastManager.add({
          title: "Report submitted",
          description: "Thank you for your feedback. We'll review it shortly.",
          type: "success",
        });
        formRef.current?.reset();
        setFiles([]);
      } else {
        toastManager.add({
          title: "Failed to submit report",
          description: result.error ?? "Please try again later.",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Submit a Report
            </h3>
            <p className="text-muted-foreground text-xs">
              Report a bug, request a feature, or share your feedback with us.
            </p>
          </div>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <Field>
              <FieldLabel className="text-xs">Report Type</FieldLabel>
              <Select items={REPORT_TYPES} name="type" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel className="text-xs">Subject</FieldLabel>
              <Input
                name="subject"
                placeholder="Brief summary of your report"
                required
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Description</FieldLabel>
              <Textarea
                className="min-h-32"
                name="description"
                placeholder="Provide as much detail as possible..."
                required
              />
            </Field>

            <Field>
              <FieldLabel className="text-xs">Screenshot (optional)</FieldLabel>
              <FileUploader
                accept={{
                  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
                }}
                disabled={isPending}
                maxFileCount={1}
                maxSize={1024 * 1024 * 5}
                onValueChange={setFiles}
                value={files}
              />
            </Field>

            <div className="flex justify-end">
              <Button
                disabled={isPending || isUploading}
                size="sm"
                type="submit"
              >
                <span className="relative inline-flex items-center justify-center">
                  <span className={isPending ? "invisible" : undefined}>
                    Submit Report
                  </span>
                  {isPending && <Spinner className="absolute size-3" />}
                </span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
