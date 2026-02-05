"use client";

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

export function LoginPageDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-semibold text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <button className="hover:text-foreground" type="button">
              Forgot password?
            </button>
          </div>
          <Button className="w-full" size="lg">
            Sign In
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-muted-foreground text-xs uppercase">
              <span className="bg-card px-2">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">Google</Button>
            <Button variant="outline">GitHub</Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-muted-foreground text-xs">
            Don't have an account?{" "}
            <button className="text-primary hover:underline" type="button">
              Sign up
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
