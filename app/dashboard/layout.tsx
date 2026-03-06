import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OrgAutoActivate } from "@/components/dashboard/org-auto-activate";
import { dashboardGuard, withAuthRedirect } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const open = sidebarState?.value === "true";

  await withAuthRedirect(() => prefetch(trpc.user.me.queryOptions()));

  return (
    <HydrateClient>
      <OrgAutoActivate />
      <DashboardShell defaultOpen={open}>{children}</DashboardShell>
    </HydrateClient>
  );
}
