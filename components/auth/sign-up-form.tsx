"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { type SignUpInput, signUpSchema } from "@/packages/types/auth";
import { OAuthButtons } from "./oauth-buttons";

export function SignUpForm() {
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
      toastManager.add({
        description: error.message ?? "Something went wrong. Please try again.",
        title: "Something went wrong",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    toastManager.add({
      description: "Check your email to verify.",
      title: "Account created",
      type: "success",
    });
    setIsLoading(false);
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
                      autoComplete="username webauthn"
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
                        autoComplete="new-password webauthn"
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

          {/* <PasskeySignInButton /> */}
        </form>
      </Form>

      <OAuthButtons />

      <p className="text-center text-muted-foreground text-sm">
        Already have an account?{" "}
        <Button
          className={"px-0"}
          nativeButton={false}
          render={<Link href="/sign-in" />}
          variant="link"
        >
          Sign in
        </Button>
      </p>
    </div>
  );
}
