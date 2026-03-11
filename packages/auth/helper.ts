import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/packages/auth/auth";
import { createLoggerWithContext } from "@/packages/utils/logger";

const PUBLIC_EMAIL_DOMAINS = new Set([
  "aol.com",
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "mail.com",
  "me.com",
  "msn.com",
  "outlook.com",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "ymail.com",
]);

const authLogger = createLoggerWithContext("auth:getSession");

export function isPublicEmailDomain(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain ? PUBLIC_EMAIL_DOMAINS.has(domain) : false;
}

/**
 * Resolve session from explicit headers. Use this in API routes (e.g. tRPC)
 * when you have the incoming request, to ensure cookies are passed correctly.
 */
export async function getSessionFromHeaders(
  headersOrRequest: Headers | { headers: Headers }
): Promise<Awaited<ReturnType<typeof auth.api.getSession>>> {
  const h =
    headersOrRequest instanceof Headers
      ? headersOrRequest
      : headersOrRequest.headers;
  authLogger.debug("fetching session from headers");
  const session = await auth.api.getSession({ headers: h });
  authLogger.debug("session resolved", { hasSession: !!session?.user });
  return session;
}

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
