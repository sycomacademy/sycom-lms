import type { Metadata } from "next";
import Link from "next/link";
import AuthCheck from "@/components/auth/auth-check";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In | Sycom LMS",
  description: "Sign in to your Sycom account or create a new one.",
};

export default async function SignInPage() {
  <AuthCheck isOnLoggedInPage={false} />;
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
