import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";
import { getSession } from "@/packages/auth/helper";
import { redirect } from "next/navigation";
import { SessionIdentify } from "@/components/auth/session-identify";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state");
  const open = sidebarState?.value === "true";
  prefetch(trpc.user.me.queryOptions());

  return (
    <HydrateClient>
      <SessionIdentify
        user={{
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
        }}
      />
      <DashboardShell defaultOpen={open}>{children}</DashboardShell>
    </HydrateClient>
  );
}
