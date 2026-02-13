import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/packages/auth/helper";
import { getServerTrpc, HydrateClient, prefetch } from "@/packages/trpc/server";
import { createLoggerWithContext } from "@/packages/utils/logger";

const authLogger = createLoggerWithContext("auth:layout");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const open = sidebarState?.value === "true";

  authLogger.debug("requesting session");
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const trpc = await getServerTrpc();
  await prefetch(trpc.profile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <DashboardShell defaultOpen={open}>{children}</DashboardShell>
    </HydrateClient>
  );
}
