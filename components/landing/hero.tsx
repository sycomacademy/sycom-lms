"use client";

import { ArrowRight, Terminal } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

const terminalLines = [
  { prefix: "$", text: "nmap -sV --script vuln target.local", delay: 0 },
  {
    prefix: ">",
    text: "Discovered 3 critical vulnerabilities",
    delay: 1.8,
    color: "text-red-400",
  },
  { prefix: "$", text: "msfconsole -q -x 'use exploit/CVE-2024'", delay: 3 },
  {
    prefix: ">",
    text: "Session 1 opened (10.0.0.1 -> target)",
    delay: 4.5,
    color: "text-green-400",
  },
  { prefix: "$", text: "python3 remediate.py --patch-all", delay: 5.8 },
  {
    prefix: ">",
    text: "All vulnerabilities patched successfully",
    delay: 7,
    color: "text-brand",
  },
];

function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = terminalLines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay * 1000)
    );
    return () => {
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-2 border-border bg-[oklch(0.08_0.005_285.823)]">
      <div className="flex items-center gap-2 border-white/5 border-b px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-red-500/60" />
        <div className="size-2.5 rounded-full bg-yellow-500/60" />
        <div className="size-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 font-mono text-white/30 text-xs">
          sycom-lab ~ pentest
        </span>
      </div>
      <div className="space-y-1.5 p-4 font-mono text-sm">
        {terminalLines.slice(0, visibleLines).map((line) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
            initial={{ opacity: 0, x: -8 }}
            key={`terminal-line-${line.delay}`}
            transition={{ duration: 0.3 }}
          >
            <span className="select-none text-white/30">{line.prefix}</span>
            <span className={line.color || "text-white/80"}>{line.text}</span>
          </motion.div>
        ))}
        {visibleLines < terminalLines.length && (
          <div className="flex gap-2">
            <span className="text-white/30">$</span>
            <span className="inline-block h-4 w-2 animate-pulse bg-brand" />
          </div>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100dvh-150px)] max-w-7xl items-center gap-12 px-6 pt-16 lg:grid-cols-2 lg:gap-16 lg:pt-0">
      {/* Left column */}
      <div className="flex flex-col items-start">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 p-4" variant={"outline"}>
            <Terminal className="size-3.5 text-primary" />
            <span className="font-mono text-primary text-xs tracking-wide dark:text-muted-foreground">
              HANDS-ON CYBER TRAINING
            </span>
          </Badge>
        </motion.div>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 font-bold text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Master the art of{" "}
          <span className="relative inline-block">
            cyber defense
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
          </span>
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-lg text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Industry-recognized certification training with real-world labs. Built
          by security professionals with 13+ years protecting organizations
          across sectors.
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            size="lg"
          >
            Start Learning
            <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/#courses" />}
            size="lg"
            variant="outline"
          >
            Explore Courses
          </Button>
        </motion.div>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-12 flex items-center gap-6 border-white/5 border-t pt-6"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {[
            { value: "500+", label: "Students Trained" },
            { value: "95%", label: "Pass Rate" },
            { value: "13+", label: "Years Experience" },
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

      {/* Right column - Terminal */}
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        {/* Glow behind terminal */}
        <div className="absolute -inset-4 bg-brand/5 blur-3xl" />
        <div className="relative">
          <TerminalAnimation />
        </div>

        {/* Floating badge */}
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="absolute -right-4 -bottom-4 border border-muted bg-[oklch(0.12_0.005_285.823)] px-4 py-3 sm:right-4 sm:-bottom-6"
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-green-500/10">
              <div className="size-2 rounded-full bg-green-400" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">Lab Active</p>
              <p className="text-white/40 text-xs">Live environment running</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
