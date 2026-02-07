import { BookOpenIcon, GraduationCapIcon } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import { getEnrollmentsByUserId } from "@/packages/db/queries/enrollment";

export default async function DashboardCoursesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const enrollments = await getEnrollmentsByUserId(session.user.id);

  const completedCount = enrollments.filter(
    (e) => e.enrollment.progress === 100
  ).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-semibold text-2xl tracking-tight">
            My Courses
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            {enrollments.length} enrolled &middot; {inProgressCount} in progress
            &middot; {completedCount} completed
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/courses" />}>
          <BookOpenIcon className="mr-2 size-4" />
          Browse Catalog
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <GraduationCapIcon className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-lg">
                You haven&apos;t enrolled in any courses yet
              </p>
              <p className="mt-1 text-muted-foreground text-sm">
                Browse our catalog to find courses that interest you
              </p>
            </div>
            <Button nativeButton={false} render={<Link href="/courses" />}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map(({ enrollment: enr, course: c }) => (
            <Card className="group overflow-hidden" key={enr.id}>
              <div className="relative aspect-video bg-secondary">
                {c.thumbnailUrl ? (
                  <Image
                    alt={c.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={c.thumbnailUrl}
                  />
                ) : null}
                {enr.progress === 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Badge variant="default">Completed</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{c.category}</Badge>
                  <Badge variant="secondary">{c.level}</Badge>
                </div>
                <h3 className="mb-1 font-semibold text-sm transition-colors group-hover:text-primary">
                  <Link href={`/courses/${c.slug}`}>{c.title}</Link>
                </h3>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                    <span>Progress</span>
                    <span>{enr.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${enr.progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/courses/${c.slug}/learn`}
                        prefetch={false}
                      />
                    }
                    size="sm"
                    variant={enr.progress === 100 ? "outline" : "default"}
                  >
                    {enr.progress === 100 ? "Review" : "Continue"}
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
