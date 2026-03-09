import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getOrgEntitlements,
  grantOrgCourseEntitlement,
  hasOrgCourseEntitlement,
  listAssignableCourses,
  revokeOrgCourseEntitlement,
} from "@/packages/db/queries";
import {
  grantEntitlementSchema,
  revokeEntitlementSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, router, t } from "../init";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform admin access required",
    });
  }
  return next({ ctx });
});

const orgMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const orgId = ctx.session.session.activeOrganizationId;
  if (!orgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      organizationId: orgId,
    },
  });
});

const orgProcedure = protectedProcedure.use(orgMiddleware);

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const entitlementRouter = router({
  /** All published courses (for the grant dropdown). */
  courses: adminProcedure.query(async ({ ctx }) => {
    return listAssignableCourses(ctx.db);
  }),

  list: adminProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return getOrgEntitlements(ctx.db, {
        organizationId: input.organizationId,
      });
    }),

  grant: adminProcedure
    .input(grantEntitlementSchema)
    .mutation(async ({ ctx, input }) => {
      return grantOrgCourseEntitlement(ctx.db, {
        organizationId: input.organizationId,
        courseId: input.courseId,
        maxSeats: input.maxSeats,
        expiresAt: input.expiresAt,
        grantedBy: ctx.session.user.id,
      });
    }),

  revoke: adminProcedure
    .input(revokeEntitlementSchema)
    .mutation(async ({ ctx, input }) => {
      return revokeOrgCourseEntitlement(ctx.db, {
        organizationId: input.organizationId,
        courseId: input.courseId,
      });
    }),

  check: orgProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return hasOrgCourseEntitlement(ctx.db, {
        organizationId: ctx.organizationId,
        courseId: input.courseId,
      });
    }),
});
