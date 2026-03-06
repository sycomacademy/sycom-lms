"use client";

import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { mockTestimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="bg-muted/30 py-20 lg:py-28" id="testimonials">
      <div className="container mx-auto px-4">
        <SectionLabel label="Testimonials" />
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            What our students say
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hear from professionals who have transformed their careers with our
            cybersecurity training programmes.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTestimonials.map((testimonial) => (
            <Card
              className="transition-all hover:ring-primary/30"
              key={testimonial.id}
            >
              <CardContent className="p-6">
                <Quote className="mb-4 h-7 w-7 text-primary/30" />

                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      className="h-4 w-4 fill-warning text-warning"
                      key={`${testimonial.id}-star-${i}`}
                    />
                  ))}
                </div>

                <p className="mb-6 text-foreground text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                    <span className="font-semibold text-primary text-sm">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
