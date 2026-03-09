import { notFound } from "next/navigation";
import { db } from "@/packages/db";
import { getOrgBySlug, getOrgEntitlements } from "@/packages/db/queries";

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const org = await getOrgBySlug(db, { slug });
  if (!org) {
    notFound();
  }

  const entitlements = await getOrgEntitlements(db, {
    organizationId: org.id,
  });

  const activeCourses = entitlements.filter(
    (e) => e.isActive && e.courseStatus === "published"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">{org.name}</h1>
        <p className="text-muted-foreground">
          Welcome to your learning portal.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          Available Courses ({activeCourses.length})
        </h2>
        {activeCourses.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No courses have been assigned to your organization yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCourses.map((entitlement) => (
              <div
                className="rounded-lg border border-border bg-card p-4"
                key={entitlement.id}
              >
                <h3 className="font-medium">{entitlement.courseTitle}</h3>
                {entitlement.expiresAt && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Access until{" "}
                    {new Date(entitlement.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
