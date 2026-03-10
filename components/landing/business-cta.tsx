"use client";

import { ArrowRight, Mail, Phone } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function BusinessCta() {
  return (
    <section className="relative overflow-hidden bg-primary py-24">
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to strengthen your security posture?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-primary-foreground/80 leading-relaxed">
            Contact our enterprise team for a personalized demo and pricing
            consultation. We'll help you build a training program that fits your
            organization.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              nativeButton={false}
              render={
                // biome-ignore lint/a11y/useAnchorContent: Base UI render prop injects children
                <a href="mailto:info@sycom.academy" />
              }
              size="lg"
              variant="secondary"
            >
              <Mail className="mr-2 size-4" />
              Contact Us
              <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
            </Button>
            <Button
              nativeButton={false}
              render={
                // biome-ignore lint/a11y/useAnchorContent: Base UI render prop injects children
                <a href="tel:+441133280244" />
              }
              size="lg"
              variant="secondary"
            >
              <Phone className="mr-2 size-4" />
              Schedule a Call
            </Button>
          </div>

          <p className="mt-8 text-primary-foreground/60 text-sm">
            No commitment required. Get a free consultation and custom quote.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
