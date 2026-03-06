import { BlogSection } from "@/components/landing/blog-section";
import { CoursesSection } from "@/components/landing/courses-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { StatsSection } from "@/components/landing/stats-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { TrustedBySection } from "@/components/landing/trusted-by-section";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default async function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <CoursesSection />
        <StatsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <BlogSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
