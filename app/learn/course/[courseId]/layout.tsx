import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { LearnCourseShell } from "@/components/learn/learn-course-shell";
import { withAuthRedirect } from "@/packages/auth/helper";
import { getCaller } from "@/packages/trpc/server";

interface LearnCourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function LearnCourseLayout({
  children,
  params,
}: LearnCourseLayoutProps) {
  const { courseId } = await params;

  try {
    const data = await withAuthRedirect(async () => {
      return (await getCaller()).course.getEnrolledCourse({ courseId });
    });

    return (
      <LearnCourseShell
        courseId={courseId}
        courseTitle={data.course.title}
        sections={data.sections}
      >
        {children}
      </LearnCourseShell>
    );
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    if (
      error instanceof TRPCError &&
      (error.code === "FORBIDDEN" || error.code === "BAD_REQUEST")
    ) {
      notFound();
    }
    throw error;
  }
}
