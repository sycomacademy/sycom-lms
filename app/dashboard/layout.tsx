import { redirect } from "next/navigation";
import { getQueryClient, HydrateClient, trpc } from "@/packages/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  const user = await queryClient
    .fetchQuery(trpc.user.me.queryOptions())
    .catch(() => null);

  if (!user) {
    redirect("/sign-in");
  }

  return <HydrateClient>{children}</HydrateClient>;
}
