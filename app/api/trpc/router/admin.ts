import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/packages/auth/auth";
import {
  createPublicInvite,
  revokePublicInvite,
} from "@/packages/auth/public-invites";
import { PUBLIC_ORG_SLUG } from "@/packages/db/helper";
import {
  listAdminUsers,
  listPublicInvites as listPublicInviteRecords,
} from "@/packages/db/queries";
import { schema } from "@/packages/db/schema";
import {
  createPublicInviteSchema,
  listAdminUsersSchema,
  listPublicInvitesSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, router } from "../init";

const { user, organization, member, cohort, feedback, report } = schema;

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
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        type: z.enum(["all", "report", "feedback"]).default("all"),
        status: z
          .enum(["all", "pending", "in_progress", "resolved", "closed"])
          .default("all"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, type, status } = input;

      const reportWhere =
        status !== "all"
          ? eq(
              report.status,
              status as "pending" | "in_progress" | "resolved" | "closed"
            )
          : undefined;

      if (type === "report") {
        const [items, [totRow]] = await Promise.all([
          ctx.db
            .select({
              id: report.id,
              type: sql<"report">`'report'`,
              email: report.email,
              subject: report.subject,
              message: sql<string | null>`null`,
              category: report.type,
              status: report.status,
              createdAt: report.createdAt,
            })
            .from(report)
            .where(reportWhere)
            .orderBy(desc(report.createdAt))
            .limit(limit)
            .offset(offset),
          ctx.db.select({ total: count() }).from(report).where(reportWhere),
        ]);
        return { items, total: totRow?.total ?? 0 };
      }

      if (type === "feedback") {
        const [items, [totRow]] = await Promise.all([
          ctx.db
            .select({
              id: feedback.id,
              type: sql<"feedback">`'feedback'`,
              email: feedback.email,
              subject: sql<string | null>`null`,
              message: feedback.message,
              category: sql<string | null>`null`,
              status: sql<string | null>`null`,
              createdAt: feedback.createdAt,
            })
            .from(feedback)
            .orderBy(desc(feedback.createdAt))
            .limit(limit)
            .offset(offset),
          ctx.db.select({ total: count() }).from(feedback),
        ]);
        return { items, total: totRow?.total ?? 0 };
      }

      // type === "all": merge both (status filter ignored for all-mode)
      const [reportItems, feedbackItems, [rTot], [fTot]] = await Promise.all([
        ctx.db
          .select({
            id: report.id,
            type: sql<"report">`'report'`,
            email: report.email,
            subject: report.subject,
            message: sql<string | null>`null`,
            category: report.type,
            status: report.status,
            createdAt: report.createdAt,
          })
          .from(report)
          .orderBy(desc(report.createdAt))
          .limit(300),
        ctx.db
          .select({
            id: feedback.id,
            type: sql<"feedback">`'feedback'`,
            email: feedback.email,
            subject: sql<string | null>`null`,
            message: feedback.message,
            category: sql<string | null>`null`,
            status: sql<string | null>`null`,
            createdAt: feedback.createdAt,
          })
          .from(feedback)
          .orderBy(desc(feedback.createdAt))
          .limit(300),
        ctx.db.select({ total: count() }).from(report),
        ctx.db.select({ total: count() }).from(feedback),
      ]);

      const merged = [...reportItems, ...feedbackItems].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        items: merged.slice(offset, offset + limit),
        total: (rTot?.total ?? 0) + (fTot?.total ?? 0),
      };
    }),

  getReport: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [reportItem] = await ctx.db
        .select()
        .from(report)
        .where(eq(report.id, input.id))
        .limit(1);

      if (reportItem) {
        return { ...reportItem, type: "report" as const };
      }

      const [feedbackItem] = await ctx.db
        .select()
        .from(feedback)
        .where(eq(feedback.id, input.id))
        .limit(1);

      if (feedbackItem) {
        return { ...feedbackItem, type: "feedback" as const };
      }

      throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
    }),

  updateReportStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "in_progress", "resolved", "closed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(report)
        .set({ status: input.status })
        .where(eq(report.id, input.id));
      return { success: true };
    }),

  // ── Organizations ────────────────────────────────────────────────────────

  listOrganizations: adminProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search } = input;

      const where = and(
        ne(organization.slug, PUBLIC_ORG_SLUG),
        search
          ? or(
              ilike(organization.name, `%${search}%`),
              ilike(organization.slug, `%${search}%`)
            )
          : undefined
      );

      const [orgs, [totRow]] = await Promise.all([
        ctx.db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            createdAt: organization.createdAt,
            memberCount: sql<number>`(
              SELECT COUNT(*)::int FROM auth.member m
              WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
            )`,
            ownerName: sql<string | null>`(
              SELECT u.name FROM auth.user u
              INNER JOIN auth.member m ON m.user_id = u.id
              WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
                AND m.role = 'org_owner'
              LIMIT 1
            )`,
            ownerEmail: sql<string | null>`(
              SELECT u.email FROM auth.user u
              INNER JOIN auth.member m ON m.user_id = u.id
              WHERE m.organization_id = ${sql.raw('"auth"."organization"."id"')}
                AND m.role = 'org_owner'
              LIMIT 1
            )`,
          })
          .from(organization)
          .where(where)
          .orderBy(desc(organization.createdAt))
          .limit(limit)
          .offset(offset),
        ctx.db.select({ total: count() }).from(organization).where(where),
      ]);

      if (orgs.length === 0) {
        return { orgs: [], total: totRow?.total ?? 0 };
      }

      const orgIds = orgs.map((org) => org.id);
      const orgUserRows = await ctx.db
        .select({
          organizationId: member.organizationId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
          role: member.role,
          joinedAt: member.createdAt,
        })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(inArray(member.organizationId, orgIds))
        .orderBy(asc(member.createdAt));

      const usersByOrg = new Map<
        string,
        {
          users: {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
            role:
              | "org_owner"
              | "org_admin"
              | "org_auditor"
              | "org_teacher"
              | "org_student";
          }[];
          userCount: number;
        }
      >();

      for (const row of orgUserRows) {
        const existing = usersByOrg.get(row.organizationId) ?? {
          users: [],
          userCount: 0,
        };

        existing.users.push({
          id: row.userId,
          name: row.userName,
          email: row.userEmail,
          image: row.userImage,
          role: row.role,
        });
        existing.userCount += 1;
        usersByOrg.set(row.organizationId, existing);
      }

      return {
        orgs: orgs.map((org) => {
          const users = usersByOrg.get(org.id);
          return {
            ...org,
            users: users?.users ?? [],
            userCount: users?.userCount ?? 0,
          };
        }),
        total: totRow?.total ?? 0,
      };
    }),

  createOrganization: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z
          .string()
          .min(1)
          .regex(
            /^[a-z0-9-]+$/,
            "Lowercase letters, numbers, and hyphens only"
          ),
        ownerEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [ownerUser] = await ctx.db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.email, input.ownerEmail))
        .limit(1);

      if (!ownerUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that email address",
        });
      }

      const [existing] = await ctx.db
        .select({ id: organization.id })
        .from(organization)
        .where(eq(organization.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An organization with this slug already exists",
        });
      }

      const orgId = crypto.randomUUID();

      await ctx.db.insert(organization).values({
        id: orgId,
        name: input.name,
        slug: input.slug,
      });

      await ctx.db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        userId: ownerUser.id,
        role: "org_owner",
      });

      await ctx.db.insert(cohort).values({
        id: crypto.randomUUID(),
        name: "General",
        organizationId: orgId,
      });

      return { id: orgId, name: input.name, slug: input.slug };
    }),
});
