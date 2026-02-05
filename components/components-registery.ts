import type { ComponentType } from "react";
// import { AccordionDemo } from "@/components/demo/accordion-demo";
// import { AlertsDemo } from "@/components/demo/alerts-demo";
// import { BadgesDemo } from "@/components/demo/badges-demo";
import { ButtonsDemo } from "@/components/demo/buttons-demo";
import { CourseCardsDemo } from "@/components/demo/course-cards-demo";
import { HeroDemo } from "@/components/demo/hero-demo";
import { LabInterfaceDemo } from "@/components/demo/lab-interface-demo";
import { LabSplitScreenDemo } from "@/components/demo/lab-split-screen-demo";
import { LessonPageDemo } from "@/components/demo/lesson-page-demo";
import { LoginPageDemo } from "@/components/demo/login-page-demo";
import { LoginPopupDemo } from "@/components/demo/login-popup-demo";
import { ProfileStatsDemo } from "@/components/demo/profile-stats-demo";
import { ProgressDemo } from "@/components/demo/progress-demo";
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";
// import { CardDemo } from "@/components/demo/card-demo";
// import { BlockExample } from "@/components/demo/form-block";
// import { FormDemo } from "@/components/demo/form-demo";
// import { MiscDemo } from "@/components/demo/misc-demo";
// import { TabsDemo } from "@/components/demo/tabs-demo";

export interface ComponentConfig {
  name: string;
  component: ComponentType;
  className?: string;
  type: "registry:ui" | "registry:page" | "registry:block";
  href: string;
  label?: string;
}

export const componentRegistry: Record<string, ComponentConfig> = {
  // UI Components
  buttons: {
    name: "Buttons",
    component: ButtonsDemo,
    type: "registry:ui",
    href: "/style-guide/buttons",
  },
  progress: {
    name: "Progress",
    component: ProgressDemo,
    type: "registry:ui",
    href: "/style-guide/progress",
  },
  // Block Components
  hero: {
    name: "Hero",
    component: HeroDemo,
    type: "registry:block",
    href: "/style-guide/hero",
  },
  "course-cards": {
    name: "Course Cards",
    component: CourseCardsDemo,
    type: "registry:block",
    href: "/style-guide/course-cards",
  },
  "profile-stats": {
    name: "Profile Stats",
    component: ProfileStatsDemo,
    type: "registry:block",
    href: "/style-guide/profile-stats",
  },
  "login-popup": {
    name: "Login Popup",
    component: LoginPopupDemo,
    type: "registry:block",
    href: "/style-guide/login-popup",
  },
  "lab-interface": {
    name: "Lab Interface",
    component: LabInterfaceDemo,
    type: "registry:block",
    href: "/style-guide/lab-interface",
  },
  "lab-split-screen": {
    name: "Lab Split Screen",
    component: LabSplitScreenDemo,
    type: "registry:block",
    href: "/style-guide/lab-split-screen",
  },
  footer: {
    name: "Footer",
    component: Footer,
    type: "registry:block",
    href: "/style-guide/footer",
  },
  header: {
    name: "Header",
    component: Header,
    type: "registry:block",
    href: "/style-guide/header",
  },
  // Page Components
  "login-page": {
    name: "Login Page",
    component: LoginPageDemo,
    type: "registry:page",
    href: "/style-guide/login-page",
  },
  "lesson-page": {
    name: "Lesson Page",
    component: LessonPageDemo,
    type: "registry:page",
    href: "/style-guide/lesson-page",
  },
};
