import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CourseForm } from "@/components/instructor/course-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/packages/auth/auth";
import { getCourseById } from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const instructor = await getInstructorByUserId(session.user.id);
  if (!instructor) {
    redirect("/dashboard");
  }

  const course = await getCourseById(courseId);
  if (!course || course.instructorId !== instructor.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-semibold text-2xl tracking-tight">
            Edit course
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {course.enrolledCount.toLocaleString()} students enrolled
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={`/instructor/courses/${courseId}/curriculum`} />}
          variant="outline"
        >
          Curriculum
        </Button>
      </div>
      <CourseForm course={course} instructorId={instructor.id} />
    </div>
  );
}
