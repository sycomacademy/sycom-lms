import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "@/app/api/trpc/router";
import { createContext } from "@/packages/trpc/context";
import { createLoggerWithContext } from "@/packages/utils/logger";

const trpcLogger = createLoggerWithContext("trpc:handler");

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ error, path }) => {
      trpcLogger.error(`${error.code} on ${path ?? "unknown"}`, {
        code: error.code,
        path,
        message: error.message,
        cause: error.cause,
        name: error.name,
        stack: error.stack,
      });
    },
  });

export { handler as GET, handler as POST };
