"use client";

import {
  Award,
  FlaskConical,
  GraduationCap,
  RefreshCcw,
  Route,
  Users,
} from "lucide-react";
import FadeContent from "@/components/reactbits/fade-content";
import SpotlightCard from "@/components/reactbits/spotlight-card";
import { SectionLabel } from "@/components/ui/section-label";
import { mockFeatures } from "@/lib/mock-data";

const ICON_MAP: Record<string, typeof Award> = {
  Award,
  FlaskConical,
  GraduationCap,
  Users,
  Route,
  RefreshCcw,
};

export function FeaturesSection() {
  return (
    <section
      className="bg-primary py-20 text-primary-foreground lg:py-28"
      id="features"
    >
      <div className="container mx-auto px-4">
        <FadeContent blur duration={800}>
          <SectionLabel
            className="[&_span]:text-brand"
            label="Platform Features"
          />
          <div className="mb-14 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/60">
              From hands-on labs to certification prep, our platform equips you
              with the tools and knowledge to build a career in cybersecurity.
            </p>
          </div>
        </FadeContent>

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockFeatures.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] ?? Award;
            return (
              <FadeContent blur delay={i * 100} duration={600} key={feature.id}>
                <SpotlightCard
                  className="h-full border border-primary-foreground/10 p-6"
                  spotlightColor="rgba(100, 160, 255, 0.12)"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center bg-brand/15">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="mb-2 font-semibold text-primary-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-primary-foreground/55 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </SpotlightCard>
              </FadeContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
