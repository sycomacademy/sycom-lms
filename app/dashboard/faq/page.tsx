import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { getAllFaqs } from "@/packages/db/queries/faq";

export default async function DashboardFaqPage() {
  const faqs = await getAllFaqs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Find answers to common questions about the platform
        </p>
      </div>

      {faqs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No FAQs available yet. Check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
