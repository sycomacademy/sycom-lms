import { CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; callbackUrl?: string }>;
}) {
  const { verified, callbackUrl } = await searchParams;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-semibold text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue learning
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verified === "success" && (
          <Alert>
            <CheckCircle2Icon className="text-primary" />
            <AlertDescription>
              Email verified successfully! You can now sign in.
            </AlertDescription>
          </Alert>
        )}
        <Suspense fallback={null}>
          <SignInForm callbackUrl={callbackUrl} />
        </Suspense>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-muted-foreground text-xs uppercase">
            <span className="bg-card px-2">Or continue with</span>
          </div>
        </div>
        <OAuthButtons callbackUrl={callbackUrl} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-muted-foreground text-xs">
          Don&apos;t have an account?{" "}
          <Link className="text-primary hover:underline" href="/sign-up">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
