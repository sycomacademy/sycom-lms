"use client";

import { motion } from "motion/react";
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from "@/components/landing/marquee";

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

function CertItem({ cert }: { cert: string }) {
  return (
    <MarqueeItem className="mx-2">
      <div className="flex items-center gap-3 border border-border bg-card px-5 py-3 transition-colors hover:border-primary/20 hover:bg-primary/5">
        <div className="flex size-6 items-center justify-center bg-primary/10 font-bold font-mono text-primary text-xs">
          {cert
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <span className="whitespace-nowrap font-medium text-muted-foreground text-sm">
          {cert}
        </span>
      </div>
    </MarqueeItem>
  );
}

export function Partners() {
  return (
    <section className="relative bg-background py-20" id="certifications">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
            Certification Paths
          </span>
          <h2 className="mt-3 font-bold text-2xl text-foreground sm:text-3xl">
            Industry-Recognized Credentials
          </h2>
        </motion.div>
      </div>

      <div className="space-y-4">
        <Marquee>
          <MarqueeFade side="left" />
          <MarqueeContent direction="left" speed={30}>
            {certifications.map((cert) => (
              <CertItem cert={cert} key={cert} />
            ))}
          </MarqueeContent>
          <MarqueeFade side="right" />
        </Marquee>

        <Marquee>
          <MarqueeFade side="left" />
          <MarqueeContent direction="right" speed={30}>
            {certifications.map((cert) => (
              <CertItem cert={cert} key={cert} />
            ))}
          </MarqueeContent>
          <MarqueeFade side="right" />
        </Marquee>
      </div>
    </section>
  );
}
