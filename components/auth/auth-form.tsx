"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { authClient } from "@/packages/auth/auth-client";
import {
  type SignInInput,
  type SignUpInput,
  signInSchema,
  signUpSchema,
} from "@/packages/types/auth";
import { OAuthButtons } from "./oauth-buttons";

function SignInForm({ onToggle }: { onToggle: () => void }) {
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
      toast.error(error.message ?? "Invalid credentials. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push("/");
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
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <FieldLabel className="font-normal text-muted-foreground text-xs">
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
        <button
          className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          onClick={onToggle}
          type="button"
        >
          Create account
        </button>
      </p>
    </div>
  );
}

function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true);
    const { error } = await authClient.signUp.email({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setIsLoading(false);
      return;
    }

    toast.success("Account created. Check your email to verify.");
    router.push("/sign-in");
  };

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="font-medium text-lg tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Start your cybersecurity journey with Sycom.
        </p>
      </div>

      {/* Sign-up form */}
      <Form {...form}>
        <form
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-muted-foreground text-xs">
                      First name
                    </FieldLabel>
                    <FormControl>
                      <Input
                        autoComplete="given-name"
                        autoFocus
                        placeholder="Jane"
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
              name="lastName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-muted-foreground text-xs">
                      Last name
                    </FieldLabel>
                    <FormControl>
                      <Input
                        autoComplete="family-name"
                        placeholder="Doe"
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
          </div>

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
                  <FieldLabel className="text-muted-foreground text-xs">
                    Password
                  </FieldLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
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

          <Button className="mt-1 w-full" disabled={isLoading} type="submit">
            {isLoading ? <Spinner className="mr-2" /> : null}
            Create account
          </Button>
        </form>
      </Form>

      <OAuthButtons />

      <p className="text-center text-muted-foreground text-sm">
        Already have an account?{" "}
        <button
          className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          onClick={onToggle}
          type="button"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

export function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        {mode === "sign-in" ? (
          <SignInForm onToggle={() => setMode("sign-up")} />
        ) : (
          <SignUpForm onToggle={() => setMode("sign-in")} />
        )}
      </div>

      <div className="mt-auto pt-6 text-center">
        <p className="text-muted-foreground text-xs">
          By signing in you agree to our{" "}
          <Link
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            href="/terms"
          >
            Terms of Service
          </Link>{" "}
          &amp;{" "}
          <Link
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            href="/privacy"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
