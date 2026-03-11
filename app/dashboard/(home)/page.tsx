import type { Route } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { InstructorOverview } from "@/components/dashboard/overview/instructor-overview";
import { StudentOverview } from "@/components/dashboard/overview/student-overview";
import { getSession } from "@/packages/auth/helper";
import { prefetch, trpc } from "@/packages/trpc/server";

export default async function DashboardHomePage() {
  const session = await getSession();
  const role = session?.user?.role;

  if (role === "platform_admin") {
    redirect("/dashboard/admin" as Route);
  }

  if (role === "content_creator") {
    await prefetch(trpc.overview.instructor.queryOptions());
    return <InstructorOverview />;
  }

  await Promise.all([
    prefetch(trpc.enrollment.listMy.queryOptions()),
    prefetch(
      trpc.course.listPublic.queryOptions({
        limit: 4,
        offset: 0,
        sortBy: "updatedAt",
        sortDirection: "desc",
      })
    ),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <StudentOverview />
    </Suspense>
  );
}
