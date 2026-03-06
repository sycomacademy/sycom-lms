"use client";

import CountUp from "@/components/reactbits/count-up";
import FadeContent from "@/components/reactbits/fade-content";

const stats = [
  {
    value: 15_000,
    suffix: "+",
    label: "Active Learners",
    description: "Professionals advancing their cybersecurity careers",
  },
  {
    value: 98,
    suffix: "%",
    label: "Pass Rate",
    description: "Certification exam pass rate for course completers",
  },
  {
    value: 200,
    suffix: "+",
    label: "Lab Environments",
    description: "Hands-on labs simulating real-world scenarios",
  },
  {
    value: 50,
    suffix: "+",
    label: "Expert Courses",
    description: "Covering every major cybersecurity domain",
  },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-border/50 border-y bg-muted/30 py-20 lg:py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-brand/3" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <FadeContent blur duration={600} key={stat.label}>
              <div className="text-center">
                <p className="mb-2 font-bold text-4xl text-foreground md:text-5xl">
                  <CountUp
                    className="font-bold"
                    delay={0.2}
                    duration={2.5}
                    separator=","
                    to={stat.value}
                  />
                  <span className="text-brand">{stat.suffix}</span>
                </p>
                <p className="mb-1 font-semibold text-foreground text-sm">
                  {stat.label}
                </p>
                <p className="text-muted-foreground text-xs">
                  {stat.description}
                </p>
              </div>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}
