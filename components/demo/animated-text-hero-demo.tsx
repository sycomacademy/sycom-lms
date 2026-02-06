"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AnimatedTextHeroDemo() {
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
            <Button
              className="gap-2"
              nativeButton={false}
              render={
                <Link href="/sign-in">
                  Join for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
              size="lg"
            />
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
