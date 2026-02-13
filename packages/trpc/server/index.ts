/** biome-ignore-all lint/complexity/noVoid: so that the prefetch function works from the guide */
/** biome-ignore-all lint/suspicious/noExplicitAny: so that the prefetch function works from the guide */
import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  createTRPCOptionsProxy,
  type TRPCQueryOptions,
} from "@trpc/tanstack-react-query";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import React, { cache } from "react";
import { getWebsiteUrl } from "@/packages/env/utils";
import { createContext } from "@/packages/trpc/server/context";
import { appRouter } from "@/packages/trpc/server/router";
import { makeQueryClient } from "@/packages/trpc/shared";
import { createLoggerWithContext } from "@/packages/utils/logger";

export const getQueryClient = cache(makeQueryClient);

const trpcLogger = createLoggerWithContext("trpc:server");

const trpcContext = async () => {
  const headersList = await headers();
  const req = new NextRequest(getWebsiteUrl(), {
    headers: headersList,
  });
  const ctx = await createContext(req);
  return ctx;
};

export const trpc = createTRPCOptionsProxy({
  ctx: trpcContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/**
 * Prefetch and await completion. Use when you need data in cache before first paint.
 * Adds verification logging in development.
 */
export async function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T
) {
  const queryClient = getQueryClient();
  const path = String(queryOptions.queryKey?.[0] ?? "?");
  trpcLogger.debug("prefetch start", { path });

  if (queryOptions.queryKey[1]?.type === "infinite") {
    await queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    await queryClient.prefetchQuery(queryOptions);
  }

  const state = queryClient.getQueryState(queryOptions.queryKey);
  trpcLogger.debug("prefetch complete", {
    path,
    status: state?.status,
    hasData: !!state?.data,
  });
}

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const dehydrated = dehydrate(queryClient);
  trpcLogger.debug("HydrateClient dehydrate", {
    queries: dehydrated.queries?.length ?? 0,
  });
  return React.createElement(
    HydrationBoundary,
    { state: dehydrated },
    props.children
  );
}

export const getCaller = cache(async () => {
  const ctx = await trpcContext();
  return appRouter.createCaller(ctx);
});
