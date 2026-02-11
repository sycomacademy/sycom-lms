import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSession } from "@/packages/auth/helper";
import { getServerTrpc, HydrateClient, prefetch } from "@/packages/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const trpc = await getServerTrpc();
  await prefetch(
    trpc.dashboard.me.queryOptions() as Parameters<typeof prefetch>[0]
  );

  return (
    <HydrateClient>
      <DashboardShell session={session as NonNullable<typeof session>}>
        {children}
      </DashboardShell>
    </HydrateClient>
  );
}
