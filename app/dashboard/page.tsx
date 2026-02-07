import {
  BookOpenIcon,
  ClockIcon,
  GraduationCapIcon,
  HeartIcon,
  TrophyIcon,
} from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";
import {
  getEnrollmentsByUserId,
  getWishlistByUserId,
} from "@/packages/db/queries/enrollment";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userId = session.user.id;
  const name = session.user.name?.split(" ")[0] ?? "there";

  const [enrollments, wishlistItems] = await Promise.all([
    getEnrollmentsByUserId(userId),
    getWishlistByUserId(userId),
  ]);

  const completedCount = enrollments.filter(
    (e) => e.enrollment.progress === 100
  ).length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your learning dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpenIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-2xl">{enrollments.length}</p>
              <p className="text-muted-foreground text-sm">Enrolled Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ClockIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-2xl">{inProgressCount}</p>
              <p className="text-muted-foreground text-sm">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <TrophyIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-2xl">{completedCount}</p>
              <p className="text-muted-foreground text-sm">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <HeartIcon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-2xl">{wishlistItems.length}</p>
              <p className="text-muted-foreground text-sm">Wishlist</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Continue Learning</h2>
          {enrollments.length > 0 && (
            <Button
              nativeButton={false}
              render={<Link href="/courses" />}
              size="sm"
              variant="ghost"
            >
              Browse courses
            </Button>
          )}
        </div>
        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <GraduationCapIcon className="size-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">No courses yet</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Explore our course catalog to start learning
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Your Wishlist</h2>
        </div>
        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <HeartIcon className="size-10 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">Wishlist is empty</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Save courses you&apos;re interested in for later
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map(({ wishlist: wl, course: c }) => (
              <Card className="group overflow-hidden" key={wl.id}>
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
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">{c.category}</Badge>
                    <Badge variant="secondary">{c.level}</Badge>
                  </div>
                  <h3 className="mb-1 font-semibold text-sm transition-colors group-hover:text-primary">
                    <Link href={`/courses/${c.slug}`}>{c.title}</Link>
                  </h3>
                  <p className="line-clamp-2 text-muted-foreground text-xs">
                    {c.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      £{(c.price / 100).toFixed(2)}
                    </span>
                    <Button
                      nativeButton={false}
                      render={<Link href={`/courses/${c.slug}`} />}
                      size="sm"
                      variant="outline"
                    >
                      View Course
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
