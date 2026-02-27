import type { Metadata } from "next";
import Link from "next/link";
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
  const normalizedError = error ? formatErrorCode(error) : null;
  const content = {
    title: hasError
      ? `Verification failed: ${normalizedError}`
      : "Email verified",
    description: hasError
      ? "We could not verify your email. Request a new verification email and try again."
      : "Your email has been verified successfully. You can continue to your account.",
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100svh-8rem)] max-w-xl items-center px-4 py-12">
      <div className="w-full rounded-xl border bg-card p-6 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="font-medium text-2xl tracking-tight">
            {content.title}
          </h1>
          <p className="text-muted-foreground text-sm">{content.description}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {hasError ? (
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
          ) : (
            <>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href={session ? "/dashboard" : "/sign-in"} />}
              >
                {session ? "Go to dashboard" : "Go to sign in"}
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
        </div>
      </div>
    </div>
  );
}
