import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cookies, headers } from "next/headers";
import { NextRequest } from "next/server";
import React, { cache } from "react";

import { createContext } from "@/packages/trpc/context";
import { makeQueryClient } from "@/packages/trpc/query-client";
import type { AppRouter } from "@/packages/trpc/routers";
import { appRouter } from "@/packages/trpc/routers";

function getBaseUrl() {
	return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const getQueryClient = cache(makeQueryClient);

async function getServerTrpcClient() {
	const cookieStore = await cookies();
	return createTRPCClient<AppRouter>({
		links: [
			httpBatchLink({
				url: `${getBaseUrl()}/api/trpc`,
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

export async function prefetch(
	queryOptions: ReturnType<
		ReturnType<
			typeof createTRPCOptionsProxy<AppRouter>
		>["todo"]["getAll"]["queryOptions"]
	>
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		await queryClient.prefetchInfiniteQuery(queryOptions as never);
	} else {
		await queryClient.prefetchQuery(queryOptions as never);
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
	const req = new NextRequest(getBaseUrl(), {
		headers: headersList,
	});
	const ctx = await createContext(req);
	return appRouter.createCaller(ctx);
});
