"use client";

import { Award, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CertificationCardDemo() {
  const certifications = [
    {
      name: "Security+",
      organization: "CompTIA",
      description: "Foundational cybersecurity certification",
    },
    {
      name: "CISSP",
      organization: "ISC2",
      description: "Advanced security professional certification",
    },
    {
      name: "CySA+",
      organization: "CompTIA",
      description: "Cybersecurity analyst certification",
    },
    {
      name: "CCSP",
      organization: "ISC2",
      description: "Cloud security professional certification",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {certifications.map((cert) => (
        <Card
          className="group relative overflow-hidden transition-all hover:border-primary/50"
          key={cert.name}
        >
          <a className="block" href="/certifications">
            <CardContent className="relative p-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <p className="mb-1 font-medium text-primary text-xs uppercase tracking-wider">
                {cert.organization}
              </p>
              <h3 className="mb-2 font-semibold text-foreground text-lg">
                {cert.name}
              </h3>
              <p className="text-muted-foreground text-sm">
                {cert.description}
              </p>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-primary/90 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex items-center gap-2 font-medium text-primary-foreground text-sm">
                  Click here
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </CardContent>
          </a>
        </Card>
      ))}
    </div>
  );
}
