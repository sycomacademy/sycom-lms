import type { Route } from "next";
import { redirect } from "next/navigation";
import { InstructorOverview } from "@/components/dashboard/overview/instructor-overview";
import { getSession } from "@/packages/auth/helper";
import { prefetch, trpc } from "@/packages/trpc/server";

export default async function DashboardHomePage() {
  const session = await getSession();
  const role = session?.user?.role;

  if (role === "platform_admin") {
    redirect("/dashboard/admin" as Route);
  }

  if (role === "content_creator") {
    await prefetch(trpc.overview.instructor.queryOptions());
    return <InstructorOverview />;
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold text-xl">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Student overview is coming next. For now, use the library and journey
        sections from the sidebar.
      </p>
    </div>
  );
}
