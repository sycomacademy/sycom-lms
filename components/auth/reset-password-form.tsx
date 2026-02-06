"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/packages/schema/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "INVALID_TOKEN") {
      setTokenError(
        "This password reset link is invalid or has expired. Please request a new one."
      );
    }
  }, [error]);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!", { duration: 3000 });

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    }
  }

  if (tokenError) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Invalid Reset Link</h3>
          <p className="text-muted-foreground text-sm">{tokenError}</p>
        </div>
        <Button
          className="mt-4"
          onClick={() => router.push("/forgot-password")}
        >
          Request New Link
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4 text-center">
        <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
          <XCircleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Missing Reset Token</h3>
          <p className="text-muted-foreground text-sm">
            This reset link appears to be incomplete. Please use the link from
            your email or request a new one.
          </p>
        </div>
        <Button
          className="mt-4"
          onClick={() => router.push("/forgot-password")}
        >
          Request New Link
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center space-y-4 py-4 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-medium text-lg">Password Reset Successfully</h3>
          <p className="text-muted-foreground text-sm">
            Your password has been reset. Redirecting you to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="••••••••"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="••••••••"
                  type="password"
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
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  );
}
