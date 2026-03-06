import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  getOrganization,
  getOrgMemberRole,
  listCohortMembers,
  listOrgCohorts,
  listOrgMembers,
} from "@/packages/db/queries/org";
import { cohort, cohort_member, member } from "@/packages/db/schema/auth";
import { protectedProcedure, router, t } from "../init";

const orgContextMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const sessionData = ctx.session as {
    session?: { activeOrganizationId?: string };
    user: { id: string };
  };
  const orgId = sessionData.session?.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No organization selected",
    });
  }
  const memberRole = await getOrgMemberRole(ctx.db, {
    organizationId: orgId,
    userId: ctx.session.user.id,
  });
  if (!memberRole) {
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
      memberRole,
    },
  });
});

const orgMemberProcedure = protectedProcedure.use(orgContextMiddleware);

const orgOwnerOrAdminProcedure = orgMemberProcedure.use(
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

const orgOwnerProcedure = orgMemberProcedure.use(async ({ next, ctx }) => {
  if (ctx.memberRole !== "org_owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Org owner access required",
    });
  }
  return next({ ctx });
});

const orgManageProcedure = orgMemberProcedure.use(async ({ next, ctx }) => {
  if (
    ctx.memberRole !== "org_owner" &&
    ctx.memberRole !== "org_admin" &&
    ctx.memberRole !== "org_teacher"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Org management access required",
    });
  }
  return next({ ctx });
});

export const orgRouter = router({
  getOrganization: orgMemberProcedure.query(async ({ ctx }) => {
    const org = await getOrganization(ctx.db, {
      organizationId: ctx.orgId,
    });
    if (!org) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found",
      });
    }
    return org;
  }),

  listMembers: orgMemberProcedure.query(async ({ ctx }) => {
    const rows = await listOrgMembers(ctx.db, {
      organizationId: ctx.orgId,
    });
    return { members: rows };
  }),

  listCohorts: orgMemberProcedure.query(async ({ ctx }) => {
    const rows = await listOrgCohorts(ctx.db, {
      organizationId: ctx.orgId,
      userId: ctx.session.user.id,
      memberRole: ctx.memberRole,
    });
    return { cohorts: rows };
  }),

  listCohortMembers: orgManageProcedure
    .input(z.object({ cohortId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [cohortRow] = await ctx.db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!cohortRow || cohortRow.organizationId !== ctx.orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found",
        });
      }
      if (ctx.memberRole === "org_teacher") {
        const [inCohort] = await ctx.db
          .select({ id: cohort_member.id })
          .from(cohort_member)
          .where(
            and(
              eq(cohort_member.teamId, input.cohortId),
              eq(cohort_member.userId, ctx.session.user.id)
            )
          )
          .limit(1);
        if (!inCohort) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this cohort",
          });
        }
      }

      const rows = await listCohortMembers(ctx.db, {
        cohortId: input.cohortId,
      });
      return { members: rows };
    }),

  createCohort: orgManageProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      await ctx.db.insert(cohort).values({
        id,
        name: input.name.trim(),
        organizationId: ctx.orgId,
      });
      return { id, name: input.name.trim() };
    }),

  updateCohort: orgManageProcedure
    .input(
      z.object({
        cohortId: z.string(),
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ id: cohort.id, organizationId: cohort.organizationId })
        .from(cohort)
        .where(eq(cohort.id, input.cohortId))
        .limit(1);
      if (!row || row.organizationId !== ctx.orgId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cohort not found",
        });
      }
      const updates: { name?: string; image?: string | null; updatedAt: Date } =
        { updatedAt: new Date() };
      if (input.name !== undefined) {
        updates.name = input.name.trim();
      }
      if (input.image !== undefined) {
        updates.image = input.image ?? null;
      }
      await ctx.db
        .update(cohort)
        .set(updates)
        .where(eq(cohort.id, input.cohortId));
      return { success: true };
    }),

  updateOrganization: orgOwnerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        slug: z
          .string()
          .min(1)
          .max(60)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = await getOrganization(ctx.db, {
        organizationId: ctx.orgId,
      });
      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }
      const updates: { name?: string; slug?: string } = {};
      if (input.name !== undefined) {
        updates.name = input.name.trim();
      }
      if (input.slug !== undefined) {
        updates.slug = input.slug;
      }
      if (Object.keys(updates).length === 0) {
        return { success: true };
      }
      const { organization } = await import("@/packages/db/schema/auth");
      await ctx.db
        .update(organization)
        .set(updates)
        .where(eq(organization.id, ctx.orgId));
      return { success: true };
    }),

  updateMemberRole: orgOwnerOrAdminProcedure
    .input(
      z.object({
        memberId: z.string(),
        role: z.enum([
          "org_admin",
          "org_auditor",
          "org_teacher",
          "org_student",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [memberRow] = await ctx.db
        .select({ id: member.id, userId: member.userId, role: member.role })
        .from(member)
        .where(
          and(
            eq(member.id, input.memberId),
            eq(member.organizationId, ctx.orgId)
          )
        )
        .limit(1);
      if (!memberRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }
      if (memberRow.role === "org_owner" && ctx.memberRole !== "org_owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can change the owner's role",
        });
      }
      await ctx.db
        .update(member)
        .set({ role: input.role })
        .where(eq(member.id, input.memberId));
      return { success: true };
    }),
});
