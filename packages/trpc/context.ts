import type { NextRequest } from "next/server";
import { getSessionFromHeaders } from "@/packages/auth/helper";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";

const trpcLogger = createLoggerWithContext("trpc:context");

export const createContext = async (req: NextRequest) => {
  trpcLogger.debug("createContext invoked");
  const headers = req.headers;
  const session = await getSessionFromHeaders(req);
  return {
    session,
    db,
    headers,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
