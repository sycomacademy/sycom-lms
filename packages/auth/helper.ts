import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";
import { createLoggerWithContext } from "@/packages/utils/logger";

const authLogger = createLoggerWithContext("auth:getSession");

/**
 * Session for the current request. Cached per-request so multiple
 * getSession() calls (e.g. in layout + page + Server Actions) only hit auth once.
 */
export const getSession = cache(async () => {
  authLogger.info("fetching session");
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  authLogger.info("session resolved", { hasSession: !!session?.user });
  return session;
});
