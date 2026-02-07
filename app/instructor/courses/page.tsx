import { BookOpenIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import { getCoursesByInstructorId } from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";

export default async function InstructorCoursesPage() {
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

  const courses = await getCoursesByInstructorId(instructor.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-semibold text-2xl tracking-tight">
            Courses
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage your courses and curriculum
          </p>
        </div>
        <Button render={<Link href="/instructor/courses/new" />}>
          <BookOpenIcon className="mr-2 size-4" />
          New course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <BookOpenIcon className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-lg">No courses yet</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Create your first course to get started
              </p>
            </div>
            <Button render={<Link href="/instructor/courses/new" />}>
              Create course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card className="overflow-hidden" key={course.id}>
              <div className="relative aspect-video bg-muted">
                {course.thumbnailUrl ? (
                  <Image
                    alt={course.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={course.thumbnailUrl}
                  />
                ) : null}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">
                  <Link
                    className="hover:text-primary"
                    href={`/instructor/courses/${course.id}/edit`}
                  >
                    {course.title}
                  </Link>
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {course.enrolledCount.toLocaleString()} students
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    render={
                      <Link href={`/instructor/courses/${course.id}/edit`} />
                    }
                    size="sm"
                    variant="outline"
                  >
                    Edit details
                  </Button>
                  <Button
                    render={
                      <Link
                        href={`/instructor/courses/${course.id}/curriculum`}
                      />
                    }
                    size="sm"
                    variant="secondary"
                  >
                    Curriculum
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
