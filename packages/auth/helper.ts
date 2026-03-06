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

const PUBLIC_ORG_SLUG = "platform";

/** Requires session and active non-public org. Returns session and org slug. */
export const orgGuardWithSlug = async (): Promise<{
  session: Awaited<ReturnType<typeof getSession>>;
  slug: string;
}> => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  const sessionWithOrg = session as typeof session & {
    session?: { activeOrganizationId?: string };
  };
  const orgId = sessionWithOrg.session?.activeOrganizationId;
  if (!orgId) {
    redirect("/dashboard");
  }
  const { db } = await import("@/packages/db");
  const { organization } = await import("@/packages/db/schema/auth");
  const { eq } = await import("drizzle-orm");
  const [org] = await db
    .select({ slug: organization.slug })
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1);
  if (!org || org.slug === PUBLIC_ORG_SLUG) {
    redirect("/dashboard");
  }
  return { session, slug: org.slug };
};

/** Requires session and active non-public org. Redirects to dashboard if not in an org context. */
export const orgGuard = async () => {
  const { session } = await orgGuardWithSlug();
  return session;
};

/** Requires org owner role when in a non-public org. */
export const orgOwnerGuard = async () => {
  const session = await orgGuard();
  if (!session) {
    redirect("/sign-in");
  }
  const orgId = (session as { session?: { activeOrganizationId?: string } })
    ?.session?.activeOrganizationId;
  if (!orgId) {
    redirect("/dashboard");
  }
  const { getOrgMemberRole } = await import("@/packages/db/queries/org");
  const { db } = await import("@/packages/db");
  const role = await getOrgMemberRole(db, {
    organizationId: orgId,
    userId: session.user.id,
  });
  if (role !== "org_owner") {
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
