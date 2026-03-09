"use client";

import { ArrowRight, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function BusinessHero() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100dvh-150px)] max-w-7xl items-center gap-12 px-6 pt-16 lg:grid-cols-2 lg:gap-16 lg:pt-0">
      <div className="flex flex-col items-start">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 p-4" variant={"outline"}>
            <Building2 className="size-3.5 text-primary" />
            <span className="font-mono text-primary text-xs tracking-wide dark:text-muted-foreground">
              ENTERPRISE SOLUTIONS
            </span>
          </Badge>
        </motion.div>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Build a{" "}
          <span className="relative inline-block">
            security-first
            <svg
              aria-hidden="true"
              className="absolute -bottom-1 left-0 w-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 300 8"
            >
              <path
                className="stroke-primary"
                d="M1 5.5C71 2 149 1 299 5.5"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </span>{" "}
          organization
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-lg text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Comprehensive cybersecurity training for your entire team. Custom
          learning paths, compliance-ready courses, and hands-on labs that scale
          with your organization.
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            nativeButton={false}
            render={
              // biome-ignore lint/a11y/useAnchorContent: Base UI render prop injects children
              <a href="mailto:info@sycom.academy" />
            }
            size="lg"
          >
            Contact Us
            <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
          </Button>
          <Button size="lg" variant="outline">
            View Pricing
          </Button>
        </motion.div>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-12 flex items-center gap-6 border-white/5 border-t pt-6"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            { value: "70+", label: "Clients" },
            { value: "500+", label: "Students Trained" },
            { value: "95%", label: "Pass Rate" },
          ].map((stat) => (
            <div className="flex flex-col" key={stat.label}>
              <span className="font-bold font-mono text-primary text-xl">
                {stat.value}
              </span>
              <span className="text-xs">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="absolute -inset-4 bg-primary/5 blur-3xl" />
        <div className="relative overflow-hidden border-2 border-border bg-[oklch(0.08_0.005_285.823)]">
          <div className="flex items-center gap-2 border-white/5 border-b px-4 py-2.5">
            <div className="size-2.5 rounded-full bg-red-500/60" />
            <div className="size-2.5 rounded-full bg-yellow-500/60" />
            <div className="size-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 font-mono text-white/30 text-xs">
              sycom-enterprise ~ dashboard
            </span>
          </div>
          <div className="space-y-3 p-6 font-mono text-sm">
            <div className="flex items-center gap-3 border-white/10 border-b pb-3">
              <div className="size-2 rounded-full bg-green-400" />
              <span className="text-white/80">Security Training Progress</span>
              <span className="ml-auto text-green-400">87%</span>
            </div>
            <div className="flex items-center gap-3 border-white/10 border-b pb-3">
              <div className="size-2 rounded-full bg-yellow-400" />
              <span className="text-white/80">Compliance Score</span>
              <span className="ml-auto text-yellow-400">94%</span>
            </div>
            <div className="flex items-center gap-3 border-white/10 border-b pb-3">
              <div className="size-2 rounded-full bg-blue-400" />
              <span className="text-white/80">Active Learners</span>
              <span className="ml-auto text-blue-400">1,247</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-purple-400" />
              <span className="text-white/80">Certifications Earned</span>
              <span className="ml-auto text-purple-400">342</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
