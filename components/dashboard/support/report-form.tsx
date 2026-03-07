"use client";

import { useRef, useState, useTransition } from "react";
import { FileUploader } from "@/components/elements/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
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
import { uploadFile } from "@/packages/storage/upload";
import { submitReport } from "./actions";
import {
  getReportUploadParams,
  persistReportAsset,
} from "./report-upload-actions";

const REPORT_TYPES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];

async function uploadScreenshot(
  file: File
): Promise<{ url: string } | { error: string }> {
  const signedParams = await getReportUploadParams();
  if (!signedParams) {
    return { error: "You must be signed in to attach a screenshot." };
  }
  const uploadResult = await uploadFile({ file, signedParams });
  const persistResult = await persistReportAsset(uploadResult);
  if (!persistResult.success) {
    return { error: persistResult.error ?? "Failed to save screenshot." };
  }
  return { url: uploadResult.secureUrl };
}

async function handleReportSubmit(
  formData: FormData,
  fileToUpload: File | null,
  formRef: React.RefObject<HTMLFormElement | null>,
  setFiles: (files: File[]) => void
) {
  let imageUrl: string | null = null;

  if (fileToUpload) {
    try {
      const uploadResult = await uploadScreenshot(fileToUpload);
      if ("error" in uploadResult) {
        toastManager.add({
          title: "Failed to submit report",
          description: uploadResult.error,
          type: "error",
        });
        return;
      }
      imageUrl = uploadResult.url;
    } catch (err) {
      toastManager.add({
        title: "Screenshot upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      });
      return;
    }
  }

  if (imageUrl) {
    formData.set("imageUrl", imageUrl);
  }

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
}

export function ReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const fileToUpload = files.length > 0 ? files[0] : null;

    startTransition(() =>
      handleReportSubmit(formData, fileToUpload, formRef, setFiles)
    );
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
              <Button disabled={isPending} size="sm" type="submit">
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
