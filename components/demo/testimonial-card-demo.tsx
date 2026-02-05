"use client";

import { ArrowRight, Quote } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function TestimonialCardDemo() {
  const testimonials = [
    {
      quote:
        "SYCOM transformed our security posture completely. Their incident response team saved us during a critical breach.",
      name: "Sarah Chen",
      role: "CTO",
      company: "TechFlow Inc",
      caseStudyLink: "#",
    },
    {
      quote:
        "The managed security services have given us peace of mind. We can focus on our business knowing we're protected.",
      name: "Michael Torres",
      role: "CEO",
      company: "DataCore Systems",
      caseStudyLink: "#",
    },
    {
      quote:
        "Outstanding training programs. Our team's certifications have significantly improved our security capabilities.",
      name: "Emily Johnson",
      role: "IT Director",
      company: "Global Finance Corp",
      caseStudyLink: "#",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.name}>
          <CardContent className="p-6">
            <Quote className="mb-4 h-8 w-8 text-primary/40" />
            <p className="mb-6 text-foreground">{testimonial.quote}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {testimonial.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
              {testimonial.caseStudyLink && (
                <Link
                  className="flex items-center gap-1 font-medium text-primary text-sm hover:text-primary/80"
                  href={testimonial.caseStudyLink}
                >
                  Read case study
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
