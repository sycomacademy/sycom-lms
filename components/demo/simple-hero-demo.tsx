"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SimpleHeroDemo() {
  return (
    <div className="relative bg-card py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 font-bold text-3xl text-foreground md:text-4xl lg:text-5xl">
            <span className="text-balance">
              Protect Your Business with Enterprise-Grade Security
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Comprehensive cybersecurity solutions tailored to your
            organization&apos;s unique needs.
          </p>
          <Button className="gap-2" size="lg">
            Find Out More
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
