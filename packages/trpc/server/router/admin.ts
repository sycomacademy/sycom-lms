import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/packages/auth/auth";
import { user } from "@/packages/db/schema/auth";
import { feedback } from "@/packages/db/schema/feedback";
import { report } from "@/packages/db/schema/report";
import {
  banUserSchema,
  createUserSchema,
  listReportsSchema,
  listUsersSchema,
  setRoleSchema,
  updateReportStatusSchema,
} from "@/packages/types/admin";
import { protectedProcedure, router, t } from "../init";

const adminMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user || ctx.session.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

const adminProcedure = protectedProcedure.use(adminMiddleware);

export const adminRouter = router({
  // List users with pagination, search, and filtering
  listUsers: adminProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, search, sortBy, sortDirection, filterRole } =
        input;
      const { db } = ctx;

      // Build WHERE conditions
      const conditions: ReturnType<typeof eq>[] = [];

      if (filterRole) {
        conditions.push(eq(user.role, filterRole));
      }

      // Case-insensitive search on both name and email
      const searchCondition = search
        ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
        : undefined;

      const allConditions = [
        ...conditions,
        ...(searchCondition ? [searchCondition] : []),
      ];
      const where =
        allConditions.length > 0 ? and(...allConditions) : undefined;

      // Sort
      const ORDER_COLUMNS = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      } as const;
      const orderColumn = ORDER_COLUMNS[sortBy];
      const orderBy =
        sortDirection === "asc" ? asc(orderColumn) : desc(orderColumn);

      const [users, totalResult] = await Promise.all([
        db
          .select()
          .from(user)
          .where(where)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(user).where(where),
      ]);

      return {
        users,
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    }),

  // Create a new user
  createUser: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await auth.api.createUser({
        body: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
        },
        headers: ctx.headers,
      });

      return result;
    }),

  // Ban a user
  banUser: adminProcedure
    .input(banUserSchema)
    .mutation(async ({ ctx, input }) => {
      await auth.api.banUser({
        body: {
          userId: input.userId,
          banReason: input.banReason,
          banExpiresIn: input.banExpiresIn,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  // Unban a user
  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.unbanUser({
        body: {
          userId: input.userId,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  // Delete a user
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.removeUser({
        body: {
          userId: input.userId,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  // Set user role
  setRole: adminProcedure
    .input(setRoleSchema)
    .mutation(async ({ ctx, input }) => {
      // Admins cannot change their own role
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role",
        });
      }

      // Admins cannot change another admin's role
      const [target] = await ctx.db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (target.role === "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change the role of another admin",
        });
      }

      await auth.api.setRole({
        body: {
          userId: input.userId,
          role: input.role,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  // Impersonate a user
  impersonateUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.impersonateUser({
        body: {
          userId: input.userId,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  // Stop impersonating — uses protectedProcedure (not admin) because
  // the current session user is the impersonated user who may not be admin.
  // We verify impersonation is active via the session's impersonatedBy field.
  stopImpersonating: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session.session.impersonatedBy) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not currently impersonating anyone",
      });
    }

    await auth.api.stopImpersonating({
      headers: ctx.headers,
    });

    return { success: true };
  }),

  // List reports and feedback combined
  listReports: adminProcedure
    .input(listReportsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, type, status } = input;
      const { db } = ctx;

      // Build conditions for reports
      const reportConditions: ReturnType<typeof eq>[] = [];
      if (status !== "all") {
        reportConditions.push(eq(report.status, status));
      }

      // Build conditions for feedback (feedback doesn't have status, so we filter it out if status filter is applied)
      const includeFeedback = type !== "report" && status === "all";
      const includeReports = type !== "feedback";

      // Combine both tables using union
      let results: Array<{
        id: string;
        type: "report" | "feedback";
        userId: string | null;
        email: string;
        subject: string | null;
        message: string;
        category: string | null;
        status: string | null;
        imageUrl: string | null;
        createdAt: Date;
      }> = [];
      let total = 0;

      if (includeReports && includeFeedback) {
        // Get reports
        const reportsQuery = db
          .select({
            id: report.id,
            type: sql<"report">`'report'`.as("type"),
            userId: report.userId,
            email: report.email,
            subject: report.subject,
            message: report.description,
            category: report.type,
            status: report.status,
            imageUrl: report.imageUrl,
            createdAt: report.createdAt,
          })
          .from(report)
          .where(
            reportConditions.length > 0 ? and(...reportConditions) : undefined
          );

        // Get feedback
        const feedbackQuery = db
          .select({
            id: feedback.id,
            type: sql<"feedback">`'feedback'`.as("type"),
            userId: feedback.userId,
            email: feedback.email,
            subject: sql<null>`NULL`.as("subject"),
            message: feedback.message,
            category: sql<null>`NULL`.as("category"),
            status: sql<null>`NULL`.as("status"),
            imageUrl: sql<null>`NULL`.as("imageUrl"),
            createdAt: feedback.createdAt,
          })
          .from(feedback);

        const [reportsResult, feedbackResult] = await Promise.all([
          reportsQuery,
          feedbackQuery,
        ]);

        // Combine and sort
        results = [...reportsResult, ...feedbackResult]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(offset, offset + limit);

        total = reportsResult.length + feedbackResult.length;
      } else if (includeReports) {
        // Only reports
        const whereCondition =
          status !== "all" ? eq(report.status, status) : undefined;

        const [reportsResult, countResult] = await Promise.all([
          db
            .select({
              id: report.id,
              type: sql<"report">`'report'`.as("type"),
              userId: report.userId,
              email: report.email,
              subject: report.subject,
              message: report.description,
              category: report.type,
              status: report.status,
              imageUrl: report.imageUrl,
              createdAt: report.createdAt,
            })
            .from(report)
            .where(whereCondition)
            .orderBy(desc(report.createdAt))
            .limit(limit)
            .offset(offset),
          db
            .select({ count: sql<number>`count(*)` })
            .from(report)
            .where(whereCondition),
        ]);

        results = reportsResult;
        total = Number(countResult[0]?.count ?? 0);
      } else if (includeFeedback) {
        // Only feedback
        const [feedbackResult, countResult] = await Promise.all([
          db
            .select({
              id: feedback.id,
              type: sql<"feedback">`'feedback'`.as("type"),
              userId: feedback.userId,
              email: feedback.email,
              subject: sql<null>`NULL`.as("subject"),
              message: feedback.message,
              category: sql<null>`NULL`.as("category"),
              status: sql<null>`NULL`.as("status"),
              imageUrl: sql<null>`NULL`.as("imageUrl"),
              createdAt: feedback.createdAt,
            })
            .from(feedback)
            .orderBy(desc(feedback.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(feedback),
        ]);

        results = feedbackResult;
        total = Number(countResult[0]?.count ?? 0);
      }

      return {
        items: results,
        total,
        limit,
        offset,
      };
    }),

  // Get single report details
  getReport: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      // Try to find in reports first
      const reportResult = await db
        .select()
        .from(report)
        .where(eq(report.id, input.id))
        .limit(1);

      if (reportResult.length > 0) {
        return {
          ...reportResult[0],
          type: "report" as const,
        };
      }

      // Try feedback
      const feedbackResult = await db
        .select()
        .from(feedback)
        .where(eq(feedback.id, input.id))
        .limit(1);

      if (feedbackResult.length > 0) {
        return {
          ...feedbackResult[0],
          type: "feedback" as const,
          subject: null,
          category: null,
          status: null,
          imageUrl: null,
        };
      }

      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Report or feedback not found",
      });
    }),

  // Update report status
  updateReportStatus: adminProcedure
    .input(updateReportStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const result = await db
        .update(report)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(report.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return result[0];
    }),
});
