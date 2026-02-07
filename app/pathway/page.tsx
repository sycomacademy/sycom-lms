import { ArrowRight, Award, ClockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import {
  getAllPathways,
  getCoursesForPathway,
} from "@/packages/db/queries/pathway";

export default async function PathwayPage() {
  const pathways = await getAllPathways();
  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
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
            <h1 className="mb-4 font-bold text-4xl text-background md:text-5xl">
              Learning Pathways
            </h1>
            <p className="max-w-2xl text-background/85 text-lg">
              Follow structured learning journeys designed to take you from
              beginner to certified professional. Our pathways combine multiple
              courses in a logical sequence to help you achieve your career
              goals.
            </p>
          </div>
        </section>

        {/* Pathway List */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {
                await Promise.all(
                  pathways.map(async (pathway) => {
                    const pathwayCourses = await getCoursesForPathway(
                      pathway.id
                    );
                    const totalDuration = pathwayCourses.reduce(
                      (acc, c) => acc + c.duration,
                      0
                    );

                    return (
                      <Card className="flex flex-col" key={pathway.id}>
                        <CardHeader>
                          <div className="mb-3 flex items-center gap-2">
                            <Badge variant="outline">{pathway.level}</Badge>
                            {(pathway.certifications as string[])?.map(
                              (cert) => (
                                <Badge className="gap-1" key={cert}>
                                  <Award className="size-3" />
                                  {cert}
                                </Badge>
                              )
                            )}
                          </div>
                          <CardTitle>{pathway.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {pathway.shortDescription}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                          <div className="flex items-center gap-4 text-muted-foreground text-sm">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="size-4" />
                              <span>
                                {Math.round(totalDuration / 60)} hours
                              </span>
                            </div>
                            <span>{pathwayCourses.length} courses</span>
                          </div>
                          <div>
                            <p className="mb-2 font-medium text-foreground text-sm">
                              Courses in this pathway:
                            </p>
                            <ul className="space-y-1 text-muted-foreground text-sm">
                              {pathwayCourses.map((course, index) => (
                                <li key={course.id}>
                                  {index + 1}. {course.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                        <CardContent>
                          <Button
                            className="w-full"
                            nativeButton={false}
                            render={
                              <Link href={`/pathway/${pathway.slug}`}>
                                Explore Pathway
                              </Link>
                            }
                          >
                            Explore Pathway
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )
              }
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
