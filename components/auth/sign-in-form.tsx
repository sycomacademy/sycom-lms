"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "@/components/layout/foresight-link";
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
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { authClient } from "@/packages/auth/auth-client";
import { type SignInInput, signInSchema } from "@/packages/utils/schema";
import { OAuthButtons } from "./oauth-buttons";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const attemptSsoSignIn = async (email: string): Promise<boolean> => {
    try {
      const { error } = await authClient.signIn.sso({
        email,
        callbackURL: "/dashboard",
      });
      if (error) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: SignInInput) => {
    const ssoRedirected = await attemptSsoSignIn(data.email);
    if (ssoRedirected) {
      track({
        event: analyticsEvents.ssoSignInSuccess,
        email: data.email,
      });
      toastManager.add({
        description: "Signed in successfully",
        title: "Signed in",
        type: "success",
      });
      router.push("/dashboard");
      return;
    }

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    if (error) {
      track({
        event: analyticsEvents.signInFailed,
        email: data.email,
        error_message: error.message,
        error_code: error.code,
      });
      toastManager.add({
        description: error.message ?? "Something went wrong. Please try again.",
        title: "Something went wrong",
        type: "error",
      });
      return;
    }
    track({
      event: analyticsEvents.signIn,
      email: data.email,
    });
    toastManager.add({
      description: "Signed in successfully",
      title: "Signed in",
      type: "success",
    });
    router.push("/dashboard");
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
                      autoComplete="username webauthn"
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
                        autoComplete="current-password webauthn"
                        placeholder="Enter your password"
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
                    <Field orientation="horizontal">
                      <Checkbox
                        checked={field.value}
                        id="rememberMe"
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <FieldLabel
                        className="font-normal text-muted-foreground text-xs"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </FieldLabel>
                    </Field>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <Button
            className="mt-1 w-full"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting ? <Spinner className="mr-2" /> : null}
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
