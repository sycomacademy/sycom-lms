"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  Clock3Icon,
  FileTextIcon,
  GraduationCapIcon,
  PlayCircleIcon,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import type { AppRouter } from "@/app/api/trpc/router/index";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/packages/trpc/client";
import { cn } from "@/packages/utils/cn";

type JourneyListData = inferRouterOutputs<AppRouter>["enrollment"]["listMy"];
type JourneyEnrollment = JourneyListData["enrollments"][number];
type JourneySection = JourneyEnrollment["sections"][number];
type JourneyLesson = JourneySection["lessons"][number];

const difficultyLabelMap: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const statusLabelMap: Record<string, string> = {
  active: "In progress",
  completed: "Completed",
  suspended: "Paused",
  dropped: "Dropped",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function JourneyList() {
  const trpc = useTRPC();
  const queryResult = useSuspenseQuery(
    trpc.enrollment.listMy.queryOptions()
  ) as {
    data: JourneyListData;
  };
  const data = queryResult.data;

  if (data.enrollments.length === 0) {
    return <JourneyEmptyState />;
  }

  const totals = data.enrollments.reduce(
    (
      acc: {
        courses: number;
        lessons: number;
        completed: number;
        completedCourses: number;
      },
      enrollment: JourneyEnrollment
    ) => {
      acc.courses += 1;
      acc.lessons += enrollment.progress.total;
      acc.completed += enrollment.progress.completed;
      if (enrollment.status === "completed") {
        acc.completedCourses += 1;
      }
      return acc;
    },
    { courses: 0, lessons: 0, completed: 0, completedCourses: 0 }
  );

  const overallPercent =
    totals.lessons > 0
      ? Math.round((totals.completed / totals.lessons) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="bg-linear-to-br from-background via-muted/30 to-background">
          <CardHeader className="gap-3">
            <CardTitle className="text-xl">Keep your momentum up</CardTitle>
            <p className="max-w-2xl text-muted-foreground text-sm leading-6">
              Pick up where you left off, track every completed lesson, and move
              through each module with a clear view of what is next.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <JourneyStatCard
              label="Courses in motion"
              value={String(totals.courses)}
            />
            <JourneyStatCard
              label="Lessons cleared"
              value={`${totals.completed}/${totals.lessons}`}
            />
            <JourneyStatCard
              label="Overall progress"
              value={`${overallPercent}%`}
            />
          </CardContent>
        </Card>

        <Card className="bg-muted/20">
          <CardHeader className="gap-2">
            <Badge className="w-fit" variant="outline">
              Snapshot
            </Badge>
            <CardTitle>What you can finish next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between border-b pb-3 text-sm">
              <span className="text-muted-foreground">Completed tracks</span>
              <span className="font-medium">{totals.completedCourses}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3 text-sm">
              <span className="text-muted-foreground">Still in progress</span>
              <span className="font-medium">
                {totals.courses - totals.completedCourses}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining lessons</span>
              <span className="font-medium">
                {Math.max(totals.lessons - totals.completed, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {data.enrollments.map((enrollment: JourneyEnrollment) => (
        <JourneyCourseCard
          enrollment={enrollment}
          key={enrollment.enrollmentId}
        />
      ))}
    </div>
  );
}

function JourneyCourseCard({ enrollment }: { enrollment: JourneyEnrollment }) {
  const nextLesson = getNextLesson(enrollment);
  const defaultSectionValue =
    nextLesson?.sectionId ?? enrollment.sections[0]?.id;
  const courseHref =
    `/dashboard/library/${enrollment.course.slug ?? enrollment.course.id}` as Route;
  const continueHref = nextLesson
    ? (`/learn/${enrollment.course.id}?lesson=${nextLesson.lessonId}` as Route)
    : (`/learn/${enrollment.course.id}` as Route);
  const statusLabel = statusLabelMap[enrollment.status] ?? enrollment.status;
  const isCompleted = enrollment.status === "completed";
  const enrolledLabel = dateFormatter.format(new Date(enrollment.enrolledAt));
  const lessonLabel = enrollment.progress.total === 1 ? "lesson" : "lessons";
  let progressHint = "Ready to continue";

  if (isCompleted) {
    progressHint = "Module finished";
  } else if (nextLesson) {
    progressHint = `Next: ${nextLesson.title}`;
  }

  return (
    <Card className="overflow-hidden bg-card">
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="relative border-b md:border-r md:border-b-0">
          <AspectRatio ratio={16 / 11}>
            {enrollment.course.imageUrl ? (
              <Image
                alt={enrollment.course.title}
                className="h-full w-full object-cover"
                height={320}
                src={enrollment.course.imageUrl}
                width={520}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                Course module
              </div>
            )}
          </AspectRatio>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className="capitalize"
                  variant={isCompleted ? "secondary" : "default"}
                >
                  {statusLabel}
                </Badge>
                <Badge className="capitalize" variant="outline">
                  {difficultyLabelMap[enrollment.course.difficulty] ??
                    enrollment.course.difficulty}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Enrolled {enrolledLabel}
              </p>
            </div>
            <div className="grid gap-2 text-right text-primary-foreground/90 text-xs">
              {enrollment.course.estimatedDuration ? (
                <span className="inline-flex items-center justify-end gap-1.5 rounded-none border border-border/60 bg-background/80 px-2 py-1 text-foreground backdrop-blur-xs">
                  <Clock3Icon className="size-3.5" />
                  {Math.max(
                    1,
                    Math.round(enrollment.course.estimatedDuration / 60)
                  )}
                  h
                </span>
              ) : null}
              <span className="inline-flex items-center justify-end gap-1.5 rounded-none border border-border/60 bg-background/80 px-2 py-1 text-foreground backdrop-blur-xs">
                <BookOpenIcon className="size-3.5" />
                {enrollment.progress.total} {lessonLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <CardHeader className="gap-3 pb-3">
            <CardTitle className="text-lg leading-tight">
              {enrollment.course.title}
            </CardTitle>
            <p className="line-clamp-3 text-muted-foreground text-sm leading-6">
              {enrollment.course.description ?? "No course description yet."}
            </p>
          </CardHeader>

          <CardContent className="flex-1 space-y-4">
            <div className="rounded-none border bg-muted/20 p-3">
              <Progress className="gap-2" value={enrollment.progress.percent}>
                <ProgressLabel>Module progress</ProgressLabel>
                <ProgressValue>
                  {(formattedValue) => `${formattedValue ?? "0"}%`}
                </ProgressValue>
              </Progress>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  {enrollment.progress.completed} of {enrollment.progress.total}{" "}
                  lessons completed
                </span>
                <span className="font-medium text-foreground">
                  {progressHint}
                </span>
              </div>
            </div>

            <Accordion
              defaultValue={defaultSectionValue ? [defaultSectionValue] : []}
              multiple
            >
              {enrollment.sections.map((section: JourneySection) => {
                const completedLessons = section.lessons.filter(
                  (lesson: JourneyLesson) => lesson.isCompleted
                ).length;
                const currentInSection = nextLesson?.sectionId === section.id;

                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="px-3 py-3 hover:no-underline">
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground text-sm">
                            {section.title}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {completedLessons} / {section.lessons.length}{" "}
                            lessons complete
                          </p>
                        </div>
                        {currentInSection ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : null}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      <div className="space-y-2 px-3 pb-3">
                        {section.lessons.map((lesson: JourneyLesson) => {
                          const isCurrent = nextLesson?.lessonId === lesson.id;
                          const lessonHref =
                            `/learn/${enrollment.course.id}?lesson=${lesson.id}` as Route;
                          let lessonActionLabel = "Open";

                          if (lesson.isCompleted) {
                            lessonActionLabel = "Review";
                          } else if (isCurrent) {
                            lessonActionLabel = "Resume";
                          }

                          return (
                            <div
                              className={cn(
                                "flex items-center justify-between gap-3 border bg-background px-3 py-2 text-sm transition-colors",
                                lesson.isCompleted
                                  ? "text-muted-foreground"
                                  : "text-foreground",
                                isCurrent
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              )}
                              key={lesson.id}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <LessonStatusIcon
                                  isCompleted={lesson.isCompleted}
                                  isCurrent={isCurrent}
                                  isStarted={lesson.isStarted}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium">
                                    {lesson.title}
                                  </p>
                                  <p className="text-muted-foreground text-xs capitalize">
                                    {lesson.type}
                                  </p>
                                </div>
                              </div>

                              <Button
                                className="shrink-0"
                                nativeButton={false}
                                render={<Link href={lessonHref} />}
                                size="xs"
                                variant={isCurrent ? "default" : "outline"}
                              >
                                {lessonActionLabel}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>

          <CardFooter className="justify-between gap-3 bg-muted/20">
            <Button
              nativeButton={false}
              render={<Link href={courseHref} />}
              size="sm"
              variant="outline"
            >
              See Full Module
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={continueHref} />}
              size="sm"
            >
              Continue Learning
              <ChevronRightIcon className="size-4" />
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

function JourneyStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-none border bg-background/80 p-4">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 font-semibold text-2xl tracking-tight">{value}</p>
    </div>
  );
}

function LessonStatusIcon({
  isCompleted,
  isStarted,
  isCurrent,
}: {
  isCompleted: boolean;
  isStarted: boolean;
  isCurrent: boolean;
}) {
  if (isCompleted) {
    return <CheckCircle2Icon className="size-4 text-primary" />;
  }

  if (isCurrent || isStarted) {
    return <PlayCircleIcon className="size-4 text-primary" />;
  }

  return <FileTextIcon className="size-4 text-muted-foreground" />;
}

function JourneyEmptyState() {
  return (
    <Empty className="border bg-muted/20 py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GraduationCapIcon />
        </EmptyMedia>
        <EmptyTitle>No active enrollments yet</EmptyTitle>
        <EmptyDescription>
          Head to the library, pick a course, and your learning path will appear
          here.
        </EmptyDescription>
      </EmptyHeader>
      <Button
        nativeButton={false}
        render={<Link href={"/dashboard/library" as Route} />}
      >
        Browse Library
      </Button>
    </Empty>
  );
}

function getNextLesson(enrollment: JourneyEnrollment) {
  for (const section of enrollment.sections) {
    for (const lesson of section.lessons) {
      if (lesson.isStarted && !lesson.isCompleted) {
        return {
          lessonId: lesson.id,
          sectionId: section.id,
          title: lesson.title,
        };
      }
    }
  }

  for (const section of enrollment.sections) {
    for (const lesson of section.lessons) {
      if (!lesson.isCompleted) {
        return {
          lessonId: lesson.id,
          sectionId: section.id,
          title: lesson.title,
        };
      }
    }
  }

  const firstLesson = enrollment.sections[0]?.lessons[0];

  if (!firstLesson) {
    return null;
  }

  return {
    lessonId: firstLesson.id,
    sectionId: enrollment.sections[0].id,
    title: firstLesson.title,
  };
}

export function JourneyListSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
