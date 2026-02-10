import { ClientComponent } from "@/app/client";
import { getQueryClient, HydrateClient, trpc } from "@/packages/trpc/server";

export default async function HomePage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(trpc.healthCheck.queryOptions());

  return (
    <HydrateClient>
      <main className="p-6">
        <h1>Hello World</h1>
        <ClientComponent />
      </main>
    </HydrateClient>
  );
}
