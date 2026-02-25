import { AnimatedTextHero } from "@/components/landing/animated-text-hero";
import { TestimonialCards } from "@/components/landing/testimonial-cards";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SectionLabel } from "@/components/ui/section-label";

export default async function HomePage() {
  return (
    <>
      <Header />
      <main>
        <AnimatedTextHero />

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="Testimonials" />
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
                What Our Students Say
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Hear from professionals who have transformed their careers with
                our cybersecurity training programs.
              </p>
            </div>
            <TestimonialCards />
          </div>
        </section>

        <section className="bg-muted py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="FAQ" />
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Find answers to common questions about our courses,
                certifications, and learning platform.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
