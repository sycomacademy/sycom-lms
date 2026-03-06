import type { Route } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/packages/auth/helper";

export default async function DashboardHomePage() {
  const session = await getSession();
  const role = session?.user?.role;
  const sessionWithOrg = session as typeof session & {
    session?: { activeOrganizationId?: string };
  };
  const orgId = sessionWithOrg.session?.activeOrganizationId;

  if (role === "platform_admin" && !orgId) {
    redirect("/dashboard/admin" as Route);
  }

  if (orgId) {
    const { db } = await import("@/packages/db");
    const { organization } = await import("@/packages/db/schema/auth");
    const { eq } = await import("drizzle-orm");
    const [org] = await db
      .select({ slug: organization.slug })
      .from(organization)
      .where(eq(organization.id, orgId))
      .limit(1);
    if (org && org.slug !== "platform") {
      redirect(`/dashboard/org/${org.slug}`);
    }
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
