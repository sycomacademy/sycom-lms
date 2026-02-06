"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { signUp } from "@/packages/auth/auth-client";
import { type SignUpInput, signUpSchema } from "@/packages/schema/auth";
import { trpc } from "@/packages/trpc/client";

function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  const message = error.message;

  // Check for JSON parsing errors (server error page returned)
  if (
    message.includes("not valid JSON") ||
    message.includes("Unexpected token")
  ) {
    return "Server error occurred. Please try again later or contact support.";
  }

  return message;
}

function getSignUpErrorMessage(errorMessage: string): string {
  if (errorMessage.includes("email") && errorMessage.includes("configured")) {
    return "Email service is temporarily unavailable. Please try again later.";
  }
  if (errorMessage.includes("Failed to send")) {
    return "Unable to send verification email. Please try again later.";
  }
  return errorMessage || "Failed to create account";
}

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Server-side validation mutation using TanStack Query
  const validateMutation = useMutation(
    trpc.auth.validateSignUp.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  async function onSubmit(data: SignUpInput) {
    setIsLoading(true);

    try {
      // First validate on server (check if email exists)
      await validateMutation.mutateAsync(data);

      // Then call better-auth signUp
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      if (result.error) {
        toast.error(getSignUpErrorMessage(result.error.message || ""), {
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      toast.success(
        "Account created! Please check your email to verify your account.",
        { duration: 5000 }
      );

      // Redirect to verification pending page or sign-in
      router.push("/sign-in?verified=pending");
    } catch (error) {
      console.error("[SignUp] Error:", error);
      toast.error(getErrorMessage(error), { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
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
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
}
