import type { ComponentType } from "react";
import { AccordionDemo } from "@/components/demo/accordion-demo";
import { AlertsDemo } from "@/components/demo/alerts-demo";
import { BadgesDemo } from "@/components/demo/badges-demo";
import { ButtonsDemo } from "@/components/demo/buttons-demo";
import { CardDemo } from "@/components/demo/card-demo";
import { BlockExample } from "@/components/demo/form-block";
import { FormDemo } from "@/components/demo/form-demo";
import { MiscDemo } from "@/components/demo/misc-demo";
import { TabsDemo } from "@/components/demo/tabs-demo";

export interface ComponentConfig {
  name: string;
  component: ComponentType;
  className?: string;
  type: "registry:ui" | "registry:page" | "registry:block";
  href: string;
  label?: string;
}

export const componentRegistry: Record<string, ComponentConfig> = {
  accordion: {
    name: "Accordion",
    component: AccordionDemo,
    type: "registry:ui",
    href: "/style-guide/accordion",
  },
  alerts: {
    name: "Alerts",
    component: AlertsDemo,
    type: "registry:ui",
    href: "/style-guide/alerts",
  },
  badges: {
    name: "Badges",
    component: BadgesDemo,
    type: "registry:ui",
    href: "/style-guide/badges",
  },
  buttons: {
    name: "Buttons",
    component: ButtonsDemo,
    type: "registry:ui",
    href: "/style-guide/buttons",
  },
  card: {
    name: "Card",
    component: CardDemo,
    type: "registry:ui",
    href: "/style-guide/card",
  },
  form: {
    name: "Form",
    component: FormDemo,
    type: "registry:ui",
    href: "/style-guide/form",
  },
  "block-example": {
    name: "Block Example",
    component: BlockExample,
    type: "registry:block",
    href: "/style-guide/block-example",
  },
  misc: {
    name: "Separator, Progress, Skeleton",
    component: MiscDemo,
    type: "registry:ui",
    href: "/style-guide/misc",
    label: "Misc",
  },
  tabs: {
    name: "Tabs",
    component: TabsDemo,
    type: "registry:ui",
    href: "/style-guide/tabs",
  },
};
