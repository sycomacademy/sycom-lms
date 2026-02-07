import { BookOpenIcon, GraduationCapIcon, RouteIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import { getCoursesByInstructorId } from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";
import { getAllPathways } from "@/packages/db/queries/pathway";

export default async function InstructorDashboardPage() {
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

  const [courses, pathways] = await Promise.all([
    getCoursesByInstructorId(instructor.id),
    getAllPathways(),
  ]);

  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Instructor dashboard
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage your courses and pathways
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpenIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-2xl">{courses.length}</p>
              <p className="text-muted-foreground text-sm">Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCapIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-2xl">
                {totalStudents.toLocaleString()}
              </p>
              <p className="text-muted-foreground text-sm">Students enrolled</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <RouteIcon className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-2xl">{pathways.length}</p>
              <p className="text-muted-foreground text-sm">Pathways</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Your courses</h2>
        <Button
          nativeButton={false}
          render={<Link href="/instructor/courses/new" />}
        >
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
                    Edit
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

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Pathways</h2>
        <Button render={<Link href="/instructor/pathways/new" />}>
          <RouteIcon className="mr-2 size-4" />
          New pathway
        </Button>
      </div>

      {pathways.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <RouteIcon className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-lg">No pathways yet</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Create a pathway to bundle courses
              </p>
            </div>
            <Button render={<Link href="/instructor/pathways/new" />}>
              Create pathway
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pathways.map((pathway) => (
            <Card key={pathway.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold">
                  <Link
                    className="hover:text-primary"
                    href={`/instructor/pathways/${pathway.id}/edit`}
                  >
                    {pathway.title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                  {pathway.shortDescription}
                </p>
                <Button
                  className="mt-3"
                  render={
                    <Link href={`/instructor/pathways/${pathway.id}/edit`} />
                  }
                  size="sm"
                  variant="outline"
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
