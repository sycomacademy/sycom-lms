import { dashboardGuard } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function LearnCourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  await dashboardGuard();

  const { courseId } = await params;
  await prefetch(trpc.course.getEnrolledCourse.queryOptions({ courseId }));

  return (
    <HydrateClient>
      <div className="min-h-dvh bg-background text-foreground">{children}</div>
    </HydrateClient>
  );
}
