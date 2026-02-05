"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

const rotatingWords = [
  "IT challenges",
  "security threats",
  "compliance needs",
  "digital transformation",
];

export function AnimatedTextHeroDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-background py-24 lg:py-32">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-medium text-primary text-sm uppercase tracking-widest">
            Enterprise IT & Cybersecurity
          </p>
          <h1 className="mb-6 font-bold text-4xl text-foreground leading-tight md:text-5xl lg:text-6xl">
            <span className="text-balance">Solve your organization&apos;s</span>
            <br />
            <span
              className={cn(
                "inline-block text-primary transition-all duration-300",
                isAnimating
                  ? "translate-y-4 opacity-0"
                  : "translate-y-0 opacity-100"
              )}
            >
              {rotatingWords[currentIndex]}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Partner with industry-leading experts to protect your business,
            streamline operations, and drive innovation with cutting-edge
            technology solutions.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="gap-2" size="lg">
              Schedule a Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Our Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
