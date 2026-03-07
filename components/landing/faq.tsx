import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { mockFaqs } from "@/packages/utils/mock-data";

export function Faq() {
  return (
    <section className="relative bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Common <span className="text-primary">questions</span>
          </h2>
        </div>

        <Accordion>
          {mockFaqs.map((faq) => (
            <AccordionItem key={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
