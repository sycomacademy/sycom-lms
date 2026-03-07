"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/packages/utils/cn";
import { mockFaqs } from "@/packages/utils/mock-data";

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border border-white/5 bg-[oklch(0.08_0.005_285.823)]"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <button
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02]"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="font-medium text-sm text-white">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/30 transition-transform duration-200",
            open && "rotate-180 text-brand"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="border-white/5 border-t px-5 pt-4 pb-5 text-sm text-white/40 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Faq() {
  return (
    <section className="relative bg-[oklch(0.1_0.005_285.823)] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-3 font-bold text-3xl text-white sm:text-4xl">
            Common <span className="text-brand">questions</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {mockFaqs.map((faq, i) => (
            <FaqItem
              answer={faq.answer}
              index={i}
              key={faq.id}
              question={faq.question}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
