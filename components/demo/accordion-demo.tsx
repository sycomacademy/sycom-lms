"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionDemo() {
  return (
    <BlockWrapper title="Accordion">
      <Accordion className="w-full" defaultValue={["item-1"]}>
        <AccordionItem value="item-1">
          <AccordionTrigger>First section</AccordionTrigger>
          <AccordionContent>
            Content for the first accordion panel.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Second section</AccordionTrigger>
          <AccordionContent>
            Content for the second accordion panel.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Third section</AccordionTrigger>
          <AccordionContent>
            Content for the third accordion panel.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </BlockWrapper>
  );
}
