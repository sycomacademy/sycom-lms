"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

const feedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Feedback is required")
    .max(2000, "Feedback must be less than 2000 characters"),
});

type FeedbackInput = z.infer<typeof feedbackSchema>;

export function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const trpc = useTRPC();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { message: "" },
  });

  const submitMutation = useMutation(
    trpc.feedback.submit.mutationOptions({
      onSuccess: () => {
        setIsSubmitted(true);
        toastManager.add({
          title: "Thank you!",
          description: "Your feedback has been submitted.",
          type: "success",
        });
        onSubmitted?.();
      },
      onError: (error) => {
        toastManager.add({
          description:
            error.message ?? "Something went wrong. Please try again.",
          title: "Failed to submit",
          type: "error",
        });
      },
    })
  );

  const onSubmit = (data: FeedbackInput) => {
    submitMutation.mutate({ message: data.message });
  };

  if (isSubmitted) {
    return (
      <div className="space-y-2 text-center">
        <p className="font-medium text-foreground text-sm">Thank you!</p>
        <p className="text-muted-foreground text-xs">
          Your feedback has been submitted. We appreciate you taking the time to
          help improve Sycom.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <Field>
                <FieldLabel className="text-muted-foreground text-xs">
                  Your feedback
                </FieldLabel>
                <FormControl>
                  <Textarea
                    className="min-h-24 resize-none"
                    placeholder="What could we do better?"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                {/* <FieldError reserveSpace>
                  {fieldState.error?.message}
                </FieldError> */}
              </Field>
            </FormItem>
          )}
        />

        <Button
          className="w-full"
          disabled={submitMutation.isPending || !form.formState.isValid}
          size="sm"
          type="submit"
        >
          {submitMutation.isPending ? <Spinner className="mr-2" /> : null}
          Submit feedback
        </Button>
      </form>
    </Form>
  );
}
