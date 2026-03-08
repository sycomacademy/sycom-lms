import { SearchX } from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <main className="min-h-screen">
      <section className="container mx-auto flex min-h-[60vh] items-center px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-6" />
          </div>
          <p className="mb-3 font-medium text-primary text-sm uppercase tracking-[0.2em]">
            Blog
          </p>
          <h1 className="mb-4 font-bold text-4xl text-foreground tracking-tight">
            This article could not be found
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground text-sm sm:text-base">
            The post may have been moved, unpublished, or the link may be out of
            date.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href={"/blog" as Route} />}
            >
              Browse all articles
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
