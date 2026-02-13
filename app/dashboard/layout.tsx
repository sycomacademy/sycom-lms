import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";
import AuthCheck from "@/components/auth/auth-check";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  <AuthCheck isOnLoggedInPage={true} />;
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const open = sidebarState?.value === "true";

  prefetch(trpc.profile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <DashboardShell defaultOpen={open}>{children}</DashboardShell>
    </HydrateClient>
  );
}
