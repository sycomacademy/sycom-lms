"use client";

import { Heart, Lightbulb, Scale, Shield, Target, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Unmatchable Work Ethics",
    description:
      "We hold ourselves to the highest standards of professionalism and dedication.",
  },
  {
    icon: Scale,
    title: "Objectivity",
    description:
      "Our recommendations are always based on your best interests, not vendor relationships.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly evolve our methods to stay ahead of emerging threats.",
  },
  {
    icon: Heart,
    title: "Client-First Approach",
    description:
      "Your success is our success. We build long-term partnerships, not transactions.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description:
      "Transparency and honesty guide every interaction and recommendation.",
  },
  {
    icon: Zap,
    title: "Agility",
    description:
      "We respond quickly to threats and adapt to your changing needs.",
  },
];

export function ValuesGridDemo() {
  return (
    <div className="bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-medium text-primary text-sm uppercase tracking-widest">
            Our Values
          </p>
          <h2 className="font-bold text-3xl text-foreground md:text-4xl">
            What Sets Us Apart
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div className="flex gap-4" key={value.title}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground text-lg">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
