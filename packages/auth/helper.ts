import { TRPCError } from "@trpc/server";
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

export const dashboardGuard = async () => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
};

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

/**
 * Wraps an async fn that may throw TRPC UNAUTHORIZED.
 * If UNAUTHORIZED is thrown, redirects to sign-in instead of letting the error
 * cause Next.js to switch to client rendering.
 */
export async function withAuthRedirect<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
      redirect("/sign-in");
    }
    throw error;
  }
}
