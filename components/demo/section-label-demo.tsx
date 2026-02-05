"use client";

import { cn } from "@/packages/utils/cn";

interface SectionLabelProps {
  number?: string;
  label: string;
  className?: string;
}

function SectionLabel({ number, label, className }: SectionLabelProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {number && (
        <>
          <span className="font-medium text-primary text-sm">{number}</span>
          <span className="h-px w-8 bg-primary" />
        </>
      )}
      <span className="font-medium text-muted-foreground text-sm uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export function SectionLabelDemo() {
  return (
    <div className="space-y-6">
      <SectionLabel label="Incident Response" number="01" />
      <SectionLabel label="Threat Intelligence" number="02" />
      <SectionLabel label="Security Assessment" number="03" />
      <SectionLabel label="Our Services" />
      <SectionLabel label="About Us" />
    </div>
  );
}
