import type { JSONContent } from "@tiptap/react";
import { BookOpenIcon, ClockIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CourseActions } from "@/components/course/course-actions";
import { CourseSummary } from "@/components/course/course-summary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryClient, trpc } from "@/packages/trpc/server";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const course = await queryClient.fetchQuery(
    trpc.course.getPublicBySlugOrId.queryOptions({ slugOrId: slug })
  );

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `${course.title} | Sycom LMS`,
    description: course.description ?? "Learn cybersecurity with Sycom LMS.",
  };
}

async function CourseDetail({ slug }: { slug: string }) {
  const queryClient = getQueryClient();
  const course = await queryClient.fetchQuery(
    trpc.course.getPublicBySlugOrId.queryOptions({ slugOrId: slug })
  );

  if (!course) {
    notFound();
  }

  const totalLessons = course.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0
  );
  const courseSummary = (course as { summary?: JSONContent | unknown[] | null })
    .summary;

  return (
    <>
      <section className="relative bg-muted py-16 lg:py-24">
        <div className="absolute inset-0 z-0">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={course.imageUrl ?? "/images/landscape.png"}
          />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
          <SectionLabel label="Courses" />
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4 text-background">
              <div className="flex items-center gap-2">
                <Badge className="border-background/50 bg-background/20 text-background capitalize">
                  {course.difficulty}
                </Badge>
              </div>
              <h1 className="font-bold text-4xl md:text-5xl">{course.title}</h1>
              <p className="max-w-3xl text-background/85 text-lg">
                {course.description ?? "No description."}
              </p>
            </div>
            <Card className="w-full shrink-0 text-foreground lg:w-80">
              <CardContent className="space-y-4">
                <Suspense
                  fallback={<Skeleton className="h-10 w-full rounded-md" />}
                >
                  <CourseActions courseId={course.id} />
                </Suspense>
                <Separator />
                <div className="space-y-3 text-sm">
                  {course.estimatedDuration ? (
                    <div className="flex items-center gap-2">
                      <ClockIcon className="size-4" />
                      <span>Duration:</span>
                      <span className="font-medium">
                        {Math.round(course.estimatedDuration / 60)} hours
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" />
                    <span>Lessons:</span>
                    <span className="font-medium">{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="size-4" />
                    <span>Students:</span>
                    <span className="font-medium">
                      {course.enrollmentCount.toLocaleString()} enrolled
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Course summary</CardTitle>
              <CardDescription>
                A more detailed overview of the learning experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseSummary content={courseSummary} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                {course.sections.length} sections &bull; {totalLessons} lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {course.sections.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Curriculum coming soon.
                </p>
              ) : (
                <Accordion className="w-full">
                  {course.sections.map((section, index) => (
                    <AccordionItem key={section.id} value={`section-${index}`}>
                      <AccordionTrigger className="px-4 py-3">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-xs">
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <h3 className="font-medium text-sm">
                                {section.title}
                              </h3>
                              <div className="mt-1 flex items-center gap-4 text-xs">
                                <span>{section.lessons.length} lessons</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 px-4 pb-2">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              className="flex items-center justify-between rounded-md border p-3"
                              key={lesson.id}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded border text-xs">
                                  {lessonIndex + 1}
                                </div>
                                <div>
                                  <span className="font-medium text-sm">
                                    {lesson.title}
                                  </span>
                                  {lesson.estimatedDuration ? (
                                    <div>
                                      <span className="text-xs">
                                        {lesson.estimatedDuration} min
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function CourseDetailSkeleton() {
  return (
    <>
      <section className="relative bg-muted py-16 lg:py-24">
        <div className="absolute inset-0 z-0 bg-foreground/70" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full max-w-xl" />
              <Skeleton className="h-6 w-2/3 max-w-xl" />
            </div>
            <div className="w-full shrink-0 lg:w-80">
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-56 w-full rounded-lg lg:col-span-1" />
            <Skeleton className="h-56 w-full rounded-lg lg:col-span-2" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </section>
    </>
  );
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;

  return (
    <main>
      <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetail slug={slug} />
      </Suspense>
    </main>
  );
}
