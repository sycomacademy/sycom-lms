"use client";

import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex flex-col gap-4">
        <h1 className="font-semibold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
          Master Cybersecurity with Expert Training
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Prepare for industry-leading certifications with comprehensive courses
          designed by cybersecurity experts. Start your journey today.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">
          Explore Courses
          <ArrowRightIcon />
        </Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </div>
    </div>
  );
}
