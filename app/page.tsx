import { ClientComponent } from "@/app/client";
import {
  getQueryClient,
  getServerTrpc,
  HydrateClient,
} from "@/packages/trpc/server";

export default async function HomePage() {
  const queryClient = getQueryClient();
  const trpc = await getServerTrpc();
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
