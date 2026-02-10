import type { Metadata } from "next";
import { SignInView } from "@/components/auth/sign-in-view";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; callbackUrl?: string }>;
}) {
  const { verified, callbackUrl } = await searchParams;

  return (
    <div className="auth-entrance w-full max-w-md">
      <SignInView callbackUrl={callbackUrl} verified={verified} />
    </div>
  );
}
