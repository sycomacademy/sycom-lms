"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";

const verifySchema = z.object({
  code: z.string().min(6, "Enter your 2FA code"),
  trustDevice: z.boolean(),
});

type VerifyInput = z.infer<typeof verifySchema>;

const backupSchema = z.object({
  code: z.string().min(6, "Enter your backup code"),
  trustDevice: z.boolean(),
});

type BackupInput = z.infer<typeof backupSchema>;

export function TwoFactorForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"totp" | "backup">("totp");

  const totpForm = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
      trustDevice: true,
    },
  });

  const backupForm = useForm<BackupInput>({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      code: "",
      trustDevice: true,
    },
  });

  const handleTotpVerify = async (input: VerifyInput) => {
    const { error } = await authClient.twoFactor.verifyTotp({
      code: input.code,
      trustDevice: input.trustDevice,
    });

    if (error) {
      toastManager.add({
        title: "Verification failed",
        description: error.message,
        type: "error",
      });
      return;
    }

    toastManager.add({
      title: "Verification successful",
      description: "You are now signed in.",
      type: "success",
    });
    await authClient.revokeOtherSessions();

    router.refresh();
    router.push("/dashboard");
  };

  const handleBackupVerify = async (input: BackupInput) => {
    const { error } = await authClient.twoFactor.verifyBackupCode({
      code: input.code,
      trustDevice: input.trustDevice,
    });

    if (error) {
      toastManager.add({
        title: "Backup code failed",
        description: error.message,
        type: "error",
      });
      return;
    }

    toastManager.add({
      title: "Verification successful",
      description: "You are now signed in.",
      type: "success",
    });
    await authClient.revokeOtherSessions();
    router.refresh();
    router.push("/dashboard");
  };

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="font-medium text-lg tracking-tight">
          Two-factor verification
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter a code from your authenticator app or use a backup code.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border p-1">
        <Button
          onClick={() => setMode("totp")}
          size="sm"
          type="button"
          variant={mode === "totp" ? "default" : "ghost"}
        >
          Authenticator code
        </Button>
        <Button
          onClick={() => setMode("backup")}
          size="sm"
          type="button"
          variant={mode === "backup" ? "default" : "ghost"}
        >
          Backup code
        </Button>
      </div>

      {mode === "totp" ? (
        <Form {...totpForm}>
          <form
            className="space-y-3"
            onSubmit={totpForm.handleSubmit(handleTotpVerify)}
          >
            <FormField
              control={totpForm.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">
                      Authenticator code
                    </FieldLabel>
                    <FormControl>
                      <Input
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        placeholder="123456"
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
              control={totpForm.control}
              name="trustDevice"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        id="trust-device-totp"
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FieldLabel
                      className="font-normal text-muted-foreground text-xs"
                      htmlFor="trust-device-totp"
                    >
                      Trust this device for 30 days
                    </FieldLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={totpForm.formState.isSubmitting}
              type="submit"
            >
              {totpForm.formState.isSubmitting ? (
                <Spinner className="mr-2" />
              ) : null}
              Verify and continue
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...backupForm}>
          <form
            className="space-y-3"
            onSubmit={backupForm.handleSubmit(handleBackupVerify)}
          >
            <FormField
              control={backupForm.control}
              name="code"
              render={({ field, fieldState }) => (
                <FormItem>
                  <Field>
                    <FieldLabel className="text-xs">Backup code</FieldLabel>
                    <FormControl>
                      <Input placeholder="Enter backup code" {...field} />
                    </FormControl>
                    <FieldError reserveSpace>
                      {fieldState.error?.message}
                    </FieldError>
                  </Field>
                </FormItem>
              )}
            />

            <FormField
              control={backupForm.control}
              name="trustDevice"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        id="trust-device-backup"
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FieldLabel
                      className="font-normal text-muted-foreground text-xs"
                      htmlFor="trust-device-backup"
                    >
                      Trust this device for 30 days
                    </FieldLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              className="w-full"
              disabled={backupForm.formState.isSubmitting}
              type="submit"
            >
              {backupForm.formState.isSubmitting ? (
                <Spinner className="mr-2" />
              ) : null}
              Verify backup code
            </Button>
          </form>
        </Form>
      )}

      <p className="text-center text-muted-foreground text-xs">
        Wrong account?{" "}
        <Link className="underline underline-offset-4" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
