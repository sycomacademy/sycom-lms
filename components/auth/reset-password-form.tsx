"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/packages/utils/schema";

export function ResetPasswordForm({
  token,
  isInvite = false,
}: {
  token: string;
  isInvite?: boolean;
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    if (error) {
      toastManager.add({
        description: error.message ?? "Something went wrong. Please try again.",
        title: "Reset failed",
        type: "error",
      });
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="w-full space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/30">
          <CheckCircle2Icon className="size-5 text-success-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="font-medium text-lg tracking-tight">
            {isInvite ? "You're all set!" : "Password reset successful"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isInvite
              ? "Your password has been set. You can now sign in to your account."
              : "Your password has been updated. You can now sign in with your new password."}
          </p>
        </div>
        <Button
          className={"w-full"}
          nativeButton={false}
          render={<Link href="/sign-in" />}
          variant="default"
        >
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-medium text-lg tracking-tight">
          {isInvite ? "Welcome! Set your password" : "Set a new password"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isInvite
            ? "You've been invited to the platform. Choose a password to get started."
            : "Choose a strong password for your account."}
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
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel className="text-muted-foreground text-xs">
                    New password
                  </FieldLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Min. 8 characters"
                        required
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((s) => !s)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FieldError reserveSpace>
                    {fieldState.error?.message ?? (
                      <span className="text-muted-foreground/70">
                        Must include uppercase, lowercase, and a number.
                      </span>
                    )}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <FieldLabel className="text-muted-foreground text-xs">
                    Confirm password
                  </FieldLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Re-enter your password"
                        required
                        type={showConfirm ? "text" : "password"}
                        {...field}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowConfirm((s) => !s)}
                          size="icon-xs"
                          variant="ghost"
                        >
                          {showConfirm ? (
                            <EyeOffIcon className="size-3.5" />
                          ) : (
                            <EyeIcon className="size-3.5" />
                          )}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FieldError reserveSpace>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <Button
            className="mt-1 w-full"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? <Spinner className="mr-2" /> : null}
            {isInvite ? "Set password" : "Reset password"}
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
