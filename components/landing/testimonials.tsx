"use client";

import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { mockTestimonials } from "@/packages/utils/mock-data";

export function Testimonials() {
  return (
    <section className="relative bg-[oklch(0.1_0.005_285.823)] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 font-bold text-3xl text-white sm:text-4xl">
            Trusted by{" "}
            <span className="text-brand">security professionals</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTestimonials.slice(0, 6).map((testimonial, i) => (
            <motion.div
              className="relative border border-white/5 bg-[oklch(0.08_0.005_285.823)] p-6 transition-colors hover:border-white/10"
              initial={{ opacity: 0, y: 20 }}
              key={testimonial.id}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Quote className="mb-4 size-5 text-brand/20" />

              <p className="mb-6 text-sm text-white/60 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-white/5 border-t pt-4">
                {/* Avatar placeholder */}
                <div className="flex size-9 items-center justify-center bg-brand/10 font-bold font-mono text-brand text-xs">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-white/30 text-xs">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, s) => (
                    <Star
                      className="size-3 fill-amber-400 text-amber-400"
                      key={`star-${testimonial.id}-${s}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
