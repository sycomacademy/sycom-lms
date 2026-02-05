import { ArrowRight, Award, FlaskConical, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatedTextHeroDemo } from "@/components/demo/animated-text-hero-demo";
import { TestimonialCardDemo } from "@/components/demo/testimonial-card-demo";
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
import { courses, faqs, features } from "@/mock-db";

// Get featured courses (first 3)
const featuredCourses = courses.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <AnimatedTextHeroDemo />

        {/* Features Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="Why Choose Us" />
            <h2 className="mb-12 text-center font-bold text-3xl text-foreground md:text-4xl">
              Platform Features
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                let Icon = Award;
                if (feature.icon === "FlaskConical") {
                  Icon = FlaskConical;
                } else if (feature.icon === "Users") {
                  Icon = Users;
                }
                return (
                  <Card
                    className="text-center transition-all hover:border-primary/50"
                    key={feature.id}
                  >
                    <CardContent className="p-6">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
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
              {featuredCourses.map((course) => (
                <Card key={course.id}>
                  <div className="relative aspect-video bg-secondary">
                    {course.thumbnailUrl ? (
                      <Image
                        alt={course.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={course.thumbnailUrl}
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-md bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                        {course.category}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {Math.round(course.duration / 60)}h
                      </span>
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground text-lg">
                      {course.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                      {course.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-lg">
                        £{(course.price / 100).toFixed(2)}
                      </span>
                      <Button
                        nativeButton={false}
                        render={
                          <Link href={`/courses/${course.slug}`}>
                            View Course
                          </Link>
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

        {/* Testimonials Section */}
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
            <TestimonialCardDemo />
          </div>
        </section>

        {/* CTA Section */}
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
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  nativeButton={false}
                  render={<Link href="/sign-in">Sign Up Now</Link>}
                  size="lg"
                  variant="outline"
                >
                  Sign Up Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground text-sm">
                        {faq.answer}
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
