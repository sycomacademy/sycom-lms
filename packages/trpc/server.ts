import "server-only";

import type {
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import React, { cache } from "react";
import { getWebsiteUrl } from "@/packages/env/server";
import { createContext } from "@/packages/trpc/core/context";
import { makeQueryClient } from "@/packages/trpc/query-client";
import type { AppRouter } from "@/packages/trpc/routers";
import { appRouter } from "@/packages/trpc/routers";

/** Options returned by tRPC query or infiniteQuery procedures (from getTrpc()). */
type TRPCPrefetchOptions =
  | FetchQueryOptions<unknown, Error, unknown, QueryKey>
  | FetchInfiniteQueryOptions<unknown, Error, unknown, QueryKey, unknown>;

function isInfiniteQueryOptions(
  opts: TRPCPrefetchOptions
): opts is FetchInfiniteQueryOptions<
  unknown,
  Error,
  unknown,
  QueryKey,
  unknown
> {
  const key = opts.queryKey as [string[], { type?: string }?];
  return key[1]?.type === "infinite";
}

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
      }),
    ],
  });
}

export const getTrpc = cache(async () => {
  const client = await getServerTrpcClient();
  return createTRPCOptionsProxy<AppRouter>({
    client,
    queryClient: getQueryClient(),
  });
});

export async function prefetch(queryOptions: TRPCPrefetchOptions) {
  const queryClient = getQueryClient();
  if (isInfiniteQueryOptions(queryOptions)) {
    await queryClient.prefetchInfiniteQuery(queryOptions);
  } else {
    await queryClient.prefetchQuery(queryOptions);
  }
}

export async function batchPrefetch(queryOptionsArray: TRPCPrefetchOptions[]) {
  const queryClient = getQueryClient();
  for (const queryOptions of queryOptionsArray) {
    if (isInfiniteQueryOptions(queryOptions)) {
      await queryClient.prefetchInfiniteQuery(queryOptions);
    } else {
      await queryClient.prefetchQuery(queryOptions);
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
