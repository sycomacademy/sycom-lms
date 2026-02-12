import type { NextRequest } from "next/server";
import { cache } from "react";
import { getSession } from "@/packages/auth/helper";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";

const contextLogger = createLoggerWithContext("trpc:context");

export const createContext = cache(async (req: NextRequest) => {
  contextLogger.debug("createContext invoked");
  const headers = req.headers;
  const session = await getSession();
  return {
    session,
    db,
    headers,
  };
});

export type Context = Awaited<ReturnType<typeof createContext>>;
