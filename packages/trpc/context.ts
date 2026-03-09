import type { NextRequest } from "next/server";
import { auth } from "@/packages/auth/auth";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";

const trpcLogger = createLoggerWithContext("trpc:context");

export const createContext = async (req: NextRequest) => {
  trpcLogger.debug("createContext invoked");
  const reqHeaders = req.headers;
  const session = await auth.api.getSession({ headers: reqHeaders });
  trpcLogger.debug("session resolved", { hasSession: !!session?.user });
  return {
    session,
    db,
    headers: reqHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
