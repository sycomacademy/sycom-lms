import Link from "next/link";
import { ClientComponent } from "@/app/client";
import { Button } from "@/components/ui/button";
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
        <Button nativeButton={false} render={<Link href="/sign-in" />}>
          Sign In
        </Button>
        <Button nativeButton={false} render={<Link href="/sign-up" />}>
          Sign Up
        </Button>
      </main>
    </HydrateClient>
  );
}
