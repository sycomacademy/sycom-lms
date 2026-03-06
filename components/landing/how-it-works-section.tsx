"use client";

import { BookOpen, Compass, Trophy } from "lucide-react";
import FadeContent from "@/components/reactbits/fade-content";
import { SectionLabel } from "@/components/ui/section-label";
import { mockSteps } from "@/packages/utils/mock-data";

const ICON_MAP: Record<string, typeof Compass> = {
  Compass,
  BookOpen,
  Trophy,
};

export function HowItWorksSection() {
  return (
    <section className="bg-primary py-20 text-primary-foreground lg:py-28">
      <div className="container mx-auto px-4">
        <FadeContent blur duration={800}>
          <SectionLabel className="[&_span]:text-brand" label="How It Works" />
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Your path to cybersecurity expertise
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/60">
              A structured approach that takes you from fundamentals to
              certification, with hands-on practice at every step.
            </p>
          </div>
        </FadeContent>

        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-3 md:gap-6">
          {mockSteps.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Compass;
            return (
              <FadeContent
                blur
                delay={index * 150}
                duration={600}
                key={item.id}
              >
                <div className="relative text-center">
                  {index < mockSteps.length - 1 && (
                    <div className="absolute top-10 left-1/2 hidden h-px w-full bg-primary-foreground/10 md:block" />
                  )}

                  <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-brand/30 bg-brand/10">
                    <Icon className="h-8 w-8 text-brand" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center bg-brand font-bold text-primary text-xs">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="mb-3 font-semibold text-lg">{item.title}</h3>
                  <p className="text-primary-foreground/55 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
