"use client";

import {
  Award,
  Clock,
  GraduationCap,
  Headphones,
  Laptop,
  type LucideIcon,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeatureCardDemo() {
  const features = [
    {
      icon: GraduationCap,
      title: "Expert Instructors",
      description:
        "Learn from industry veterans with real-world experience in cybersecurity.",
    },
    {
      icon: Laptop,
      title: "Hands-On Learning",
      description:
        "Practice in realistic lab environments with guided exercises and scenarios.",
    },
    {
      icon: Users,
      title: "Small Class Sizes",
      description:
        "Get personalized attention with our limited enrollment training sessions.",
    },
    {
      icon: Award,
      title: "Industry Certifications",
      description:
        "Prepare for CompTIA, ISC2, and other recognized certification exams.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description:
        "Choose from weekday, weekend, or self-paced online learning options.",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description:
        "Access our support team anytime you need help with your coursework.",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard
          description={feature.description}
          icon={feature.icon}
          key={feature.title}
          title={feature.title}
        />
      ))}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center transition-all hover:border-primary/50">
      <CardContent className="p-6">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-2 font-semibold text-foreground text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
