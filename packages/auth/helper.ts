import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";
import { createLoggerWithContext } from "@/packages/utils/logger";

const authLogger = createLoggerWithContext("auth:getSession");

export const AUTH_COOKIE = "better-auth.session_token";

/**
 * Session for the current request. Cached per-request so multiple
 * getSession() calls (e.g. in layout + page + Server Actions) only hit auth once.
 */
export const getSession = cache(async () => {
  authLogger.debug("fetching session");
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  authLogger.debug("session resolved", { hasSession: !!session?.user });
  return session;
});

export const dashboardGuard = async () => {
  const session = await getSession();
  if (!session) {
    // Clear invalid cookie via Route Handler (cannot mutate cookies in RSC), then redirect to sign-in.
    redirect("/api/auth/clear-session?redirect=/sign-in");
  }
};

export const signInGuard = async () => {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }
};
