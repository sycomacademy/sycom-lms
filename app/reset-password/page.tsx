import Link from "next/link";
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

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-semibold text-2xl">
              Reset Password
            </CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>New Password</FieldLabel>
              <FieldGroup>
                <Input placeholder="••••••••" type="password" />
              </FieldGroup>
            </Field>
            <Field>
              <FieldLabel>Confirm Password</FieldLabel>
              <FieldGroup>
                <Input placeholder="••••••••" type="password" />
              </FieldGroup>
            </Field>
            <Button className="w-full" size="lg">
              Reset Password
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link
              className="text-primary text-sm hover:underline"
              href="/sign-in"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
