"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { mockStats } from "@/packages/utils/mock-data";

const NUMERIC_REGEX = /[^0-9.]/g;
const NON_NUMERIC_REGEX = /[0-9.,]/g;

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) {
      return;
    }

    const numericPart = value.replace(NUMERIC_REGEX, "");
    const target = Number.parseFloat(numericPart);
    const suffix = value.replace(NON_NUMERIC_REGEX, "");
    const hasComma = value.includes(",");
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(eased * target);
      const formatted = hasComma ? current.toLocaleString() : String(current);
      setDisplay(`${formatted}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

export function Stats() {
  return (
    <section className="relative border-white/5 border-y bg-[oklch(0.1_0.005_285.823)] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {mockStats.map((stat, i) => (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              key={stat.id}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <p className="font-bold font-mono text-3xl text-brand sm:text-4xl">
                <AnimatedNumber value={stat.value} />
              </p>
              <p className="mt-1 font-semibold text-sm text-white">
                {stat.label}
              </p>
              <p className="mt-1 text-white/30 text-xs">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
