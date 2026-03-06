import type { Route } from "next";
import { redirect } from "next/navigation";
import { OrgMenu } from "@/components/dashboard/org/org-menu";
import { orgGuardWithSlug } from "@/packages/auth/helper";

export default async function OrgSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ "org-slug": string }>;
}) {
  const { slug } = await orgGuardWithSlug();
  const { "org-slug": paramSlug } = await params;

  if (paramSlug !== slug) {
    redirect(`/dashboard/org/${slug}`);
  }

  const base = `/dashboard/org/${slug}` as Route;
  const items = [
    { path: base, label: "Overview" },
    { path: `${base}/people` as Route, label: "People" },
    { path: `${base}/cohorts` as Route, label: "Cohorts" },
    { path: `${base}/courses` as Route, label: "Courses" },
    { path: `${base}/settings` as Route, label: "Settings" },
  ];

  return (
    <div className="mb-10 max-w-4xl md:ml-12">
      <OrgMenu items={items} />
      <section className="mt-6">{children}</section>
    </div>
  );
}
