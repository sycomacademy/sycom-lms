"use client";

import { useEffect, useRef } from "react";

const partners = [
  "Microsoft",
  "AWS",
  "Google Cloud",
  "Cisco",
  "Palo Alto",
  "CrowdStrike",
  "Splunk",
  "Okta",
];

export function PartnerLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    let animationId: number;
    let position = 0;

    const animate = () => {
      position += 0.5;
      if (position >= scroll.scrollWidth / 2) {
        position = 0;
      }
      scroll.scrollLeft = position;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <section className="border-border border-y bg-background py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center font-medium text-muted-foreground text-sm uppercase tracking-widest">
          Trusted by Industry Leaders
        </p>
        <div
          className="flex gap-12 overflow-hidden"
          ref={scrollRef}
          style={{ scrollBehavior: "auto" }}
        >
          {[...partners, ...partners].map((partner, index) => (
            <div
              className="flex h-12 min-w-[150px] shrink-0 items-center justify-center rounded-lg bg-secondary px-6"
              key={`${partner}-${index}`}
            >
              <span className="font-medium text-muted-foreground text-sm">
                {partner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
