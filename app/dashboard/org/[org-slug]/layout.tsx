import type { Route } from "next";
import { redirect } from "next/navigation";
import { OrgMenu } from "@/components/dashboard/org/org-menu";
import { getActiveOrgContext } from "@/packages/auth/helper";

export default async function OrgSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "org-slug": string }>;
}) {
  const { slug, memberRole } = await getActiveOrgContext();
  const { "org-slug": paramSlug } = await params;

  if (paramSlug !== slug) {
    redirect(`/dashboard/org/${slug}`);
  }

  const base = `/dashboard/org/${slug}` as Route;
  const canManageOrg = memberRole === "org_owner" || memberRole === "org_admin";
  const items = canManageOrg
    ? [
        { path: base, label: "Overview" },
        { path: `${base}/people` as Route, label: "People" },
        { path: `${base}/cohorts` as Route, label: "Cohorts" },
        { path: `${base}/courses` as Route, label: "Courses" },
        ...(memberRole === "org_owner"
          ? ([
              { path: `${base}/settings` as Route, label: "Settings" },
            ] as const)
          : []),
      ]
    : [
        { path: `${base}/cohorts` as Route, label: "My cohorts" },
        { path: `${base}/courses` as Route, label: "My courses" },
      ];

  return (
    <div className="mb-10 max-w-6xl md:ml-12">
      <OrgMenu items={items} />
      <section className="mt-6">{children}</section>
    </div>
  );
}
