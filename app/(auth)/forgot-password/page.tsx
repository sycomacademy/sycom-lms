import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Forgot Password | Sycom LMS",
  description: "Reset your Sycom LMS password.",
};

export default async function ForgotPasswordPage() {
  await signInGuard();
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <ForgotPasswordForm />
      </div>

      <div className="mt-auto pt-6 text-center">
        <p className="text-muted-foreground text-xs">
          Remember your password?{" "}
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
    </div>
  );
}
