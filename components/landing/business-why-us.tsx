"use client";

import {
  CheckCircle,
  Clock,
  Headphones,
  RefreshCw,
  Shield,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const reasons = [
  {
    icon: Shield,
    title: "Industry Expertise",
    description:
      "13+ years of real-world security experience protecting organizations across multiple sectors.",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description:
      "95% certification pass rate. Measurable improvements in security awareness and incident response.",
  },
  {
    icon: Clock,
    title: "Flexible Learning",
    description:
      "In-class instructor-led, online, and hands-on lab environments. Learn on your schedule.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description:
      "Direct access to cybersecurity professionals. Mentorship throughout your learning journey.",
  },
  {
    icon: RefreshCw,
    title: "Always Current",
    description:
      "Content updated regularly to reflect the latest threats, techniques, and industry best practices.",
  },
  {
    icon: CheckCircle,
    title: "Practical Experience",
    description:
      "Real-world scenarios and work experience preparation through our immersive training system.",
  },
];

export function BusinessWhyUs() {
  return (
    <section className="border-border border-y bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary text-xs uppercase tracking-widest">
            Why SYCOM
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            The trusted choice for{" "}
            <span className="text-primary">enterprise training</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              key={reason.title}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex size-10 shrink-0 items-center justify-center border border-primary bg-primary/10 text-primary">
                <reason.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{reason.title}</h3>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
