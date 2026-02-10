import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-entrance flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          Forgot password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-muted-foreground text-xs">
        <Link className="text-foreground hover:underline" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
