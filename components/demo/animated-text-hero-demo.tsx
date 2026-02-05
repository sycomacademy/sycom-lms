"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
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
        <Label htmlFor="hero-login-email">Email</Label>
        <Input
          id="hero-login-email"
          placeholder="you@example.com"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero-login-password">Password</Label>
        <Input
          id="hero-login-password"
          placeholder="Enter your password"
          type="password"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="hero-remember" />
          <label
            className="text-muted-foreground text-sm"
            htmlFor="hero-remember"
          >
            Remember me
          </label>
        </div>
        <a
          className="text-primary text-sm hover:underline"
          href="/forgot-password"
        >
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
          <Label htmlFor="hero-register-firstName">First Name</Label>
          <Input id="hero-register-firstName" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero-register-lastName">Last Name</Label>
          <Input id="hero-register-lastName" placeholder="Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero-register-email">Email</Label>
        <Input
          id="hero-register-email"
          placeholder="you@example.com"
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero-register-password">Password</Label>
        <Input
          id="hero-register-password"
          placeholder="Create a password"
          type="password"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="hero-terms" />
        <label className="text-muted-foreground text-sm" htmlFor="hero-terms">
          I agree to the{" "}
          <a className="text-primary hover:underline" href="/terms">
            Terms
          </a>{" "}
          and{" "}
          <a className="text-primary hover:underline" href="/privacy">
            Privacy Policy
          </a>
        </label>
      </div>
      <Button className="w-full" type="submit">
        Create account
      </Button>
    </form>
  );
}

export function AnimatedTextHeroDemo() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="relative w-full overflow-hidden bg-background py-24 lg:py-32">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-medium text-primary text-sm uppercase tracking-widest">
            Cybersecurity learning platform
          </p>
          <h1 className="mb-6 font-bold text-4xl text-foreground leading-tight md:text-5xl lg:text-6xl">
            <span className="text-balance">
              Your cybersecurity journey starts here.
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Learn from industry experts, earn recognised certifications, and
            advance your career with structured courses and hands-on labs—all in
            one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Dialog onOpenChange={setLoginOpen} open={loginOpen}>
              <DialogTrigger
                render={
                  <Button className="gap-2" size="lg">
                    Join for free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Welcome</DialogTitle>
                  <DialogDescription>
                    Sign in to your account or create one to start learning.
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
            <Button
              nativeButton={false}
              render={<Link href="/courses">See courses</Link>}
              size="lg"
              variant="outline"
            >
              See courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
