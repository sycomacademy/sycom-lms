import { Suspense } from "react";
import { BlogList } from "@/components/dashboard/blog/blog-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { instructorGuard } from "@/packages/auth/helper";

export default async function DashboardBlogPage() {
  await instructorGuard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Blog</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Create, publish, and manage articles for the public blog.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <BlogList />
      </Suspense>
    </div>
  );
}
