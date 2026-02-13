import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { signInGuard } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Sign Up | Sycom LMS",
  description: "Create a new Sycom account.",
};

export default async function SignUpPage() {
  await signInGuard();
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-full w-full items-center justify-center">
        <SignUpForm />
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
