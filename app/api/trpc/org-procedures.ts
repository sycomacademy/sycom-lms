import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { OrgMemberRole } from "@/packages/db/queries/org";
import { member } from "@/packages/db/schema/auth";
import { protectedProcedure, t } from "./init";

// Better Auth stores org/cohort ids on the session record,
// but its TypeScript type doesn't expose them — one cast here instead of everywhere.
interface BetterAuthSessionData {
  session?: { activeOrganizationId?: string; activeTeamId?: string };
}

export function extractCohortId(session: unknown): string | null {
  return (session as BetterAuthSessionData).session?.activeTeamId ?? null;
}

const orgMiddleware = t.middleware(async ({ next, ctx }) => {
  // session is guaranteed by protectedProcedure, but we guard here for type narrowing
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const orgId = (ctx.session as unknown as BetterAuthSessionData).session
    ?.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No organization selected",
    });
  }

  const [memberRow] = await ctx.db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, orgId),
        eq(member.userId, ctx.session.user.id)
      )
    )
    .limit(1);

  if (!memberRow) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this organization",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      orgId,
      memberRole: memberRow.role as OrgMemberRole,
    },
  });
});

export const orgProcedure = protectedProcedure.use(orgMiddleware);

export const orgOwnerOrAdminProcedure = orgProcedure.use(
  async ({ next, ctx }) => {
    if (ctx.memberRole !== "org_owner" && ctx.memberRole !== "org_admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Org owner or admin access required",
      });
    }
    return next({ ctx });
  }
);

export const orgOwnerProcedure = orgProcedure.use(async ({ next, ctx }) => {
  if (ctx.memberRole !== "org_owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Org owner access required",
    });
  }
  return next({ ctx });
});
