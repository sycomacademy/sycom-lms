"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/packages/auth/auth-client";
import { type SignInInput, signInSchema } from "@/packages/schema/auth";

function getSignInErrorMessage(error: {
  message?: string;
  code?: string;
  status?: number;
}): string {
  const message = error.message?.toLowerCase() || "";
  const status = error.status;

  // 403 typically means email not verified
  if (
    status === 403 ||
    message.includes("verify") ||
    message.includes("verified")
  ) {
    return "Please verify your email before signing in. Check your inbox for the verification link.";
  }

  if (
    message.includes("invalid") ||
    message.includes("credentials") ||
    message.includes("password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  if (error.code === "USER_NOT_FOUND" || message.includes("not found")) {
    return "No account found with this email address.";
  }

  return error.message || "Failed to sign in. Please try again.";
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onBlur",
  });

  // Show verification message if coming from sign-up (useRef avoids double toast in Strict Mode)
  const toastShownForRef = useRef<string | null>(null);
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (!verified || verified === toastShownForRef.current) {
      return;
    }
    toastShownForRef.current = verified;
    if (verified === "pending") {
      toast.info(
        "Please check your email to verify your account before signing in.",
        { duration: 6000 }
      );
    } else if (verified === "success") {
      toast.success("Email verified successfully! You can now sign in.", {
        duration: 4000,
      });
    }
  }, [searchParams]);

  async function onSubmit(data: SignInInput) {
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (result.error) {
        const errorMsg = getSignInErrorMessage(result.error);
        toast.error(errorMsg, { duration: 6000 });
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!", { duration: 2000 });

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isLoading}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal text-muted-foreground">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Link className="hover:text-foreground" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" disabled={isLoading} size="lg" type="submit">
          {isLoading ? (
            <>
              <Loader2Icon className="animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}
