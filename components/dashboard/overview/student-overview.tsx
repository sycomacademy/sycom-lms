"use client";

import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  PlayCircle,
} from "lucide-react";
import type { Route } from "next";
import type { AppRouter } from "@/app/api/trpc/router";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import {
  OverviewListEmpty,
  OverviewSectionSkeleton,
  OverviewStatCard,
  OverviewStatsSkeleton,
} from "@/components/dashboard/overview/overview-primitives";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { useTRPC } from "@/packages/trpc/client";

const OVERVIEW_REFETCH_INTERVAL_MS = 60 * 1000;
const DISCOVER_COURSE_LIMIT = 4;

type StudentOverviewData =
  inferRouterOutputs<AppRouter>["enrollment"]["listMy"];
type Enrollment = StudentOverviewData["enrollments"][number];
type PublicCourse =
  inferRouterOutputs<AppRouter>["course"]["listPublic"]["courses"][number];

function getNextLesson(enrollment: Enrollment) {
  for (const section of enrollment.sections) {
    for (const lesson of section.lessons) {
      if (lesson.isStarted && !lesson.isCompleted) {
        return {
          lessonId: lesson.id,
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
    title: firstLesson.title,
  };
}

function getOverviewModel(enrollments: Enrollment[]) {
  const totals = enrollments.reduce(
    (acc, enrollment) => {
      acc.courses += 1;
      acc.lessons += enrollment.progress.total;
      acc.completedLessons += enrollment.progress.completed;

      if (enrollment.status === "completed") {
        acc.completedCourses += 1;
      }

      return acc;
    },
    {
      courses: 0,
      lessons: 0,
      completedLessons: 0,
      completedCourses: 0,
    }
  );

  const activeCourses = enrollments.filter(
    (enrollment) => enrollment.status !== "completed"
  );
  const continueEnrollment =
    activeCourses
      .map((enrollment) => ({
        enrollment,
        nextLesson: getNextLesson(enrollment),
      }))
      .find((item) => item.nextLesson) ?? null;

  return {
    activeCourses: activeCourses.length,
    completedCourses: totals.completedCourses,
    completedLessons: totals.completedLessons,
    overallPercent:
      totals.lessons > 0
        ? Math.round((totals.completedLessons / totals.lessons) * 100)
        : 0,
    continueEnrollment,
    recentEnrollments: enrollments.slice(0, 3),
  };
}

export function StudentOverview() {
  const trpc = useTRPC();
  const enrollmentQueryOptions = trpc.enrollment.listMy.queryOptions();
  const discoverQueryOptions = trpc.course.listPublic.queryOptions({
    limit: DISCOVER_COURSE_LIMIT,
    offset: 0,
    sortBy: "updatedAt",
    sortDirection: "desc",
  });

  const { data } = useQuery({
    ...enrollmentQueryOptions,
    refetchInterval: OVERVIEW_REFETCH_INTERVAL_MS,
  });
  const { data: discoverData } = useQuery({
    ...discoverQueryOptions,
    refetchInterval: OVERVIEW_REFETCH_INTERVAL_MS,
  });

  const enrollments = data?.enrollments ?? [];
  const model = data ? getOverviewModel(enrollments) : null;
  const enrolledCourseIds = new Set(enrollments.map((item) => item.course.id));
  const discoverCourses = (discoverData?.courses ?? []).filter(
    (course) => !enrolledCourseIds.has(course.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <DashboardGreeting />
        <p className="text-muted-foreground text-sm">
          Stay on top of your progress, jump back into the right lesson, and
          find your next course faster.
        </p>
      </div>

      {model ? (
        <StudentStatsSection model={model} />
      ) : (
        <OverviewStatsSkeleton />
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {model ? (
          <ContinueLearningSection model={model} />
        ) : (
          <OverviewSectionSkeleton />
        )}

        {model ? (
          <RecentActivitySection enrollments={model.recentEnrollments} />
        ) : (
          <OverviewSectionSkeleton />
        )}
      </div>

      {model ? (
        <DiscoverSection courses={discoverCourses} />
      ) : (
        <OverviewSectionSkeleton className="h-72" />
      )}
    </div>
  );
}

function StudentStatsSection({
  model,
}: {
  model: ReturnType<typeof getOverviewModel>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OverviewStatCard
        description="Courses you are currently moving through right now."
        icon={PlayCircle}
        title="In progress"
        value={model.activeCourses.toLocaleString()}
      />
      <OverviewStatCard
        description="Courses you have already completed end to end."
        icon={GraduationCap}
        title="Completed"
        value={model.completedCourses.toLocaleString()}
      />
      <OverviewStatCard
        description="Finished lessons across every enrollment in your journey."
        icon={BookOpen}
        title="Lessons cleared"
        value={model.completedLessons.toLocaleString()}
      />
      <OverviewStatCard
        description="Your combined completion rate across enrolled coursework."
        icon={Compass}
        title="Overall progress"
        value={`${model.overallPercent}%`}
      />
    </div>
  );
}

function ContinueLearningSection({
  model,
}: {
  model: ReturnType<typeof getOverviewModel>;
}) {
  const item = model.continueEnrollment;
  const nextLesson = item?.nextLesson;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue learning</CardTitle>
        <CardDescription>
          Pick up the next lesson in your strongest active course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {item && nextLesson ? (
          <div className="space-y-5">
            <div className="space-y-3 border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-base">
                    {item.enrollment.course.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Next lesson: {nextLesson.title}
                  </p>
                </div>
                <Badge variant="outline">
                  {item.enrollment.progress.percent}% done
                </Badge>
              </div>

              <Progress value={item.enrollment.progress.percent}>
                <ProgressLabel>Course progress</ProgressLabel>
                <ProgressValue>{(value) => `${value ?? "0"}%`}</ProgressValue>
              </Progress>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-muted-foreground">
                  {item.enrollment.progress.completed} of{" "}
                  {item.enrollment.progress.total} lessons completed
                </p>
                <div className="flex gap-2">
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={
                          `/dashboard/library/${item.enrollment.course.slug ?? item.enrollment.course.id}` as Route
                        }
                      />
                    }
                    size="sm"
                    variant="outline"
                  >
                    View course
                  </Button>
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={
                          `/learn/${item.enrollment.course.id}?lesson=${nextLesson.lessonId}` as Route
                        }
                      />
                    }
                    size="sm"
                  >
                    Resume
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat
                label="Active courses"
                value={String(model.activeCourses)}
              />
              <MiniStat
                label="Completed courses"
                value={String(model.completedCourses)}
              />
              <MiniStat
                label="Lessons finished"
                value={String(model.completedLessons)}
              />
            </div>
          </div>
        ) : (
          <OverviewListEmpty
            description="Enroll in a course from the library and your next lesson will appear here automatically."
            title="Nothing to resume yet"
          />
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivitySection({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent course activity</CardTitle>
        <CardDescription>
          Your latest enrollments and current completion status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <OverviewListEmpty
            description="Once you enroll in a course, it will show up here with progress and quick links."
            title="No learning activity yet"
          />
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => {
              const href =
                `/dashboard/library/${enrollment.course.slug ?? enrollment.course.id}` as Route;

              return (
                <Link
                  className="flex items-start justify-between gap-3 border-b pb-3 transition-colors last:border-b-0 last:pb-0 hover:bg-muted/40"
                  href={href}
                  key={enrollment.enrollmentId}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-sm">
                      {enrollment.course.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {enrollment.progress.completed} /{" "}
                      {enrollment.progress.total} lessons completed
                    </p>
                  </div>
                  <Badge
                    variant={
                      enrollment.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {enrollment.progress.percent}%
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DiscoverSection({ courses }: { courses: PublicCourse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discover something new</CardTitle>
        <CardDescription>
          A few recently updated courses you have not enrolled in yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <OverviewListEmpty
            description="You are already enrolled in the latest published courses. Check the library for the full catalog."
            title="No fresh picks right now"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {courses.map((course) => {
              const href =
                `/dashboard/library/${course.slug ?? course.id}` as Route;

              return (
                <Link
                  className="space-y-2 border p-4 transition-colors hover:bg-muted/40"
                  href={href}
                  key={course.id}
                >
                  <Badge className="capitalize" variant="outline">
                    {course.difficulty}
                  </Badge>
                  <p className="font-medium text-sm">{course.title}</p>
                  <p className="line-clamp-2 text-muted-foreground text-xs">
                    {course.description ??
                      "Explore this course in the library."}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-muted/20 p-3">
      <p className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 font-semibold text-xl tracking-tight">{value}</p>
    </div>
  );
}
