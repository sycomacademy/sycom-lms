import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Button } from "@/components/ui/button";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Reset Password | Sycom LMS",
  description: "Set a new password for your Sycom LMS account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  await signInGuard();
  const { token, error } = await searchParams;

  if (error === "INVALID_TOKEN" || !token) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full w-full items-center justify-center">
          <div className="w-full space-y-3 text-center">
            <div className="space-y-2">
              <h1 className="font-medium text-lg tracking-tight">
                Invalid or expired link
              </h1>
              <p className="text-muted-foreground text-sm">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/forgot-password" />}
            >
              Request new link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
