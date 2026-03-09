import { Compass } from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";

export default function CourseNotFound() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto flex min-h-[60vh] items-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Compass className="size-6" />
          </div>
          <p className="mb-3 font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Courses
          </p>
          <h1 className="mb-4 font-bold text-4xl text-foreground tracking-tight">
            This course is not available
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground text-sm sm:text-base">
            The course may have been moved, unpublished, or the link may no
            longer be valid.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href={"/courses" as Route} />}
            >
              Browse all courses
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={"/" as Route} />}
              variant="outline"
            >
              Back home
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
