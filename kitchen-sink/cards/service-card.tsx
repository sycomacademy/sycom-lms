import {
  ArrowRight,
  Cloud,
  Eye,
  FileCheck,
  Lock,
  Server,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  number: string;
  title: string;
  features: string[];
  icon?: "shield" | "lock" | "eye" | "server" | "cloud" | "file";
  href?: string;
}

const iconMap = {
  shield: Shield,
  lock: Lock,
  eye: Eye,
  server: Server,
  cloud: Cloud,
  file: FileCheck,
};

export function ServiceCard({
  number,
  title,
  features,
  icon = "shield",
  href = "#",
}: ServiceCardProps) {
  const Icon = iconMap[icon];

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all hover:border-primary/50">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <span className="font-bold text-4xl text-primary/20">{number}</span>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="mb-4 font-semibold text-foreground text-xl">{title}</h3>
        <ul className="mb-6 space-y-2">
          {features.map((feature) => (
            <li
              className="flex items-center gap-2 text-muted-foreground text-sm"
              key={feature}
            >
              <span className="h-1 w-1 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Link
          className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
          href={href}
        >
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function ServiceCardDemo() {
  const services = [
    {
      number: "01",
      title: "Incident Response",
      features: [
        "24/7 Emergency Response",
        "Forensic Analysis",
        "Recovery Planning",
        "Post-Incident Review",
      ],
      icon: "shield" as const,
    },
    {
      number: "02",
      title: "Threat Intelligence",
      features: [
        "Real-time Monitoring",
        "Threat Detection",
        "Vulnerability Assessment",
        "Risk Analysis",
      ],
      icon: "eye" as const,
    },
    {
      number: "03",
      title: "Managed Security",
      features: [
        "SOC Services",
        "Endpoint Protection",
        "Network Security",
        "Cloud Security",
      ],
      icon: "lock" as const,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.number} {...service} />
      ))}
    </div>
  );
}
