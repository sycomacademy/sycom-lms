import type { JSONContent } from "@tiptap/react";
import { BookOpenIcon, ChevronLeftIcon, ClockIcon } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CourseActions } from "@/components/course/course-actions";
import { CourseSummary } from "@/components/course/course-summary";
import { Link } from "@/components/layout/foresight-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getQueryClient, trpc } from "@/packages/trpc/server";

interface LibraryCoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LibraryCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const course = await queryClient.fetchQuery(
    trpc.course.getPublicBySlugOrId.queryOptions({ slugOrId: slug })
  );

  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `${course.title} | Library | Sycom LMS`,
    description: course.description ?? "Learn cybersecurity with Sycom LMS.",
  };
}

async function LibraryCourseDetail({ slug }: { slug: string }) {
  const queryClient = getQueryClient();
  const course = await queryClient.fetchQuery(
    trpc.course.getPublicBySlugOrId.queryOptions({ slugOrId: slug })
  );

  if (!course) {
    notFound();
  }

  const totalLessons = course.sections.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );
  const courseSummary = (course as { summary?: JSONContent | unknown[] | null })
    .summary;

  return (
    <div className="space-y-6">
      <Button
        className="w-fit px-1"
        nativeButton={false}
        render={<Link href={"/dashboard/library" as Route} />}
        variant="link"
      >
        <ChevronLeftIcon className="size-4" />
        Back to library
      </Button>

      <section className="overflow-hidden">
        <div className="grid gap-6 p-1 xl:grid-cols-3">
          <div className="grid gap-6 md:grid-cols-3 md:items-start xl:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-muted md:col-span-1">
              <AspectRatio ratio={8 / 8}>
                <Image
                  alt={course.title}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 220px"
                  src={course.imageUrl ?? "/images/landscape.png"}
                />
              </AspectRatio>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2">
                <Badge className="capitalize">{course.difficulty}</Badge>
              </div>
              <div className="space-y-3">
                <h1 className="font-bold text-3xl md:text-4xl">
                  {course.title}
                </h1>
                <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
                  {course.description ?? "No description."}
                </p>
              </div>
            </div>
          </div>

          <Card className="h-fit w-full text-foreground xl:col-span-1">
            <CardHeader>
              <CardTitle>Ready to start?</CardTitle>
              <CardDescription>
                Review the details, then jump into the course when you are
                ready.
              </CardDescription>
            </CardHeader>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Course summary</CardTitle>
          <CardDescription>
            A more detailed breakdown of the topics and outcomes.
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
            {course.sections.length} sections • {totalLessons} lessons
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
  );
}

function LibraryCourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <section className="overflow-hidden rounded-xl border bg-card p-6 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="grid gap-6 md:grid-cols-3 xl:col-span-2">
            <AspectRatio ratio={4 / 5}>
              <Skeleton className="h-full w-full rounded-xl md:col-span-1" />
            </AspectRatio>
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full max-w-xl" />
              <Skeleton className="h-6 w-2/3 max-w-xl" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg xl:col-span-1" />
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-56 w-full rounded-lg lg:col-span-1" />
        <Skeleton className="h-56 w-full rounded-lg lg:col-span-2" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardLibraryCoursePage({
  params,
}: LibraryCoursePageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LibraryCourseDetailSkeleton />}>
      <LibraryCourseDetail slug={slug} />
    </Suspense>
  );
}
