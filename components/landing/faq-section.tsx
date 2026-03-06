"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { mockFaqs } from "@/lib/mock-data";
import { cn } from "@/packages/utils/cn";

export function FaqSection() {
  return (
    <section className="bg-muted/30 py-20 lg:py-28" id="faq">
      <div className="container mx-auto px-4">
        <SectionLabel label="FAQ" />
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to know about getting started with Sycom.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion.Root>
            {mockFaqs.map((faq) => (
              <Accordion.Item
                className="border-border border-b"
                key={faq.id}
                value={faq.id}
              >
                <Accordion.Trigger
                  className={cn(
                    "flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-foreground text-sm transition-colors hover:text-primary",
                    "[&[data-panel-open]>svg]:rotate-180"
                  )}
                >
                  {faq.question}
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
                </Accordion.Trigger>
                <Accordion.Panel className="overflow-hidden text-muted-foreground text-sm leading-relaxed data-[ending-style]:animate-accordion-up data-[starting-style]:animate-accordion-down">
                  <div className="pb-5">{faq.answer}</div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </div>
    </section>
  );
}
