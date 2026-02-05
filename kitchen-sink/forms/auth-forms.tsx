"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" placeholder="john@company.com" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          placeholder="Enter your password"
          type="password"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label className="text-muted-foreground text-sm" htmlFor="remember">
            Remember me
          </label>
        </div>
        <a className="text-primary text-sm hover:underline" href="#">
          Forgot password?
        </a>
      </div>
      <Button className="w-full" type="submit">
        Sign In
      </Button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="register-firstName">First Name</Label>
          <Input id="register-firstName" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-lastName">Last Name</Label>
          <Input id="register-lastName" placeholder="Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          placeholder="john@company.com"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          placeholder="Create a password"
          type="password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-confirm">Confirm Password</Label>
        <Input
          id="register-confirm"
          placeholder="Confirm your password"
          type="password"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label className="text-muted-foreground text-sm" htmlFor="terms">
          I agree to the{" "}
          <a className="text-primary hover:underline" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="text-primary hover:underline" href="#">
            Privacy Policy
          </a>
        </label>
      </div>
      <Button className="w-full" type="submit">
        Create Account
      </Button>
    </form>
  );
}

export function AuthModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">Login / Register</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs className="mt-4" defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4" value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent className="mt-4" value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
