"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "Sycom Academy transformed our security awareness program. Our team gained practical skills they apply every day in protecting our organization.",
    author: "Sarah Chen",
    role: "CISO",
    company: "TechCorp Industries",
  },
  {
    quote:
      "The hands-on labs set Sycom apart. The real-world scenarios prepared our team for actual security incidents we've faced.",
    author: "Michael Rodriguez",
    role: "IT Director",
    company: "Healthcare Plus",
  },
  {
    quote:
      "Outstanding certification preparation. 95% of our team passed their CompTIA Security+ exams on the first attempt.",
    author: "Jennifer Walsh",
    role: "Compliance Officer",
    company: "Financial Services Group",
  },
];

export function BusinessTestimonials() {
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
          <span className="font-mono text-primary text-xs uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Trusted by{" "}
            <span className="text-primary">leading organizations</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              key={testimonial.author}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col pt-6">
                  <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-6 border-border border-t pt-4">
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
