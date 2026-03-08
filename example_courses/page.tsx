import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { getCaller } from "@/packages/trpc/server";

export default async function CoursesPage() {
  const { courses } = await (await getCaller()).course.listPublic({
    limit: 50,
    offset: 0,
  });

  return (
    <>
      <Header />
      <main>
        <section className="relative bg-muted py-16 lg:py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-muted" />
          <div className="absolute inset-0 z-0 bg-foreground/70" />
          <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
            <SectionLabel label="Courses" />
            <h1 className="mb-4 font-bold text-4xl text-background md:text-5xl">
              Browse Courses
            </h1>
            <p className="max-w-2xl text-background/85 text-lg">
              Explore our comprehensive cybersecurity courses designed to
              advance your career and prepare you for industry-recognized
              certifications.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            {courses.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  No published courses yet. Check back soon.
                </p>
                <Button
                  className="mt-4"
                  nativeButton={false}
                  render={<Link href="/">Back to Home</Link>}
                  variant="outline"
                >
                  Back to Home
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <Card className="flex flex-col overflow-hidden" key={c.id}>
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
                    <CardContent className="flex-1 p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {c.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.name}
                          </Badge>
                        ))}
                        <Badge className="capitalize" variant="secondary">
                          {c.difficulty}
                        </Badge>
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground text-lg">
                        {c.title}
                      </h3>
                      <p className="line-clamp-3 text-muted-foreground text-sm">
                        {c.description ?? "No description."}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
                        {c.estimatedDuration ? (
                          <span>{Math.round(c.estimatedDuration / 60)}h</span>
                        ) : null}
                        <span>{c.enrollmentCount} enrolled</span>
                        <span>{c.lessonCount} lessons</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        nativeButton={false}
                        render={
                          <Link href={`/courses/${c.id}`}>
                            View Course
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        }
                        variant="default"
                      >
                        View Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
