"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FileUploader } from "@/components/elements/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
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
import { useTRPC } from "@/packages/trpc/client";
import {
  REPORT_TYPE_OPTIONS,
  type SubmitReportFormInput,
  submitReportFormSchema,
} from "@/packages/utils/schema";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function ReportForm() {
  const trpc = useTRPC();
  const submitReportMutation = useMutation(
    trpc.feedback.submitReport.mutationOptions()
  );

  const form = useForm<SubmitReportFormInput>({
    resolver: zodResolver(submitReportFormSchema),
    defaultValues: {
      type: REPORT_TYPE_OPTIONS[0].value,
      subject: "",
      description: "",
      screenshot: null,
    },
  });

  const onSubmit = async (data: SubmitReportFormInput) => {
    let imageBase64: string | null | undefined;
    let imageMimeType: string | null | undefined;

    if (data.screenshot) {
      try {
        imageBase64 = await fileToBase64(data.screenshot);
        imageMimeType = data.screenshot.type;
      } catch {
        toastManager.add({
          type: "error",
          title: "Failed to process image",
          description: "Could not read the screenshot file. Please try again.",
        });
        return;
      }
    }

    try {
      await submitReportMutation.mutateAsync({
        type: data.type,
        subject: data.subject,
        description: data.description,
        imageBase64,
        imageMimeType,
      });

      toastManager.add({
        type: "success",
        title: "Report submitted",
        description: "Your report has been submitted successfully.",
      });
      form.reset();
    } catch (error) {
      toastManager.add({
        type: "error",
        title: "Failed to submit report",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
      });
    }
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
          <Form {...form}>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">Report Type</FieldLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a report type" />
                          </SelectTrigger>
                          <SelectContent>
                            {REPORT_TYPE_OPTIONS.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">Subject</FieldLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief summary of your report"
                          {...field}
                        />
                      </FormControl>
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
                          className="min-h-32"
                          placeholder="Provide as much detail as possible..."
                          {...field}
                        />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="screenshot"
                render={({ field }) => (
                  <FormItem>
                    <Field>
                      <FieldLabel className="text-xs">
                        Screenshot (optional)
                      </FieldLabel>
                      <FormControl>
                        <FileUploader
                          accept={{
                            "image/*": [
                              ".png",
                              ".jpg",
                              ".jpeg",
                              ".gif",
                              ".webp",
                            ],
                          }}
                          disabled={submitReportMutation.isPending}
                          maxFileCount={1}
                          maxSize={1024 * 1024 * 5}
                          onValueChange={(files) => {
                            field.onChange(files[0] ?? null);
                          }}
                          value={field.value ? [field.value] : []}
                        />
                      </FormControl>
                    </Field>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  disabled={submitReportMutation.isPending}
                  size="sm"
                  type="submit"
                >
                  <span className="relative inline-flex items-center justify-center">
                    <span
                      className={
                        submitReportMutation.isPending ? "invisible" : undefined
                      }
                    >
                      Submit Report
                    </span>
                    {submitReportMutation.isPending && (
                      <Spinner className="absolute size-3" />
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
