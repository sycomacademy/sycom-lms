"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type React from "react";
import { useState } from "react";
import superjson from "superjson";
import { getWebsiteUrl } from "@/packages/env/utils";
import type { AppRouter } from "@/packages/trpc/server/router";
import { makeQueryClient } from "../shared";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

let clientQueryClientSingleton: QueryClient | null = null;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: reuse the same client
  if (clientQueryClientSingleton === null) {
    clientQueryClientSingleton = makeQueryClient();
  }

  return clientQueryClientSingleton;
}

export const TRPCReactProvider = (
  props: Readonly<{
    children: React.ReactNode;
  }>
) => {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getWebsiteUrl()}/api/trpc`,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
          transformer: superjson,
        }),
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
          logger: (opts) => {
            const prefix = "[client:tRPC]";
            const direction =
              opts.direction === "up" ? "→ request" : "← response";
            const path = "path" in opts ? opts.path : "?";
            if (opts.direction === "up") {
              console.debug(`${prefix} ${direction} ${path}`, opts.input ?? {});
            } else {
              const status = opts.result instanceof Error ? "error" : "ok";
              const elapsed = "elapsedMs" in opts ? ` ${opts.elapsedMs}ms` : "";
              console.debug(
                `${prefix} ${direction} ${path} (${status})${elapsed}`
              );
            }
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
};
