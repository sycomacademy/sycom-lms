import Link from "next/link";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SignUpPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-muted/30 p-4">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <FieldGroup>
                  <Input placeholder="John" type="text" />
                </FieldGroup>
              </Field>
              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <FieldGroup>
                  <Input placeholder="Doe" type="text" />
                </FieldGroup>
              </Field>
            </div>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldGroup>
                <Input placeholder="you@example.com" type="email" />
              </FieldGroup>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldGroup>
                <Input placeholder="••••••••" type="password" />
              </FieldGroup>
            </Field>
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
            <Button className="w-full" size="lg">
              Create Account
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-muted-foreground text-xs uppercase">
                <span className="bg-card px-2">Or continue with</span>
              </div>
            </div>
            <div className="space-y-3">
              <OAuthButton provider="google" />
              <OAuthButton provider="linkedin" />
            </div>
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
      </main>
      <Footer />
    </>
  );
}
