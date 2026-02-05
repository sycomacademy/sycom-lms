"use client";

import { Award } from "lucide-react";

export function AffiliationsDemo() {
  const affiliations = [
    { name: "CompTIA", type: "Training Partner" },
    { name: "ISC2", type: "Official Partner" },
    { name: "EC-Council", type: "Authorized Center" },
    { name: "ISACA", type: "Training Provider" },
    { name: "SANS", type: "Affiliate" },
  ];

  return (
    <div className="border-border border-y bg-background py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center font-medium text-muted-foreground text-sm uppercase tracking-widest">
          Our Affiliations & Certifications
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {affiliations.map((affiliation) => (
            <div
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-6 py-3"
              key={affiliation.name}
            >
              <Award className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {affiliation.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {affiliation.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
