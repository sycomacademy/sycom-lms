"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { type SignInInput, signInSchema } from "@/packages/utils/schema";
import { OAuthButtons } from "./oauth-buttons";

export function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (error) {
      toastManager.add({
        description: error.message ?? "Invalid credentials. Please try again.",
        title: "Sign in failed",
        type: "error",
      });
      setIsLoading(false);
    } else {
      toastManager.add({
        description: "Signed in successfully",
        title: "Signed in",
        type: "success",
      });
      // Refresh invalidates the RSC cache so server components see the new session
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-medium text-lg tracking-tight">Welcome to Sycom</h1>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </div>

      {/* Email / Password form */}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel className="text-muted-foreground text-xs">
                      Password
                    </FieldLabel>
                    <Link
                      className="text-muted-foreground text-xs transition-colors hover:text-foreground"
                      href="/forgot-password"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="current-password"
                        placeholder="Enter your password"
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
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      id="rememberMe"
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FieldLabel
                    className="font-normal text-muted-foreground text-xs"
                    htmlFor="rememberMe"
                  >
                    Remember me
                  </FieldLabel>
                </div>
              </FormItem>
            )}
          />

          <Button className="mt-1 w-full" disabled={isLoading} type="submit">
            {isLoading ? <Spinner className="mr-2" /> : null}
            Continue
          </Button>
        </form>
      </Form>

      {/* OAuth accordion */}
      <OAuthButtons />

      {/* Toggle to sign-up */}
      <p className="text-center text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Button
          className={"px-0"}
          nativeButton={false}
          render={<Link href="/sign-up" />}
          variant="link"
        >
          Create account
        </Button>
      </p>
    </div>
  );
}
