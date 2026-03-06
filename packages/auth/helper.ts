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

const PUBLIC_ORG_SLUG = "platform";

export interface ActiveOrgContext {
  session: Awaited<ReturnType<typeof getSession>>;
  organizationId: string;
  slug: string;
  memberRole:
    | "org_owner"
    | "org_admin"
    | "org_auditor"
    | "org_teacher"
    | "org_student";
}

export const getActiveOrgContext = async (): Promise<ActiveOrgContext> => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }

  const sessionWithOrg = session as typeof session & {
    session?: { activeOrganizationId?: string };
  };
  const organizationId = sessionWithOrg.session?.activeOrganizationId;
  if (!organizationId) {
    redirect("/dashboard");
  }

  const [{ db }, { organization, member }, { and, eq }] = await Promise.all([
    import("@/packages/db"),
    import("@/packages/db/schema/auth"),
    import("drizzle-orm"),
  ]);

  const [orgMembership] = await db
    .select({
      slug: organization.slug,
      memberRole: member.role,
    })
    .from(organization)
    .innerJoin(
      member,
      and(
        eq(member.organizationId, organization.id),
        eq(member.userId, session.user.id)
      )
    )
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (!orgMembership || orgMembership.slug === PUBLIC_ORG_SLUG) {
    redirect("/dashboard");
  }

  return {
    session,
    organizationId,
    slug: orgMembership.slug,
    memberRole: orgMembership.memberRole,
  };
};

/** Requires session and active non-public org. Returns session and org slug. */
export const orgGuardWithSlug = async (): Promise<{
  session: Awaited<ReturnType<typeof getSession>>;
  slug: string;
}> => {
  const { session, slug } = await getActiveOrgContext();
  return { session, slug };
};

/** Requires session and active non-public org. Redirects to dashboard if not in an org context. */
export const orgGuard = async () => {
  const { session } = await orgGuardWithSlug();
  return session;
};

/** Requires org owner role when in a non-public org. */
export const orgOwnerGuard = async () => {
  const { session, memberRole } = await getActiveOrgContext();
  if (memberRole !== "org_owner") {
    redirect("/dashboard");
  }
  return session;
};

/** Requires org owner or org admin role in active non-public org. */
export const orgOwnerOrAdminGuard = async () => {
  const { session, memberRole } = await getActiveOrgContext();
  if (memberRole !== "org_owner" && memberRole !== "org_admin") {
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
