"use client";

import { ArrowRight, Shield } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="relative overflow-hidden bg-[oklch(0.08_0.005_285.823)] py-24">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.623 0.214 259.815 / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.623 0.214 259.815 / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 60% at 50% 50%, oklch(0.623 0.214 259.815 / 0.1), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto mb-6 flex size-14 items-center justify-center border border-brand/20 bg-brand/10">
            <Shield className="size-7 text-brand" />
          </div>

          <h2 className="mb-4 font-bold text-3xl text-white sm:text-4xl lg:text-5xl">
            Ready to defend the future?
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-lg text-white/40 leading-relaxed">
            Join thousands of security professionals building their careers with
            Sycom Academy. Start with a free account today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              className="bg-brand text-white hover:bg-brand/80"
              nativeButton={false}
              render={<Link href="/sign-up" />}
              size="lg"
            >
              Create Free Account
              <ArrowRight className="ml-1 size-4" data-icon="inline-end" />
            </Button>
            <Button
              className="border-white/10 text-white hover:border-white/20 hover:bg-white/5"
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

          <p className="mt-6 text-white/20 text-xs">
            No credit card required. Free access to introductory modules.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
