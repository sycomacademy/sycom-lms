"use client";

import { Quote, Star } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const mockTestimonials = [
  {
    id: "testimonial-1",
    quote:
      "Sycom completely changed how I approach certifications. The hands-on labs made concepts click in ways that reading textbooks never could. I passed my CompTIA Security+ on the first try.",
    name: "Alex Rivera",
    role: "Security Analyst",
    company: "TechShield Inc.",
    avatarUrl: "/images/testimonials/alex.jpg",
    rating: 5,
  },
  {
    id: "testimonial-2",
    quote:
      "We use Sycom to onboard every new security hire. It gets them up to speed faster than any other platform we've tried, and the progress tracking gives me full visibility into their growth.",
    name: "Elena Vasquez",
    role: "CISO",
    company: "Meridian Health",
    avatarUrl: "/images/testimonials/elena.jpg",
    rating: 5,
  },
  {
    id: "testimonial-3",
    quote:
      "I went from help desk to pentesting in under a year thanks to Sycom. The structured learning path and lab environments gave me the practical skills employers actually look for.",
    name: "Marcus Johnson",
    role: "Penetration Tester",
    company: "RedLine Security",
    avatarUrl: "/images/testimonials/marcus.jpg",
    rating: 5,
  },
  {
    id: "testimonial-4",
    quote:
      "The CISSP prep course is exceptional. Dr. Mitchell's teaching style breaks down complex security concepts into digestible lessons. I passed with confidence.",
    name: "Priya Sharma",
    role: "Security Manager",
    company: "NovaTech Solutions",
    avatarUrl: "/images/testimonials/priya.jpg",
    rating: 5,
  },
  {
    id: "testimonial-5",
    quote:
      "What sets Sycom apart is the quality of the lab environments. They simulate real enterprise networks, not toy examples. That hands-on experience was invaluable in interviews.",
    name: "David Kim",
    role: "SOC Analyst",
    company: "CyberFirst Ltd",
    avatarUrl: "/images/testimonials/david.jpg",
    rating: 5,
  },
  {
    id: "testimonial-6",
    quote:
      "Our team's incident response time improved by 40% after completing the IR course. The realistic scenarios prepared us for situations we've now actually faced in production.",
    name: "Rachel Thompson",
    role: "IR Team Lead",
    company: "Fortress Security Group",
    avatarUrl: "/images/testimonials/rachel.jpg",
    rating: 5,
  },
];
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
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <Star
                        className="size-3 fill-amber-400 text-amber-400"
                        key={`star-${testimonial.id}-${s}`}
                      />
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
