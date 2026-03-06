"use client";

import { ArrowRight, Shield, Terminal } from "lucide-react";
import Link from "next/link";
import BlurText from "@/components/reactbits/blur-text";
import ShinyText from "@/components/reactbits/shiny-text";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-primary text-primary-foreground">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 bg-brand/20 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-64 w-64 bg-highlight/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-28 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-2 backdrop-blur-sm">
            <Terminal className="h-4 w-4 text-brand" />
            <ShinyText
              className="font-medium text-sm"
              color="rgba(255,255,255,0.5)"
              shineColor="rgba(255,255,255,1)"
              speed={3}
              text="Cybersecurity Learning Platform"
            />
          </div>

          <div className="mb-8">
            <BlurText
              animateBy="words"
              className="font-bold text-4xl leading-tight md:text-6xl lg:text-7xl"
              delay={80}
              text="Master cybersecurity."
            />
            <BlurText
              animateBy="words"
              className="mt-2 font-bold text-4xl text-brand leading-tight md:text-6xl lg:text-7xl"
              delay={80}
              text="Advance your career."
            />
          </div>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-primary-foreground/70 md:text-xl">
            Learn from industry experts with hands-on labs, certification prep,
            and structured learning paths. Join thousands of professionals
            building real-world security skills.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              className="gap-2 border-brand bg-brand text-primary hover:bg-brand/90"
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
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground/60 hover:bg-primary-foreground/10"
              nativeButton={false}
              render={
                <Link href="#courses">
                  <Shield className="h-4 w-4" />
                  Browse courses
                </Link>
              }
              size="lg"
              variant="outline"
            />
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-10 text-primary-foreground/50 text-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-3xl text-primary-foreground">
                15k+
              </span>
              <span>Active learners</span>
            </div>
            <div className="h-10 w-px bg-primary-foreground/20" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-3xl text-primary-foreground">
                98%
              </span>
              <span>Pass rate</span>
            </div>
            <div className="h-10 w-px bg-primary-foreground/20" />
            <div className="flex flex-col items-center gap-1">
              <span className="font-bold text-3xl text-primary-foreground">
                50+
              </span>
              <span>Expert courses</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
