"use client";

import {
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";

const features: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    icon: Users,
    title: "Team Management",
    description:
      "Easily manage learners across departments, teams, and locations. Role-based access control and team hierarchies.",
  },
  {
    icon: Target,
    title: "Custom Learning Paths",
    description:
      "Tailor training programs to your organization's specific needs, compliance requirements, and skill gaps.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Training",
    description:
      "Meet industry regulations with pre-built compliance courses. SOC 2, HIPAA, GDPR, PCI-DSS, and more.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track progress, identify skill gaps, and measure ROI with comprehensive reporting and analytics.",
  },
  {
    icon: CheckCircle2,
    title: "Certification Tracking",
    description:
      "Monitor employee certifications, set renewal reminders, and ensure your team stays qualified.",
  },
  {
    icon: BookOpen,
    title: "Unlimited Course Access",
    description:
      "Full access to our entire library of cybersecurity courses, labs, and certification prep materials.",
  },
  {
    icon: FileText,
    title: "Custom Content",
    description:
      "Upload your own training materials, policies, and procedures. Brand the platform as your own.",
  },
  {
    icon: Building2,
    title: "SSO Integration",
    description:
      "Seamless integration with your existing identity provider. SAML, OIDC, and Active Directory support.",
  },
];

export function BusinessFeatures() {
  return (
    <section className="relative bg-background py-24" id="features">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary text-xs uppercase tracking-widest">
            Enterprise Features
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Everything you need to{" "}
            <span className="text-primary">train your team</span> at scale
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            A complete enterprise learning platform designed for security teams,
            IT departments, and organizations of all sizes.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              key={feature.title}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="pt-6">
                  <div className="mb-4 flex size-10 items-center justify-center border border-primary text-primary">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="mb-2 font-semibold text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
