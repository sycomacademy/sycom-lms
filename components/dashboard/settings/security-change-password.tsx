"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { authClient } from "@/packages/auth/auth-client";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export function SecurityChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: false,
    });
    if (error) {
      toastManager.add({
        title: "Failed to change password",
        description: error.message,
        type: "error",
      });
      return;
    }
    track({ event: analyticsEvents.settingsPasswordChanged });
    toastManager.add({
      title: "Password updated",
      type: "success",
    });
    form.reset();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">
            Change password
          </h3>
          <p className="text-muted-foreground text-xs">
            Update your password to keep your account secure.
          </p>
        </div>
        <Form {...form}>
          <form
            className="mt-3 flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">
                      Current password
                    </FieldLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          className="pr-9"
                          placeholder="Current password"
                          type={showCurrent ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <button
                        aria-label={
                          showCurrent ? "Hide password" : "Show password"
                        }
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrent((v) => !v)}
                        type="button"
                      >
                        {showCurrent ? (
                          <EyeOffIcon className="size-3.5" />
                        ) : (
                          <EyeIcon className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </Field>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">New password</FieldLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          className="pr-9"
                          placeholder="New password"
                          type={showNew ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <button
                        aria-label={showNew ? "Hide password" : "Show password"}
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNew((v) => !v)}
                        type="button"
                      >
                        {showNew ? (
                          <EyeOffIcon className="size-3.5" />
                        ) : (
                          <EyeIcon className="size-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      At least 8 characters with a mix of letters and numbers.
                    </p>
                  </Field>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">
                      Confirm new password
                    </FieldLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          className="pr-9"
                          placeholder="Confirm new password"
                          type={showConfirm ? "text" : "password"}
                          {...field}
                        />
                      </FormControl>
                      <button
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm((v) => !v)}
                        type="button"
                      >
                        {showConfirm ? (
                          <EyeOffIcon className="size-3.5" />
                        ) : (
                          <EyeIcon className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </Field>
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <FieldError reserveSpace>
                {form.formState.errors.newPassword?.message ??
                  form.formState.errors.confirmPassword?.message}
              </FieldError>
              <Button
                disabled={form.formState.isSubmitting}
                size="sm"
                type="submit"
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="mr-2 size-3" />
                ) : null}
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
