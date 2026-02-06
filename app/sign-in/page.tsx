import Link from "next/link";
import { Suspense } from "react";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-semibold text-2xl">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Suspense fallback={null}>
              <SignInForm />
            </Suspense>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-muted-foreground text-xs uppercase">
                <span className="bg-card px-2">Or continue with</span>
              </div>
            </div>
            <OAuthButtons />
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-muted-foreground text-xs">
              Don't have an account?{" "}
              <Link className="text-primary hover:underline" href="/sign-up">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
