"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { authClient } from "@/packages/auth/auth-client";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/packages/utils/schema";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: `/reset-password?email=${data.email}`,
    });

    if (error) {
      toastManager.add({
        description: error.message ?? "Something went wrong. Please try again.",
        title: "Request failed",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    track({
      event: analyticsEvents.passwordResetRequested,
      email: data.email,
    });
    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="w-full space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/30">
          <MailIcon className="size-5 text-success-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-medium text-lg tracking-tight">
            Check your email
          </h1>
          <p className="text-muted-foreground text-sm">
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
            , we&apos;ve sent a password reset link.
          </p>
        </div>
        <div className="space-y-2 pt-2">
          <Button
            className="w-full"
            onClick={() => setIsSubmitted(false)}
            variant="outline"
          >
            Try a different email
          </Button>
          <Button
            className={"px-1"}
            nativeButton={false}
            render={<Link href="/sign-in" />}
            variant="link"
          >
            <ArrowLeftIcon className="size-3.5" /> Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-medium text-lg tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel className="text-muted-foreground text-xs">
                    Email address
                  </FieldLabel>
                  <FormControl>
                    <Input
                      autoComplete="email"
                      autoFocus
                      placeholder="you@example.com"
                      required
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FieldError reserveSpace>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <Button className="mt-1 w-full" disabled={isLoading} type="submit">
            {isLoading ? <Spinner className="mr-2" /> : null}
            Send reset link
          </Button>
        </form>
      </Form>

      {/* Back to sign in */}
      <div className="text-center">
        <Button
          className={"px-1"}
          nativeButton={false}
          render={<Link href="/sign-in" />}
          variant="link"
        >
          <ArrowLeftIcon className="size-3.5" /> Back to sign in
        </Button>
      </div>
    </div>
  );
}
