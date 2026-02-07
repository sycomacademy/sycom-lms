import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CourseForm } from "@/components/instructor/course-form";
import { auth } from "@/packages/auth/auth";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

export default async function NewCoursePage() {
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          New course
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Add course details. You can add modules and lessons from the
          curriculum page after saving.
        </p>
      </div>
      <CourseForm instructorId={instructor.id} />
    </div>
  );
}
