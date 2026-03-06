import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Link } from "@/components/layout/foresight-link";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Sign In | Sycom LMS",
  description: "Sign in to your Sycom account or create a new one.",
};

export default async function SignInPage() {
  await signInGuard();
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <SignInForm />
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
