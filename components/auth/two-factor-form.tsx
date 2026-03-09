"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";

const totpSchema = z.object({
  code: z.string().min(6, "Enter your 6-digit code").max(8),
});

const backupSchema = z.object({
  backupCode: z.string().min(1, "Enter your backup code"),
});

type TotpInput = z.infer<typeof totpSchema>;
type BackupInput = z.infer<typeof backupSchema>;

export function TwoFactorForm() {
  const router = useRouter();
  const [useBackupCode, setUseBackupCode] = useState(false);

  const totpForm = useForm<TotpInput>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "" },
  });

  const backupForm = useForm<BackupInput>({
    resolver: zodResolver(backupSchema),
    defaultValues: { backupCode: "" },
  });

  const handleTotpSubmit = async (data: TotpInput) => {
    const { error } = await authClient.twoFactor.verifyTotp({
      code: data.code,
      trustDevice: true,
    });
    if (error) {
      toastManager.add({
        title: "Verification failed",
        description: error.message ?? "Invalid code. Please try again.",
        type: "error",
      });
      return;
    }
    toastManager.add({
      title: "Signed in",
      description: "Welcome back.",
      type: "success",
    });
    router.push("/dashboard");
  };

  const handleBackupSubmit = async (data: BackupInput) => {
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code: data.backupCode.trim(),
      trustDevice: true,
    });
    if (error) {
      toastManager.add({
        title: "Verification failed",
        description: error.message ?? "Invalid backup code. Please try again.",
        type: "error",
      });
      return;
    }
    toastManager.add({
      title: "Signed in",
      description: "Welcome back.",
      type: "success",
    });
    router.push("/dashboard");
  };

  const isSubmitting =
    totpForm.formState.isSubmitting || backupForm.formState.isSubmitting;

  return (
    <div className="w-full space-y-3">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheckIcon className="size-6 text-primary" />
        </div>
        <h1 className="font-medium text-lg tracking-tight">
          Two-factor verification
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter the code from your authenticator app to sign in.
        </p>
      </div>

      {useBackupCode ? (
        <Form {...backupForm}>
          <form
            className="flex flex-col gap-3"
            onSubmit={backupForm.handleSubmit(handleBackupSubmit)}
          >
            <FormField
              control={backupForm.control}
              name="backupCode"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-muted-foreground text-xs">
                      Backup code
                    </FieldLabel>
                    <FormControl>
                      <Input
                        autoComplete="one-time-code"
                        autoFocus
                        placeholder="Enter backup code"
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
            <Button
              className="mt-1 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              Verify backup code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...totpForm}>
          <form
            className="flex flex-col gap-3"
            onSubmit={totpForm.handleSubmit(handleTotpSubmit)}
          >
            <FormField
              control={totpForm.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-muted-foreground text-xs">
                      Authenticator code
                    </FieldLabel>
                    <FormControl>
                      <Input
                        autoComplete="one-time-code"
                        autoFocus
                        inputMode="numeric"
                        maxLength={8}
                        placeholder="000000"
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
            <Button
              className="mt-1 w-full"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              Verify
            </Button>
          </form>
        </Form>
      )}

      <div className="flex justify-center">
        <button
          className="text-muted-foreground text-xs underline hover:text-foreground"
          onClick={() => setUseBackupCode((v) => !v)}
          type="button"
        >
          {useBackupCode
            ? "Use authenticator app instead"
            : "Use backup code instead"}
        </button>
      </div>

      <p className="text-center text-muted-foreground text-sm">
        <Button
          className="px-0"
          nativeButton={false}
          render={<Link href="/sign-in" />}
          variant="link"
        >
          <ArrowLeftIcon className="mr-1.5 inline size-3" />
          Back to sign in
        </Button>
      </p>
    </div>
  );
}
