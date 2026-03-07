import { BlogPreview } from "@/components/landing/blog-preview";
import { CoursesPreview } from "@/components/landing/courses-preview";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";
import { Partners } from "@/components/landing/partners";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";

export default function HomePage() {
  return (
    <div className="dark">
      <Navbar />
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
