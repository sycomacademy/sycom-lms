import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedTextHero } from "@/components/landing/animated-text-hero";
import { FeatureCards } from "@/components/landing/feature-cards";
import { TestimonialCards } from "@/components/landing/testimonial-cards";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { getAllFaqs } from "@/packages/db/queries/faq";
import { getAllFeatures } from "@/packages/db/queries/feature";
import { getCaller } from "@/packages/trpc/server";

export default async function HomePage() {
  const [coursesResult, features, faqs] = await Promise.all([
    (await getCaller()).course.listPublic({ limit: 3, offset: 0 }),
    getAllFeatures(),
    getAllFaqs(),
  ]);

  const featuredCourses = coursesResult.courses;

  return (
    <>
      <Header />
      <main>
        <AnimatedTextHero />

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="Why Choose Us" />
            <h2 className="mb-12 text-center font-bold text-3xl text-foreground md:text-4xl">
              Platform Features
            </h2>
            <FeatureCards features={features} />
          </div>
        </section>

        <section className="bg-muted py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="Our Courses" />
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
                Featured Courses
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Explore our most popular cybersecurity courses designed to
                advance your career and prepare you for industry certifications.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((c) => (
                <Card key={c.id}>
                  <div className="relative aspect-video bg-secondary">
                    {c.imageUrl ? (
                      <Image
                        alt={c.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={c.imageUrl}
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      {c.categories.length > 0 ? (
                        <span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                          {c.categories[0]?.name}
                        </span>
                      ) : null}
                      {c.estimatedDuration ? (
                        <span className="text-muted-foreground text-sm">
                          {Math.round(c.estimatedDuration / 60)}h
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground text-lg">
                      {c.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                      {c.description ?? "No description."}
                    </p>
                    <div className="flex items-center justify-between">
                      <Button
                        nativeButton={false}
                        render={
                          <Link href={`/courses/${c.id}`}>View Course</Link>
                        }
                        variant="outline"
                      >
                        View Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button
                nativeButton={false}
                render={<Link href="/courses">View All Courses</Link>}
                size="lg"
              >
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

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

        <section className="bg-primary py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-bold text-3xl text-primary-foreground md:text-4xl">
                Ready to Start Your Cybersecurity Journey?
              </h2>
              <p className="mb-8 text-lg text-primary-foreground/90">
                Join thousands of professionals advancing their careers with our
                comprehensive training programs and industry-recognized
                certifications.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  nativeButton={false}
                  render={<Link href="/courses">Explore Courses</Link>}
                  size="lg"
                  variant="secondary"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  nativeButton={false}
                  render={<Link href="/sign-in">Sign Up Now</Link>}
                  size="lg"
                  variant="secondary"
                >
                  Sign Up Now
                </Button>
              </div>
            </div>
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
            <div className="mx-auto max-w-3xl">
              <Accordion className="w-full">
                {faqs.map((faqItem) => (
                  <AccordionItem key={faqItem.id} value={faqItem.id}>
                    <AccordionTrigger className="text-left">
                      {faqItem.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground text-sm">
                        {faqItem.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
