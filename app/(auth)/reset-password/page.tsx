import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password",
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-entrance flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          Reset password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your new password below.
        </p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-center text-muted-foreground text-xs">
        <Link className="text-foreground hover:underline" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
