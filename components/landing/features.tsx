"use client";

import { motion } from "motion/react";
import type { ComponentType } from "react";
import { BadgeCheck } from "@/components/icons/animated/badge-check";
import { Cctv } from "@/components/icons/animated/cctv";
import { Compass } from "@/components/icons/animated/compass";
import { Layers } from "@/components/icons/animated/layers";
import { Terminal } from "@/components/icons/animated/terminal";
import { Users } from "@/components/icons/animated/users";
import { AnimateIcon } from "@/components/icons/core/icon";
import { Card, CardContent } from "@/components/ui/card";

const features: {
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
}[] = [
  {
    icon: Terminal,
    title: "Hands-On Labs",
    description:
      "Practice in real virtual environments. Attack, defend, and remediate in safe, isolated lab scenarios that mirror production systems.",
  },
  {
    icon: BadgeCheck,
    title: "Certification Prep",
    description:
      "Structured pathways for CompTIA, ISC2, EC-Council, and Microsoft certifications. Practice exams, study guides, and instructor support.",
  },
  {
    icon: Users,
    title: "Cohort Learning",
    description:
      "Learn alongside peers in structured cohorts. Collaborate on challenges, participate in group exercises, and build your professional network.",
  },
  {
    icon: Compass,
    title: "Expert Instructors",
    description:
      "Learn from active security practitioners with real-world experience across incident response, penetration testing, and compliance.",
  },
  {
    icon: Cctv,
    title: "Threat Simulations",
    description:
      "Face realistic attack scenarios. From phishing campaigns to APT simulations, develop the instincts needed for real-world defense.",
  },
  {
    icon: Layers,
    title: "Structured Curriculum",
    description:
      "Progress through carefully designed learning paths. Each module builds on the last, ensuring deep understanding of core concepts.",
  },
];

export function Features() {
  return (
    <section className="relative bg-background py-24" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary text-xs uppercase tracking-widest">
            Platform Features
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Everything you need to{" "}
            <span className="text-primary">launch your career</span> in
            cybersecurity
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            A complete learning platform built by security professionals who
            know what it takes to succeed in the field.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              key={feature.title}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <AnimateIcon animateOnHover>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardContent>
                    <div className="mb-4 flex size-10 items-center justify-center border border-primary text-primary">
                      <feature.icon size={20} />
                    </div>
                    <h3 className="mb-2 font-semibold text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimateIcon>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
