import type { Metadata } from "next";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account",
};

export default function SignUpPage() {
  return (
    <div className="auth-entrance flex w-full max-w-md flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Get started with your cybersecurity learning journey
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-muted-foreground text-xs">
        By signing up you agree to our{" "}
        <Link className="text-foreground hover:underline" href="/terms">
          Terms of Service
        </Link>{" "}
        &{" "}
        <Link className="text-foreground hover:underline" href="/privacy">
          Privacy Policy
        </Link>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <OAuthButtons />

      <p className="text-center text-muted-foreground text-xs">
        Already have an account?{" "}
        <Link className="text-foreground hover:underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </div>
  );
}
