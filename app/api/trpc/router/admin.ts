import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { auth } from "@/packages/auth/auth";
import {
  createPublicInvite,
  revokePublicInvite,
} from "@/packages/auth/public-invites";
import {
  createAdminOrganization,
  getAdminReportById,
  getUserRoleById,
  listAdminEnrollments,
  listAdminOrganizations,
  listAdminReports,
  listAdminUsers,
  listPublicInvites as listPublicInviteRecords,
  updateAdminReportStatus,
} from "@/packages/db/queries";
import {
  createOrganizationSchema,
  createPublicInviteSchema,
  getAdminReportSchema,
  listAdminEnrollmentsSchema,
  listAdminReportsSchema,
  listAdminUsersSchema,
  listOrganizationsSchema,
  listPublicInvitesSchema,
  updateAdminReportStatusSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, router } from "../init";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform admin access required",
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ── Users ────────────────────────────────────────────────────────────────

  listUsers: adminProcedure
    .input(listAdminUsersSchema)
    .query(async ({ ctx, input }) => {
      return listAdminUsers(ctx.db, input);
    }),

  createUser: adminProcedure
    .input(createPublicInviteSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await createPublicInvite(
        {
          ...input,
          createdBy: ctx.session.user.id,
          inviterName: ctx.session.user.name,
        },
        ctx.db
      );

      if (result.conflict === "user_exists") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      if (result.conflict === "invite_exists") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An active invite already exists for this email",
        });
      }

      return { success: true, emailSent: result.emailSent };
    }),

  listPublicInvites: adminProcedure
    .input(listPublicInvitesSchema)
    .query(async ({ ctx, input }) => {
      return listPublicInviteRecords(ctx.db, input);
    }),

  revokePublicInvite: adminProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const revoked = await revokePublicInvite(input, ctx.db);
      if (!revoked) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }
      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const role = await getUserRoleById(ctx.db, { userId: input.userId });
      if (role === "platform_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete a platform admin",
        });
      }
      await auth.api.removeUser({
        body: { userId: input.userId },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  banUser: adminProcedure
    .input(z.object({ userId: z.string(), banReason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.banUser({
        body: { userId: input.userId, banReason: input.banReason },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.unbanUser({
        body: { userId: input.userId },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  setRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["platform_admin", "content_creator", "platform_student"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.setRole({
        body: { userId: input.userId, role: input.role },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  impersonateUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.impersonateUser({
        body: { userId: input.userId },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  stopImpersonation: protectedProcedure.mutation(async ({ ctx }) => {
    const sessionData = ctx.session.session;
    if (!sessionData?.impersonatedBy) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not currently impersonating",
      });
    }
    await auth.api.stopImpersonating({ headers: ctx.headers });
    return { success: true };
  }),

  sendVerificationEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.sendVerificationEmail({
        body: { email: input.email, callbackURL: "/dashboard" },
        headers: ctx.headers,
      });
      return { success: true };
    }),

  // ── Reports & Feedback ───────────────────────────────────────────────────

  listReports: adminProcedure
    .input(listAdminReportsSchema)
    .query(async ({ ctx, input }) => {
      return listAdminReports(ctx.db, input);
    }),

  getReport: adminProcedure
    .input(getAdminReportSchema)
    .query(async ({ ctx, input }) => {
      const item = await getAdminReportById(ctx.db, input);

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return item;
    }),

  updateReportStatus: adminProcedure
    .input(updateAdminReportStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const updated = await updateAdminReportStatus(ctx.db, input);

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return { success: true };
    }),

  // ── Organizations ────────────────────────────────────────────────────────

  listOrganizations: adminProcedure
    .input(listOrganizationsSchema)
    .query(async ({ ctx, input }) => {
      return listAdminOrganizations(ctx.db, input);
    }),

  createOrganization: adminProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await createAdminOrganization(ctx.db, input);

      if (result.ownerNotFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that email address",
        });
      }

      if (result.conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An organization with this slug already exists",
        });
      }

      return result.organization;
    }),

  // ── Enrollments ──────────────────────────────────────────────────────────

  listEnrollments: adminProcedure
    .input(listAdminEnrollmentsSchema)
    .query(async ({ ctx, input }) => {
      return listAdminEnrollments(ctx.db, input);
    }),
});
