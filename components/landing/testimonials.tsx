"use client";

import { MessageSquare, Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { mockTestimonials } from "@/packages/utils/mock-data";

export function Testimonials() {
  return (
    <section className="relative bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Trusted by{" "}
            <span className="text-primary">security professionals</span>
          </h2>
        </motion.div>

        {mockTestimonials.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle>No testimonials yet</EmptyTitle>
              <EmptyDescription>
                Testimonials from our learners will appear here as they share
                their experiences.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockTestimonials.slice(0, 6).map((testimonial, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                key={testimonial.id}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full">
                  <CardContent>
                    <Quote className="mb-4 size-5 text-primary/20" />
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </CardContent>

                  <CardFooter className="gap-3">
                    <div className="flex size-9 items-center justify-center bg-primary/10 font-bold font-mono text-primary text-xs">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map(
                        (_, s) => (
                          <Star
                            className="size-3 fill-amber-400 text-amber-400"
                            key={`star-${testimonial.id}-${s}`}
                          />
                        )
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
