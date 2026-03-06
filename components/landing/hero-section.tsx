"use client";

import { ArrowRight, Play, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-4 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary text-sm">
              Cybersecurity Learning Platform
            </span>
          </div>

          <h1 className="mb-6 font-bold text-4xl text-foreground leading-tight md:text-5xl lg:text-6xl">
            <span className="text-balance">
              Master cybersecurity.{" "}
              <span className="text-primary">Advance your career.</span>
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Learn from industry experts with hands-on labs, certification prep,
            and structured learning paths. Join thousands of professionals
            building real-world security skills.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              className="gap-2"
              nativeButton={false}
              render={
                <Link href="/sign-up">
                  Start learning for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
              size="lg"
            />
            <Button
              className="gap-2"
              nativeButton={false}
              render={
                <Link href="#courses">
                  <Play className="h-4 w-4" />
                  Browse courses
                </Link>
              }
              size="lg"
              variant="outline"
            />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-foreground">15k+</span>
              <span>Active learners</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-foreground">98%</span>
              <span>Pass rate</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-foreground">50+</span>
              <span>Expert courses</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
