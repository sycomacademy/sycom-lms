"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-4 font-bold text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Ready to defend the future?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground leading-relaxed">
            Join thousands of security professionals building their careers with
            Sycom Academy. Start with a free account today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/sign-up" />}
              size="lg"
            >
              Create Free Account
              <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
            </Button>
            <Button
              nativeButton={false}
              render={
                // biome-ignore lint/a11y/useAnchorContent: Base UI render prop injects children
                <a
                  aria-label="Talk to Sales"
                  href="https://sycom.academy/contact"
                />
              }
              size="lg"
              variant="outline"
            >
              Talk to Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
