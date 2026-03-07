"use client";

import { motion } from "motion/react";

const certifications = [
  "CompTIA Security+",
  "CompTIA CySA+",
  "CompTIA PenTest+",
  "ISC2 CISSP",
  "ISC2 CC",
  "EC-Council CEH",
  "Microsoft SC-900",
  "CompTIA A+",
  "CompTIA Network+",
  "ISACA CISM",
];

function MarqueeRow({
  items,
  direction = "left",
}: {
  items: string[];
  direction?: "left" | "right";
}) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Edge fades */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r from-[oklch(0.1_0.005_285.823)] to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[oklch(0.1_0.005_285.823)] to-transparent" />

      <div
        className="flex w-max gap-4"
        style={{
          animation: `marquee-${direction} 40s linear infinite`,
        }}
      >
        {doubled.map((cert, i) => (
          <div
            className="flex shrink-0 items-center gap-3 border border-white/5 bg-white/[0.02] px-5 py-3 transition-colors hover:border-brand/20 hover:bg-brand/5"
            key={`${cert}-${i}`}
          >
            <div className="flex size-6 items-center justify-center bg-brand/10 font-bold font-mono text-brand text-xs">
              {cert
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>
            <span className="whitespace-nowrap font-medium text-sm text-white/60">
              {cert}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Partners() {
  const firstHalf = certifications.slice(0, 5);
  const secondHalf = certifications.slice(5);

  return (
    <section
      className="relative bg-[oklch(0.1_0.005_285.823)] py-20"
      id="certifications"
    >
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
            Certification Paths
          </span>
          <h2 className="mt-3 font-bold text-2xl text-white sm:text-3xl">
            Industry-Recognized Credentials
          </h2>
        </motion.div>
      </div>

      <div className="space-y-4">
        <MarqueeRow direction="left" items={firstHalf} />
        <MarqueeRow direction="right" items={secondHalf} />
      </div>

      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
