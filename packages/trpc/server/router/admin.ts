import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/packages/auth/auth";
import { feedback } from "@/packages/db/schema/feedback";
import { report } from "@/packages/db/schema/report";
import { protectedProcedure, router, t } from "../init";

// Admin middleware - checks if user has admin role
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

// Input schemas
const listUsersSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterRole: z.enum(["admin", "instructor", "student"]).optional(),
});

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "instructor", "student"]).default("student"),
});

const banUserSchema = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(), // seconds
});

const setRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["admin", "instructor", "student"]),
});

const listReportsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  type: z.enum(["report", "feedback", "all"]).default("all"),
  status: z
    .enum(["pending", "in_progress", "resolved", "closed", "all"])
    .default("all"),
});

const updateReportStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "in_progress", "resolved", "closed"]),
});

export const adminRouter = router({
  // List users with pagination, search, and filtering
  listUsers: adminProcedure
    .input(listUsersSchema)
    .query(async ({ ctx, input }) => {
      const { limit, offset, search, sortBy, sortDirection, filterRole } =
        input;

      const result = await auth.api.listUsers({
        query: {
          limit,
          offset,
          searchValue: search,
          searchField: "name",
          searchOperator: "contains",
          sortBy,
          sortDirection,
          filterField: filterRole ? "role" : undefined,
          filterValue: filterRole,
          filterOperator: "eq",
        },
        headers: ctx.headers,
      });

      return {
        users: result.users,
        total: result.total,
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

  // Stop impersonating
  stopImpersonating: adminProcedure.mutation(async ({ ctx }) => {
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
