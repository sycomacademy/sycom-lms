"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import FadeContent from "@/components/reactbits/fade-content";
import { SectionLabel } from "@/components/ui/section-label";
import { cn } from "@/packages/utils/cn";
import { mockFaqs } from "@/packages/utils/mock-data";

export function FaqSection() {
  return (
    <section
      className="bg-primary py-20 text-primary-foreground lg:py-28"
      id="faq"
    >
      <div className="container mx-auto px-4">
        <FadeContent blur duration={800}>
          <SectionLabel className="[&_span]:text-brand" label="FAQ" />
          <div className="mb-14 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-primary-foreground/60">
              Everything you need to know about getting started with Sycom.
            </p>
          </div>
        </FadeContent>

        <FadeContent blur delay={200} duration={600}>
          <div className="mx-auto max-w-3xl">
            <Accordion.Root>
              {mockFaqs.map((faq) => (
                <Accordion.Item
                  className="border-primary-foreground/10 border-b"
                  key={faq.id}
                  value={faq.id}
                >
                  <Accordion.Trigger
                    className={cn(
                      "flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-primary-foreground text-sm transition-colors duration-200 hover:text-brand",
                      "[&[data-panel-open]>svg]:rotate-180"
                    )}
                  >
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-primary-foreground/40 transition-transform duration-200" />
                  </Accordion.Trigger>
                  <Accordion.Panel className="overflow-hidden text-primary-foreground/60 text-sm leading-relaxed data-ending-style:animate-accordion-up data-starting-style:animate-accordion-down">
                    <div className="pb-5">{faq.answer}</div>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
