import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CurriculumTree } from "@/components/instructor/curriculum-tree";
import { Button } from "@/components/ui/button";
import { auth } from "@/packages/auth/auth";
import {
  getCourseById,
  getCourseWithModules,
} from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

interface CurriculumPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CurriculumPage({ params }: CurriculumPageProps) {
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

  const modules = await getCourseWithModules(courseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-semibold text-2xl tracking-tight">
            Curriculum
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {course.title} · Drag to reorder
          </p>
        </div>
        <Button
          render={<Link href={`/instructor/courses/${courseId}/edit`} />}
          variant="outline"
        >
          Course details
        </Button>
      </div>

      <CurriculumTree
        courseId={courseId}
        courseTitle={course.title}
        initialModules={modules}
      />
    </div>
  );
}
