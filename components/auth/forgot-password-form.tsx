"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/packages/auth/auth-client";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/packages/schema/auth";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true);

    try {
      // Always show success to prevent email enumeration attacks
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });
    } catch {
      // Silently ignore errors - we don't want to reveal if email exists
      console.error(
        "Password reset request failed (this is expected if email doesn't exist)"
      );
    } finally {
      // Always show success message for security
      setIsSubmitted(true);
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Check your email</h3>
          <p className="text-muted-foreground text-sm">
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {form.getValues("email")}
            </span>
            , we've sent a password reset link.
          </p>
        </div>
        <Button
          className="mt-4"
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Try another email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={isLoading} size="lg" type="submit">
          {isLoading ? (
            <>
              <Loader2Icon className="animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </Form>
  );
}
