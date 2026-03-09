"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { CircleCheckBig } from "@/components/icons/animated/circle-check-big";
import { Route } from "@/components/icons/animated/route";
import { UserRound } from "@/components/icons/animated/user-round";
import { AnimateIcon } from "@/components/icons/core/icon";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps: {
  number: string;
  icon: ComponentType<{ size?: number }>;
  title: string;
  description: string;
}[] = [
  {
    number: "01",
    icon: UserRound,
    title: "Enroll & Assess",
    description:
      "Create your account and take a skills assessment. We'll recommend the right certification path based on your experience level and career goals.",
  },
  {
    number: "02",
    icon: Route,
    title: "Learn & Practice",
    description:
      "Follow structured modules with video lessons, reading material, and hands-on labs. Practice in real environments with guided exercises and challenges.",
  },
  {
    number: "03",
    icon: CircleCheckBig,
    title: "Certify & Advance",
    description:
      "Pass practice exams with confidence, earn your certification, and join our alumni network. Get career support and access to advanced training.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative bg-background py-24" id="how-it-works">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary text-xs uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            From beginner to certified in{" "}
            <span className="text-primary">three steps</span>
          </h2>
        </motion.div>

        <div className="relative grid gap-8 lg:grid-cols-3">
          <div className="absolute top-16 right-0 left-0 hidden h-px bg-linear-to-r from-transparent via-border to-transparent lg:block" />

          {steps.map((step, i) => (
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              key={step.number}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {" "}
              <AnimateIcon animateOnHover>
                <Card>
                  <CardContent>
                    <div className="mb-6 flex items-center gap-4">
                      <span className="font-bold font-mono text-3xl text-primary">
                        {step.number}
                      </span>
                      <div className="flex size-10 items-center justify-center border border-primary text-primary">
                        <step.icon size={20} />
                      </div>
                    </div>

                    <h3 className="mb-3 font-semibold text-xl">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimateIcon>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            size="lg"
          >
            Begin Your Journey
            <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
