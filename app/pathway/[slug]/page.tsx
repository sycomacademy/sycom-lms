import { ArrowRight, Award, CheckIcon, ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Separator } from "@/components/ui/separator";
import {
  getAllPathwaySlugs,
  getCoursesForPathway,
  getPathwayBySlug,
} from "@/packages/db/queries/pathway";

interface PathwayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPathwaySlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export default async function PathwayDetailPage({ params }: PathwayPageProps) {
  const { slug } = await params;
  const pathway = await getPathwayBySlug(slug);

  if (!pathway) {
    notFound();
  }

  const pathwayCourses = await getCoursesForPathway(pathway.id);
  const totalDuration = pathwayCourses.reduce(
    (acc, course) => acc + course.duration,
    0
  );
  const totalPrice = pathwayCourses.reduce(
    (acc, course) => acc + course.price,
    0
  );

  return (
    <>
      <Header />
      <main>
        {/* Pathway Hero */}
        <section className="relative bg-muted py-16 lg:py-24">
          <div className="absolute inset-0 z-0">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src="/images/landscape.png"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </div>
          <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
            <SectionLabel label="Pathway" />
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4 text-background">
                <div className="flex items-center gap-2">
                  <Badge
                    className="border-background/50 text-background"
                    variant="outline"
                  >
                    {pathway.level}
                  </Badge>
                  {(pathway.certifications as string[])?.map((cert) => (
                    <Badge
                      className="gap-1 border-background/50 bg-background/20 text-background"
                      key={cert}
                    >
                      <Award className="size-3" />
                      {cert}
                    </Badge>
                  ))}
                </div>
                <h1 className="font-bold text-4xl md:text-5xl">
                  {pathway.title}
                </h1>
                <p className="max-w-3xl text-background/85 text-lg">
                  {pathway.description}
                </p>
              </div>
              <Card className="w-full shrink-0 lg:w-80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-2xl">
                      {pathway.price
                        ? `£${(pathway.price / 100).toFixed(2)}`
                        : `£${(totalPrice / 100).toFixed(2)}`}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    Enroll in Pathway
                  </Button>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4" />
                      <span>Estimated Duration:</span>
                      <span className="font-medium">
                        {Math.round(totalDuration / 60)} hours
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Courses:</span>
                      <span className="font-medium">
                        {pathwayCourses.length} courses
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="size-4" />
                      <span>Certifications:</span>
                      <span className="font-medium">
                        {(pathway.certifications as string[])?.length ?? 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pathway Overview */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What You'll Achieve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    {(pathway.whatYoullAchieve as string[])?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Who This Pathway Is For</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    {(pathway.whoIsThisFor as string[])?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {(pathway.prerequisites as string[])?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                      {(pathway.prerequisites as string[])?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Pathway Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                    {(pathway.highlights as string[])?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Courses in Pathway */}
        <section className="bg-muted py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <SectionLabel label="Courses" />
            <h2 className="mb-8 font-bold text-3xl text-foreground md:text-4xl">
              Courses in This Pathway
            </h2>
            <div className="space-y-6">
              {pathwayCourses.map((course, index) => {
                return (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="outline">{course.category}</Badge>
                              <span className="text-muted-foreground text-sm">
                                Course {index + 1} of {pathwayCourses.length}
                              </span>
                            </div>
                            <h3 className="mb-2 font-semibold text-foreground text-lg">
                              {course.title}
                            </h3>
                            <p className="mb-3 text-muted-foreground text-sm">
                              {course.shortDescription}
                            </p>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="size-4" />
                                <span>{Math.round(course.duration / 60)}h</span>
                              </div>
                              <span>£{(course.price / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 lg:shrink-0">
                          <Badge className="gap-1" variant="outline">
                            <CheckIcon className="size-3" />
                            Included
                          </Badge>
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
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Enrollment CTA */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <Card className="bg-primary">
              <CardContent className="p-12 text-center">
                <h2 className="mb-4 font-bold text-3xl text-primary-foreground md:text-4xl">
                  Ready to Start This Pathway?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90">
                  Enroll in the complete pathway and get access to all courses,
                  certifications, and learning materials.
                </p>
                <Button size="lg" variant="secondary">
                  Enroll in Full Pathway
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
