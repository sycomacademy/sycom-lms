import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/packages/auth/helper";
import { getServerTrpc, HydrateClient, prefetch } from "@/packages/trpc/server";
import { createLoggerWithContext } from "@/packages/utils/logger";

const layoutLogger = createLoggerWithContext("dashboard:layout");

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  layoutLogger.debug("requesting session");
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const trpc = await getServerTrpc();
  await prefetch(trpc.profile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <DashboardShell>{children}</DashboardShell>
    </HydrateClient>
  );
}
