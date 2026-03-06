import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "@/packages/db";
import {
  getOrganization,
  listCohortMembers,
  listOrgCohorts,
  listOrgMembers,
} from "@/packages/db/queries";
import { cohort, cohort_member, member } from "@/packages/db/schema/auth";
import { router } from "../init";
import {
  orgOwnerOrAdminProcedure,
  orgOwnerProcedure,
  orgProcedure,
} from "../org-procedures";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertMemberInOrg(
  db: Database,
  memberId: string,
  orgId: string
): Promise<string> {
  const [row] = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.id, memberId), eq(member.organizationId, orgId)))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
  }
  return row.userId;
}

async function assertCohortInOrg(
  db: Database,
  cohortId: string,
  orgId: string
): Promise<void> {
  const [row] = await db
    .select({ id: cohort.id })
    .from(cohort)
    .where(and(eq(cohort.id, cohortId), eq(cohort.organizationId, orgId)))
    .limit(1);
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Cohort not found" });
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const orgRouter = router({
  getOrganization: orgProcedure.query(async ({ ctx }) => {
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

  listMembers: orgOwnerOrAdminProcedure.query(async ({ ctx }) => {
    const rows = await listOrgMembers(ctx.db, {
      organizationId: ctx.orgId,
    });
    return { members: rows };
  }),

  listCohorts: orgProcedure.query(async ({ ctx }) => {
    const rows = await listOrgCohorts(ctx.db, {
      organizationId: ctx.orgId,
      userId: ctx.session.user.id,
      memberRole: ctx.memberRole,
    });
    return { cohorts: rows };
  }),

  listCohortMembers: orgOwnerOrAdminProcedure
    .input(z.object({ cohortId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCohortInOrg(ctx.db, input.cohortId, ctx.orgId);
      const rows = await listCohortMembers(ctx.db, {
        cohortId: input.cohortId,
      });
      return { members: rows };
    }),

  assignMemberToCohort: orgOwnerOrAdminProcedure
    .input(z.object({ memberId: z.string(), cohortId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await assertMemberInOrg(ctx.db, input.memberId, ctx.orgId);
      await assertCohortInOrg(ctx.db, input.cohortId, ctx.orgId);

      const [existing] = await ctx.db
        .select({ id: cohort_member.id })
        .from(cohort_member)
        .where(
          and(
            eq(cohort_member.userId, userId),
            eq(cohort_member.teamId, input.cohortId)
          )
        )
        .limit(1);

      if (existing) {
        return { success: true };
      }

      await ctx.db.insert(cohort_member).values({
        id: crypto.randomUUID(),
        userId,
        teamId: input.cohortId,
      });

      return { success: true };
    }),

  removeMemberFromCohort: orgOwnerOrAdminProcedure
    .input(z.object({ memberId: z.string(), cohortId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await assertMemberInOrg(ctx.db, input.memberId, ctx.orgId);
      await assertCohortInOrg(ctx.db, input.cohortId, ctx.orgId);

      await ctx.db
        .delete(cohort_member)
        .where(
          and(
            eq(cohort_member.userId, userId),
            eq(cohort_member.teamId, input.cohortId)
          )
        );

      return { success: true };
    }),

  moveMemberToCohort: orgOwnerOrAdminProcedure
    .input(z.object({ memberId: z.string(), cohortId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = await assertMemberInOrg(ctx.db, input.memberId, ctx.orgId);
      await assertCohortInOrg(ctx.db, input.cohortId, ctx.orgId);

      const orgCohorts = await ctx.db
        .select({ id: cohort.id })
        .from(cohort)
        .where(eq(cohort.organizationId, ctx.orgId));

      const orgCohortIds = orgCohorts.map((row) => row.id);
      if (orgCohortIds.length > 0) {
        await ctx.db
          .delete(cohort_member)
          .where(
            and(
              eq(cohort_member.userId, userId),
              inArray(cohort_member.teamId, orgCohortIds)
            )
          );
      }

      await ctx.db.insert(cohort_member).values({
        id: crypto.randomUUID(),
        userId,
        teamId: input.cohortId,
      });

      return { success: true };
    }),

  createCohort: orgOwnerOrAdminProcedure
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

  updateCohort: orgOwnerOrAdminProcedure
    .input(
      z.object({
        cohortId: z.string(),
        name: z.string().min(1).max(100).optional(),
        image: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCohortInOrg(ctx.db, input.cohortId, ctx.orgId);

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
