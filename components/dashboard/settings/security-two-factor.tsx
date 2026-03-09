"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CopyIcon, RefreshCcwIcon, ShieldCheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { QRCode } from "@/components/elements/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/packages/auth/auth-client";
import { useUserQuery } from "@/packages/hooks/use-user";

const passwordSchema = z.object({
  password: z.string().min(1, "Enter your password"),
});

const verifySchema = z.object({
  code: z.string().min(6, "Enter your authenticator code"),
});

type PasswordInput = z.infer<typeof passwordSchema>;
type VerifyInput = z.infer<typeof verifySchema>;

export function SecurityTwoFactor() {
  const { user } = useUserQuery();
  const twoFactorEnabled = useMemo(
    () =>
      Boolean((user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled),
    [user]
  );

  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);

  const enableForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const verifyForm = useForm<VerifyInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const regenerateForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const handleEnable = async (data: PasswordInput) => {
    const { data: response, error } = await authClient.twoFactor.enable({
      password: data.password,
      issuer: "Sycom LMS",
    });

    if (error) {
      toastManager.add({
        title: "Failed to start 2FA setup",
        description: error.message,
        type: "error",
      });
      return;
    }

    setTotpUri(response?.totpURI || null);
    setBackupCodes(response?.backupCodes ?? []);
    verifyForm.reset({ code: "" });
    setSetupDialogOpen(true);

    toastManager.add({
      title: "2FA setup started",
      description: "Scan the setup URI in your authenticator app, then verify.",
      type: "success",
    });
  };

  const handleVerify = async (data: VerifyInput) => {
    const { error } = await authClient.twoFactor.verifyTotp({
      code: data.code,
      trustDevice: true,
    });

    if (error) {
      toastManager.add({
        title: "Failed to verify code",
        description: error.message,
        type: "error",
      });
      return;
    }

    setSetupDialogOpen(false);
    setTotpUri(null);
    verifyForm.reset({ code: "" });
    toastManager.add({
      title: "Two-factor enabled",
      type: "success",
    });
    window.location.reload();
  };

  const handleSetupDialogClose = (open: boolean) => {
    setSetupDialogOpen(open);
    if (!open) {
      setTotpUri(null);
      setBackupCodes([]);
      verifyForm.reset({ code: "" });
    }
  };

  const handleDisable = async (data: PasswordInput) => {
    const { error } = await authClient.twoFactor.disable({
      password: data.password,
    });

    if (error) {
      toastManager.add({
        title: "Failed to disable 2FA",
        description: error.message,
        type: "error",
      });
      return;
    }

    toastManager.add({
      title: "Two-factor disabled",
      type: "success",
    });
    setBackupCodes([]);
    disableForm.reset({ password: "" });
    window.location.reload();
  };

  const handleRegenerateBackupCodes = async (data: PasswordInput) => {
    const { data: response, error } =
      await authClient.twoFactor.generateBackupCodes({
        password: data.password,
      });

    if (error) {
      toastManager.add({
        title: "Failed to regenerate backup codes",
        description: error.message,
        type: "error",
      });
      return;
    }

    setBackupCodes(response?.backupCodes ?? []);
    regenerateForm.reset({ password: "" });
    toastManager.add({
      title: "Backup codes regenerated",
      description: "Store these codes in a secure place.",
      type: "success",
    });
  };

  const copyBackupCodes = async () => {
    if (!backupCodes.length) {
      return;
    }
    await navigator.clipboard.writeText(backupCodes.join("\n"));
    toastManager.add({
      title: "Backup codes copied",
      type: "success",
    });
  };

  const copySetupUri = async () => {
    if (!totpUri) {
      return;
    }
    await navigator.clipboard.writeText(totpUri);
    toastManager.add({
      title: "Setup URI copied",
      type: "success",
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-medium text-foreground text-sm">
            Two-factor authentication
          </h3>
          <p className="text-muted-foreground text-xs">
            Configure TOTP in dashboard settings. Sign-in pages only handle 2FA
            verification.
          </p>
        </div>

        {twoFactorEnabled ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-md border border-success/40 bg-success/5 p-3 text-success text-xs">
              Two-factor authentication is enabled.
            </div>

            <Form {...regenerateForm}>
              <form
                className="space-y-2"
                onSubmit={regenerateForm.handleSubmit(
                  handleRegenerateBackupCodes
                )}
              >
                <FormField
                  control={regenerateForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">
                          Password to regenerate backup codes
                        </FieldLabel>
                        <FormControl>
                          <Input
                            autoComplete="current-password"
                            placeholder="Current password"
                            type="password"
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
                  disabled={regenerateForm.formState.isSubmitting}
                  size="sm"
                  type="submit"
                  variant="secondary"
                >
                  {regenerateForm.formState.isSubmitting ? (
                    <Spinner className="mr-2 size-3" />
                  ) : (
                    <RefreshCcwIcon className="mr-2 size-3" />
                  )}
                  Regenerate backup codes
                </Button>
              </form>
            </Form>

            {backupCodes.length > 0 ? (
              <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-xs">Backup codes</p>
                  <button
                    className="inline-flex items-center gap-1 text-xs underline hover:no-underline"
                    onClick={copyBackupCodes}
                    type="button"
                  >
                    <CopyIcon className="size-3" />
                    Copy
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all text-xs">
                  {backupCodes.join("\n")}
                </pre>
              </div>
            ) : null}

            <Form {...disableForm}>
              <form
                className="space-y-2"
                onSubmit={disableForm.handleSubmit(handleDisable)}
              >
                <FormField
                  control={disableForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">
                          Password to disable 2FA
                        </FieldLabel>
                        <FormControl>
                          <Input
                            autoComplete="current-password"
                            placeholder="Current password"
                            type="password"
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
                  disabled={disableForm.formState.isSubmitting}
                  size="sm"
                  type="submit"
                  variant="destructive"
                >
                  {disableForm.formState.isSubmitting ? (
                    <Spinner className="mr-2 size-3" />
                  ) : null}
                  Disable 2FA
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <Form {...enableForm}>
              <form
                className="space-y-3"
                onSubmit={enableForm.handleSubmit(handleEnable)}
              >
                <FormField
                  control={enableForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">
                          Confirm password to set up 2FA
                        </FieldLabel>
                        <FormControl>
                          <Input
                            autoComplete="current-password"
                            placeholder="Current password"
                            type="password"
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
                  disabled={enableForm.formState.isSubmitting}
                  size="sm"
                  type="submit"
                >
                  {enableForm.formState.isSubmitting ? (
                    <Spinner className="mr-2 size-3" />
                  ) : (
                    <ShieldCheckIcon className="mr-2 size-3" />
                  )}
                  Start setup
                </Button>
              </form>
            </Form>

            <Dialog
              onOpenChange={handleSetupDialogClose}
              open={setupDialogOpen}
            >
              <DialogPopup showCloseButton>
                <DialogHeader>
                  <DialogTitle>Set up two-factor authentication</DialogTitle>
                  <DialogDescription>
                    Scan the QR code in your authenticator app, then enter the
                    verification code below.
                  </DialogDescription>
                </DialogHeader>
                {totpUri ? (
                  <DialogPanel>
                    <div className="space-y-4">
                      <div className="mx-auto w-full max-w-52 rounded-md border border-border bg-background p-2">
                        <QRCode
                          className="aspect-square w-full"
                          data={totpUri}
                          robustness="H"
                        />
                      </div>

                      <div className="flex justify-center">
                        <button
                          className="inline-flex items-center gap-1 text-xs underline hover:no-underline"
                          onClick={copySetupUri}
                          type="button"
                        >
                          <CopyIcon className="size-3" />
                          Copy setup URI
                        </button>
                      </div>

                      <p className="break-all text-muted-foreground text-xs">
                        {totpUri}
                      </p>

                      <Form {...verifyForm}>
                        <form
                          className="flex items-center justify-center gap-2"
                          onSubmit={verifyForm.handleSubmit(handleVerify)}
                        >
                          <FormField
                            control={verifyForm.control}
                            name="code"
                            render={({ field, fieldState }) => (
                              <FormItem className="w-full sm:flex-1">
                                <Field>
                                  <FieldLabel className="text-xs">
                                    Verify code
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
                          <Button
                            disabled={verifyForm.formState.isSubmitting}
                            size="sm"
                            type="submit"
                          >
                            {verifyForm.formState.isSubmitting ? (
                              <Spinner className="mr-2 size-3" />
                            ) : null}
                            Enable 2FA
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </DialogPanel>
                ) : null}
              </DialogPopup>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
