"use client";

import {
  BookOpen,
  Crosshair,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: FlaskConical,
    title: "Hands-On Labs",
    description:
      "Practice in real virtual environments. Attack, defend, and remediate in safe, isolated lab scenarios that mirror production systems.",
    accent: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Certification Prep",
    description:
      "Structured pathways for CompTIA, ISC2, EC-Council, and Microsoft certifications. Practice exams, study guides, and instructor support.",
    accent: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: Users,
    title: "Cohort Learning",
    description:
      "Learn alongside peers in structured cohorts. Collaborate on challenges, participate in group exercises, and build your professional network.",
    accent: "bg-amber-500/10 text-amber-400",
  },
  {
    icon: ShieldCheck,
    title: "Expert Instructors",
    description:
      "Learn from active security practitioners with real-world experience across incident response, penetration testing, and compliance.",
    accent: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: Crosshair,
    title: "Threat Simulations",
    description:
      "Face realistic attack scenarios. From phishing campaigns to APT simulations, develop the instincts needed for real-world defense.",
    accent: "bg-red-500/10 text-red-400",
  },
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    description:
      "Progress through carefully designed learning paths. Each module builds on the last, ensuring deep understanding of core concepts.",
    accent: "bg-cyan-500/10 text-cyan-400",
  },
];

export function Features() {
  return (
    <section
      className="relative bg-[oklch(0.08_0.005_285.823)] py-24"
      id="features"
    >
      {/* Subtle diagonal accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 0.02) 25%, transparent 25%, transparent 50%, oklch(0.623 0.214 259.815 / 0.02) 50%, oklch(0.623 0.214 259.815 / 0.02) 75%, transparent 75%)",
          backgroundSize: "4px 4px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
            Platform Features
          </span>
          <h2 className="mt-3 font-bold text-3xl text-white sm:text-4xl">
            Everything you need to{" "}
            <span className="text-brand">launch your career</span> in
            cybersecurity
          </h2>
          <p className="mt-4 text-lg text-white/40 leading-relaxed">
            A complete learning platform built by security professionals who
            know what it takes to succeed in the field.
          </p>
        </motion.div>

        <div className="grid gap-px border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              className="group relative bg-[oklch(0.08_0.005_285.823)] p-8 transition-colors hover:bg-[oklch(0.1_0.005_285.823)]"
              initial={{ opacity: 0, y: 20 }}
              key={feature.title}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div
                className={`mb-4 flex size-10 items-center justify-center ${feature.accent}`}
              >
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 font-semibold text-lg text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent line */}
              <div className="absolute bottom-0 left-0 h-px w-0 bg-brand transition-all duration-500 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
