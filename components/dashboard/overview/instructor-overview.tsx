"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Layers3,
  PencilLine,
} from "lucide-react";
import type { Route } from "next";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { InstructorContentChart } from "@/components/dashboard/overview/instructor-content-chart";
import {
  OverviewListEmpty,
  OverviewSectionSkeleton,
  OverviewStatCard,
  OverviewStatsSkeleton,
} from "@/components/dashboard/overview/overview-primitives";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { getInstructorOverview } from "@/packages/db/queries";
import { useTRPC } from "@/packages/trpc/client";

const OVERVIEW_REFETCH_INTERVAL_MS = 60 * 1000;

type InstructorOverviewData = Awaited<ReturnType<typeof getInstructorOverview>>;

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatStatus(status: string | null) {
  if (!status) {
    return "unknown";
  }

  return status.replace("_", " ");
}

export function InstructorOverview() {
  const trpc = useTRPC();
  const queryOptions = trpc.overview.instructor.queryOptions();
  const { data } = useQuery({
    ...queryOptions,
    refetchInterval: OVERVIEW_REFETCH_INTERVAL_MS,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <DashboardGreeting />
        <p className="text-muted-foreground text-sm">
          Here is a quick snapshot of your teaching workspace, content pipeline,
          and recent updates.
        </p>
      </div>

      {data ? (
        <InstructorStatsSection data={data} />
      ) : (
        <OverviewStatsSkeleton />
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {data ? (
          <InstructorContentSection data={data} />
        ) : (
          <OverviewSectionSkeleton />
        )}

        {data ? (
          <InstructorRecentCoursesSection data={data} />
        ) : (
          <OverviewSectionSkeleton />
        )}
      </div>

      {data ? (
        <InstructorRecentPostsSection data={data} />
      ) : (
        <OverviewSectionSkeleton className="h-72" />
      )}
    </div>
  );
}

function InstructorStatsSection({ data }: { data: InstructorOverviewData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OverviewStatCard
        description={`${data.totals.publishedCourses} published and ${data.totals.draftCourses} still in progress.`}
        icon={GraduationCap}
        title="Courses"
        value={data.totals.totalCourses.toLocaleString()}
      />
      <OverviewStatCard
        description="Learners currently assigned across your visible courses."
        icon={Layers3}
        title="Enrollments"
        value={data.totals.totalEnrollments.toLocaleString()}
      />
      <OverviewStatCard
        description="Lessons currently available to shape your learning paths."
        icon={BookOpen}
        title="Lessons"
        value={data.totals.totalLessons.toLocaleString()}
      />
      <OverviewStatCard
        description={`${data.totals.publishedPosts} published and ${data.totals.draftPosts} in draft.`}
        icon={FileText}
        title="Blog posts"
        value={data.totals.totalPosts.toLocaleString()}
      />
    </div>
  );
}

function InstructorContentSection({ data }: { data: InstructorOverviewData }) {
  return <InstructorContentChart data={data.contentStatus} />;
}

function InstructorRecentCoursesSection({
  data,
}: {
  data: InstructorOverviewData;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently updated courses</CardTitle>
        <CardDescription>
          Jump back into the courses you touched most recently.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.recentCourses.length === 0 ? (
          <OverviewListEmpty
            description="Create your first course to start building curriculum and lessons."
            title="No courses yet"
          />
        ) : (
          <div className="space-y-3">
            {data.recentCourses.map((course) => (
              <Link
                className="flex items-start justify-between gap-3 border-b pb-3 transition-colors last:border-b-0 last:pb-0 hover:bg-muted/40"
                href={`/dashboard/courses/${course.id}/edit` as Route}
                key={course.id}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        course.status === "published" ? "default" : "outline"
                      }
                    >
                      {formatStatus(course.status)}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(course.updatedAt)}
                    </span>
                  </div>
                  <p className="truncate font-medium text-sm">{course.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {course.lessonCount.toLocaleString()} lessons ·{" "}
                    {course.enrollmentCount.toLocaleString()} enrollments
                  </p>
                </div>
                <PencilLine className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InstructorRecentPostsSection({
  data,
}: {
  data: InstructorOverviewData;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent blog activity</CardTitle>
        <CardDescription>
          Track the posts you are polishing or have already shipped.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.recentPosts.length === 0 ? (
          <OverviewListEmpty
            description="Draft posts will show up here once you start writing for the public blog."
            title="No blog activity yet"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.recentPosts.map((post) => (
              <Link
                className="space-y-2 border p-4 transition-colors hover:bg-muted/40"
                href={"/dashboard/blog" as Route}
                key={post.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={
                      post.status === "published" ? "default" : "secondary"
                    }
                  >
                    {formatStatus(post.status)}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(post.publishedAt ?? post.updatedAt)}
                  </span>
                </div>
                <p className="font-medium text-sm">{post.title}</p>
                <p className="text-muted-foreground text-xs">
                  Last updated {formatDate(post.updatedAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
