"use client";

import { Cloud, Eye, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const solutions = [
  {
    id: "endpoint",
    icon: Shield,
    title: "Endpoint Protection",
    description:
      "Advanced endpoint detection and response (EDR) solutions to protect all your devices from sophisticated threats.",
    features: ["Real-time monitoring", "Automated response", "Threat hunting"],
  },
  {
    id: "network",
    icon: Lock,
    title: "Network Security",
    description:
      "Comprehensive network security including firewalls, intrusion detection, and secure access controls.",
    features: ["Firewall management", "IDS/IPS", "VPN solutions"],
  },
  {
    id: "monitoring",
    icon: Eye,
    title: "Security Monitoring",
    description:
      "24/7 security operations center (SOC) monitoring to detect and respond to threats in real-time.",
    features: ["SIEM integration", "Alert triage", "Incident response"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Security",
    description:
      "Secure your cloud infrastructure across AWS, Azure, and Google Cloud platforms.",
    features: ["Cloud posture management", "Container security", "IAM review"],
  },
];

export function SolutionsList() {
  const [activeSolution, setActiveSolution] = useState(solutions[0].id);

  const active = solutions.find((s) => s.id === activeSolution);

  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 font-medium text-primary text-sm uppercase tracking-widest">
            Solutions
          </p>
          <h2 className="font-bold text-3xl text-foreground md:text-4xl">
            Tailored Security Solutions
          </h2>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Navigation */}
          <div className="space-y-2">
            {solutions.map((solution) => (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                  activeSolution === solution.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
                key={solution.id}
                onClick={() => setActiveSolution(solution.id)}
                type="button"
              >
                <solution.icon className="h-5 w-5" />
                <span className="font-medium">{solution.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            {active && (
              <div className="rounded-lg border border-border bg-background p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <active.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground text-xl">
                  {active.title}
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {active.description}
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground text-sm">
                    Key Features:
                  </p>
                  <ul className="space-y-2">
                    {active.features.map((feature) => (
                      <li
                        className="flex items-center gap-2 text-muted-foreground text-sm"
                        key={feature}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
