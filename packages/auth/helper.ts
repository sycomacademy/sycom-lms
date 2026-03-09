import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";
import { createLoggerWithContext } from "@/packages/utils/logger";

const authLogger = createLoggerWithContext("auth:getSession");

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

/**
 * Ensures the user is authenticated.
 * If there is no active session, the user is redirected to the sign-in page.
 * Use in layouts or page components to protect routes that require authentication.
 */
export const dashboardGuard = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
};

/**
 * Ensures the user is authenticated and is a platform admin.
 * - If there is no active session, the user is redirected to the sign-in page.
 * - If authenticated but not a "platform_admin", user is redirected to the dashboard.
 * Use to protect admin-only dashboard pages.
 */
export const adminGuard = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (session.user.role !== "platform_admin") {
    redirect("/dashboard");
  }
};

export const signInGuard = async () => {
  const session = await getSession();
  if (session) {
    redirect("/");
  }
};

export const instructorGuard = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (
    session.user.role !== "content_creator" &&
    session.user.role !== "platform_admin"
  ) {
    redirect("/dashboard");
  }
  return session;
};
