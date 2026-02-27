import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmailBroadcast } from "@/components/auth/verify-email-broadcast";
import { Button } from "@/components/ui/button";
import { getSession } from "@/packages/auth/helper";

export const metadata: Metadata = {
  title: "Verify Email | Sycom LMS",
  description: "Email verification status for your Sycom account.",
};

const formatErrorCode = (error: string) =>
  error
    .trim()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const session = await getSession();

  const hasError = !!error;
  const isVerified = !hasError && !!session;
  const normalizedError = error ? formatErrorCode(error) : null;
  let title = "Check your email";
  let description =
    "Open the verification link sent to your inbox to finish setting up your account.";

  if (hasError) {
    title = `Verification failed: ${normalizedError}`;
    description =
      "We could not verify your email. Request a new verification email and try again.";
  } else if (isVerified) {
    title = "Email verified";
    description =
      "Your email has been verified successfully. You can continue to your account.";
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100svh-8rem)] max-w-xl items-center px-4 py-12">
      {isVerified ? <VerifyEmailBroadcast /> : null}
      <div className="w-full rounded-xl border bg-card p-6 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="font-medium text-2xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {hasError && (
            <>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Go to sign in
              </Button>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/sign-up" />}
                variant="outline"
              >
                Create account
              </Button>
            </>
          )}

          {isVerified && (
            <>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                Go to dashboard
              </Button>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/" />}
                variant="outline"
              >
                Back to homepage
              </Button>
            </>
          )}

          {!(hasError || isVerified) && (
            <>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Go to sign in
              </Button>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/sign-up" />}
                variant="outline"
              >
                Create account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
