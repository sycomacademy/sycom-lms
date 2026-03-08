import type { Route } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/packages/auth/helper";

export default async function DashboardHomePage() {
  const session = await getSession();
  const role = session?.user?.role;

  if (role === "platform_admin") {
    redirect("/dashboard/admin" as Route);
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold text-xl">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Select a section from the sidebar to get started.
      </p>
    </div>
  );
}
