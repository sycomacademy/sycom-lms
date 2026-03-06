"use client";

import { Quote, Star } from "lucide-react";
import FadeContent from "@/components/reactbits/fade-content";
import { SectionLabel } from "@/components/ui/section-label";
import { mockTestimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28" id="testimonials">
      <div className="container mx-auto px-4">
        <FadeContent blur duration={800}>
          <SectionLabel label="Testimonials" />
          <div className="mb-14 text-center">
            <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
              What our students say
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Hear from professionals who have transformed their careers with
              our cybersecurity training programmes.
            </p>
          </div>
        </FadeContent>

        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTestimonials.map((testimonial, i) => (
            <FadeContent
              blur
              delay={i * 80}
              duration={500}
              key={testimonial.id}
            >
              <div className="flex h-full flex-col border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <Quote className="mb-4 h-6 w-6 text-brand/40" />

                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      className="h-3.5 w-3.5 fill-warning text-warning"
                      key={`${testimonial.id}-star-${j}`}
                    />
                  ))}
                </div>

                <p className="mb-6 flex-1 text-foreground/80 text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 border-border/50 border-t pt-4">
                  <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
                    <span className="font-semibold text-xs">
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
              </div>
            </FadeContent>
          ))}
        </div>
      </div>
    </section>
  );
}
