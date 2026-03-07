import { BlogPreview } from "@/components/landing/blog-preview";
import { CoursesPreview } from "@/components/landing/courses-preview";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Partners } from "@/components/landing/partners";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <Partners />
      <Stats />
      <Features />
      <HowItWorks />
      <CoursesPreview />
      <Testimonials />
      <BlogPreview />
      <Faq />
      <Cta />
      <Footer />
    </div>
  );
}
