import { ArrowRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryClient, trpc } from "@/packages/trpc/server";

export const metadata: Metadata = {
  title: "Courses | Sycom LMS",
  description:
    "Explore comprehensive cybersecurity courses designed to advance your career and prepare you for industry-recognized certifications.",
};

async function CourseGrid() {
  const queryClient = getQueryClient();
  const { courses } = await queryClient.fetchQuery(
    trpc.course.listPublic.queryOptions({ limit: 50, offset: 0 })
  );

  if (courses.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">
          No published courses yet. Check back soon.
        </p>
        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/" />}
          variant="outline"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
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
            <div className="mb-3">
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
                <Link href={`/courses/${c.slug ?? c.id}` as Route}>
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
  );
}

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card className="flex flex-col overflow-hidden" key={`skeleton-${i}`}>
          <Skeleton className="aspect-video w-full" />
          <CardContent className="flex-1 space-y-3 p-6">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <main>
      <section className="relative bg-muted py-16 lg:py-24">
        <div className="absolute inset-0 z-0 bg-linear-to-br from-primary/20 to-muted" />
        <div className="absolute inset-0 z-0 bg-foreground/70" />
        <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
          <SectionLabel label="Courses" />
          <h1 className="mb-4 font-bold text-4xl text-background md:text-5xl">
            Browse Courses
          </h1>
          <p className="max-w-2xl text-background/85 text-lg">
            Explore our comprehensive cybersecurity courses designed to advance
            your career and prepare you for industry-recognized certifications.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Suspense fallback={<CourseGridSkeleton />}>
            <CourseGrid />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
