/** biome-ignore-all lint/complexity/noVoid: so that the prefetch function works from the guide */
/** biome-ignore-all lint/suspicious/noExplicitAny: so that the prefetch function works from the guide */
import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import React, { cache } from "react";
import superjson from "superjson";
import { getWebsiteUrl } from "@/packages/env/utils";
import { createContext } from "@/packages/trpc/server/context";
import type { AppRouter } from "@/packages/trpc/server/router";
import { appRouter } from "@/packages/trpc/server/router";
import { makeQueryClient } from "@/packages/trpc/shared";

export const getQueryClient = cache(makeQueryClient);

async function getServerTrpcClient() {
  const cookieStore = await cookies();
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getWebsiteUrl()}/api/trpc`,
        headers: () => ({
          Cookie: cookieStore.toString(),
        }),
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
        transformer: superjson,
      }),
    ],
  });
}

export async function getServerTrpc() {
  const client = await getServerTrpcClient();
  return createTRPCOptionsProxy<AppRouter>({
    client,
    router: appRouter,
    queryClient: getQueryClient(),
  });
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();

  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}

export function batchPrefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptionsArray: T[]
) {
  const queryClient = getQueryClient();

  for (const queryOptions of queryOptionsArray) {
    if (queryOptions.queryKey[1]?.type === "infinite") {
      void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
      void queryClient.prefetchQuery(queryOptions);
    }
  }
}

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return React.createElement(
    HydrationBoundary,
    { state: dehydrate(queryClient) },
    props.children
  );
}

export const getCaller = cache(async () => {
  const headersList = await headers();
  const req = new NextRequest(getWebsiteUrl(), {
    headers: headersList,
  });
  const ctx = await createContext(req);
  return appRouter.createCaller(ctx);
});
