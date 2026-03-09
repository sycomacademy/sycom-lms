"use client";

import { motion } from "motion/react";

export function BusinessStats() {
  const stats = [
    {
      value: "70+",
      label: "Clients",
      description: "Organizations worldwide",
    },
    {
      value: "500+",
      label: "Students Trained",
      description: "Across all industries",
    },
    {
      value: "95%",
      label: "Pass Rate",
      description: "Certification success rate",
    },
    {
      value: "13+",
      label: "Years Experience",
      description: "Protecting organizations",
    },
  ];

  return (
    <section className="border-border border-y bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              key={stat.label}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="font-bold font-mono text-4xl text-primary">
                {stat.value}
              </div>
              <div className="mt-2 font-semibold text-foreground text-sm">
                {stat.label}
              </div>
              <div className="mt-1 text-muted-foreground text-xs">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
