import type { ComponentType } from "react";
import { AccordionDemo } from "@/components/demo/accordion-demo";
import { AffiliationsDemo } from "@/components/demo/affiliations-demo";
import { AnimatedTextHeroDemo } from "@/components/demo/animated-text-hero-demo";
import { AuthFormsDemo } from "@/components/demo/auth-forms-demo";
import { BadgesDemo } from "@/components/demo/badges-demo";
import { BlogCardDemo } from "@/components/demo/blog-card-demo";
import { ButtonsDemo } from "@/components/demo/buttons-demo";
import { CertificationCardDemo } from "@/components/demo/certification-card-demo";
import { ContactFormDemo } from "@/components/demo/contact-form-demo";
import { CourseCardsDemo } from "@/components/demo/course-cards-demo";
import { CourseDescriptionDemo } from "@/components/demo/course-description-demo";
import { CourseInfoDemo } from "@/components/demo/course-info-demo";
import { FeatureCardDemo } from "@/components/demo/feature-card-demo";
import { FormDemo } from "@/components/demo/form-demo";
import { HeroDemo } from "@/components/demo/hero-demo";
import { LabInterfaceDemo } from "@/components/demo/lab-interface-demo";
import { LabSplitScreenDemo } from "@/components/demo/lab-split-screen-demo";
import { LessonPageDemo } from "@/components/demo/lesson-page-demo";
import { LoginPageDemo } from "@/components/demo/login-page-demo";
import { LoginPopupDemo } from "@/components/demo/login-popup-demo";
import { NewsletterDemo } from "@/components/demo/newsletter-demo";
import { NumberedServicesDemo } from "@/components/demo/numbered-services-demo";
import { PartnerLogosDemo } from "@/components/demo/partner-logos-demo";
import { ProfileStatsDemo } from "@/components/demo/profile-stats-demo";
import { ProgressDemo } from "@/components/demo/progress-demo";
import { QuizDemo } from "@/components/demo/quiz-demo";
import { SectionLabelDemo } from "@/components/demo/section-label-demo";
import { ServiceCardDemo } from "@/components/demo/service-card-demo";
import { SimpleHeroDemo } from "@/components/demo/simple-hero-demo";
import { SlidePanelDemo } from "@/components/demo/slide-panel-demo";
import { SocialLinksDemo } from "@/components/demo/social-links-demo";
import { SolutionsListDemo } from "@/components/demo/solutions-list-demo";
import { SonnerDemo } from "@/components/demo/sonner-demo";
import { StatsBarDemo } from "@/components/demo/stats-bar-demo";
import { StatsCardDemo } from "@/components/demo/stats-card-demo";
import { TeamCTADemo } from "@/components/demo/team-cta-demo";
import { TestimonialCardDemo } from "@/components/demo/testimonial-card-demo";
import { ValuesGridDemo } from "@/components/demo/values-grid-demo";
import { CourseFormDemo } from "./demo/course-form-demo";
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";

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
  accordion: {
    name: "Accordion",
    component: AccordionDemo,
    type: "registry:ui",
    href: "/style-guide/accordion",
  },
  buttons: {
    name: "Buttons",
    component: ButtonsDemo,
    type: "registry:ui",
    href: "/style-guide/buttons",
  },
  badges: {
    name: "Badges",
    component: BadgesDemo,
    type: "registry:ui",
    href: "/style-guide/badges",
  },
  forms: {
    name: "Forms",
    component: FormDemo,
    type: "registry:ui",
    href: "/style-guide/forms",
  },
  "course-form": {
    name: "Course Form",
    component: CourseFormDemo,
    type: "registry:ui",
    href: "/style-guide/course-form",
  },
  progress: {
    name: "Progress",
    component: ProgressDemo,
    type: "registry:ui",
    href: "/style-guide/progress",
  },
  "section-label": {
    name: "Section Label",
    component: SectionLabelDemo,
    type: "registry:ui",
    href: "/style-guide/section-label",
  },
  "slide-panel": {
    name: "Slide Panel",
    component: SlidePanelDemo,
    type: "registry:ui",
    href: "/style-guide/slide-panel",
  },
  "social-links": {
    name: "Social Links",
    component: SocialLinksDemo,
    type: "registry:ui",
    href: "/style-guide/social-links",
  },
  "auth-forms": {
    name: "Auth Forms",
    component: AuthFormsDemo,
    type: "registry:ui",
    href: "/style-guide/auth-forms",
  },
  "contact-form": {
    name: "Contact Form",
    component: ContactFormDemo,
    type: "registry:ui",
    href: "/style-guide/contact-form",
  },
  sonner: {
    name: "Sonner",
    component: SonnerDemo,
    type: "registry:ui",
    href: "/style-guide/sonner",
  },
  // Block Components
  hero: {
    name: "Hero",
    component: HeroDemo,
    type: "registry:block",
    href: "/style-guide/hero",
  },
  "animated-text-hero": {
    name: "Animated Text Hero",
    component: AnimatedTextHeroDemo,
    type: "registry:block",
    href: "/style-guide/animated-text-hero",
  },
  "simple-hero": {
    name: "Simple Hero",
    component: SimpleHeroDemo,
    type: "registry:block",
    href: "/style-guide/simple-hero",
  },
  "blog-card": {
    name: "Blog Card",
    component: BlogCardDemo,
    type: "registry:block",
    href: "/style-guide/blog-card",
  },
  "certification-card": {
    name: "Certification Card",
    component: CertificationCardDemo,
    type: "registry:block",
    href: "/style-guide/certification-card",
  },
  "feature-card": {
    name: "Feature Card",
    component: FeatureCardDemo,
    type: "registry:block",
    href: "/style-guide/feature-card",
  },
  "service-card": {
    name: "Service Card",
    component: ServiceCardDemo,
    type: "registry:block",
    href: "/style-guide/service-card",
  },
  "stats-card": {
    name: "Stats Card",
    component: StatsCardDemo,
    type: "registry:block",
    href: "/style-guide/stats-card",
  },
  "testimonial-card": {
    name: "Testimonial Card",
    component: TestimonialCardDemo,
    type: "registry:block",
    href: "/style-guide/testimonial-card",
  },
  affiliations: {
    name: "Affiliations",
    component: AffiliationsDemo,
    type: "registry:block",
    href: "/style-guide/affiliations",
  },
  "course-info": {
    name: "Course Info",
    component: CourseInfoDemo,
    type: "registry:block",
    href: "/style-guide/course-info",
  },
  newsletter: {
    name: "Newsletter",
    component: NewsletterDemo,
    type: "registry:block",
    href: "/style-guide/newsletter",
  },
  "numbered-services": {
    name: "Numbered Services",
    component: NumberedServicesDemo,
    type: "registry:block",
    href: "/style-guide/numbered-services",
  },
  "partner-logos": {
    name: "Partner Logos",
    component: PartnerLogosDemo,
    type: "registry:block",
    href: "/style-guide/partner-logos",
  },
  "solutions-list": {
    name: "Solutions List",
    component: SolutionsListDemo,
    type: "registry:block",
    href: "/style-guide/solutions-list",
  },
  "stats-bar": {
    name: "Stats Bar",
    component: StatsBarDemo,
    type: "registry:block",
    href: "/style-guide/stats-bar",
  },
  "team-cta": {
    name: "Team CTA",
    component: TeamCTADemo,
    type: "registry:block",
    href: "/style-guide/team-cta",
  },
  "values-grid": {
    name: "Values Grid",
    component: ValuesGridDemo,
    type: "registry:block",
    href: "/style-guide/values-grid",
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
  quiz: {
    name: "Quiz",
    component: QuizDemo,
    type: "registry:block",
    href: "/style-guide/quiz",
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
  "course-description": {
    name: "Course Description",
    component: CourseDescriptionDemo,
    type: "registry:page",
    href: "/style-guide/course-description",
  },
};
