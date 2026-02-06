import Link from "next/link";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-semibold text-2xl">
          Create an Account
        </CardTitle>
        <CardDescription>
          Sign up to start your cybersecurity learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignUpForm />
        <p className="text-muted-foreground text-xs">
          By signing up you agree to our{" "}
          <Link className="text-primary hover:underline" href="/terms">
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link className="text-primary hover:underline" href="/privacy">
            Privacy Policy
          </Link>
        </p>
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
          Already have an account?{" "}
          <Link className="text-primary hover:underline" href="/sign-in">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
