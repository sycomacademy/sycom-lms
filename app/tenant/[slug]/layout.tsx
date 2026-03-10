import { notFound, redirect } from "next/navigation";
import { TenantShell } from "@/components/tenant/tenant-shell";
import { getSession } from "@/packages/auth/helper";
import { db } from "@/packages/db";
import {
  getOrgBySlug,
  isMemberOfOrg,
  setSessionActiveOrg,
} from "@/packages/db/queries";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "platform") {
    redirect("/dashboard");
  }

  const org = await getOrgBySlug(db, { slug });
  if (!org) {
    notFound();
  }

  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const memberOfOrg = await isMemberOfOrg(db, {
    userId: session.user.id,
    organizationId: org.id,
  });
  if (!memberOfOrg) {
    redirect("/dashboard");
  }

  // Auto-set active org to match the subdomain
  if (session.session.activeOrganizationId !== org.id) {
    await setSessionActiveOrg(db, {
      sessionId: session.session.id,
      organizationId: org.id,
    });
  }

  await prefetch(trpc.user.me.queryOptions());

  return (
    <HydrateClient>
      <TenantShell org={org}>{children}</TenantShell>
    </HydrateClient>
  );
}
