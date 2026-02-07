import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PathwayCoursesManager } from "@/components/instructor/pathway-courses-manager";
import { PathwayForm } from "@/components/instructor/pathway-form";
import { auth } from "@/packages/auth/auth";
import { getAllCourses } from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";
import {
  getPathwayById,
  getPathwayCourses,
} from "@/packages/db/queries/pathway";

interface EditPathwayPageProps {
  params: Promise<{ pathwayId: string }>;
}

export default async function EditPathwayPage({
  params,
}: EditPathwayPageProps) {
  const { pathwayId } = await params;

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

  const [pathway, pathwayCoursesRows, allCourses] = await Promise.all([
    getPathwayById(pathwayId),
    getPathwayCourses(pathwayId),
    getAllCourses(),
  ]);

  if (!pathway) {
    notFound();
  }

  const pathwayCourses = pathwayCoursesRows.map((r) => ({
    id: r.id,
    courseId: r.course.id,
    courseOrder: r.courseOrder,
    course: r.course,
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Edit pathway
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">{pathway.title}</p>
      </div>

      <PathwayForm pathway={pathway} />

      <PathwayCoursesManager
        allCourses={allCourses}
        initialPathwayCourses={pathwayCourses}
        pathwayId={pathwayId}
        pathwayTitle={pathway.title}
      />
    </div>
  );
}
