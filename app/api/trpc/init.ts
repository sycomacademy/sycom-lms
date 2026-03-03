import { initTRPC, TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";
import { auth } from "@/packages/auth/auth";
import type { UserRole } from "@/packages/db/helper";
import { teamMember } from "@/packages/db/schema/auth";
import type { Context } from "@/packages/trpc/context";
import { createLoggerWithContext } from "@/packages/utils/logger";

const trpcLogger = createLoggerWithContext("trpc:init");

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? treeifyError(error.cause) : null,
      },
    };
  },
});

export const router = t.router;
export const callerFactory = t.createCallerFactory;

/** Logs every procedure call: path, type, caller, and duration. */
const loggingMiddleware = t.middleware(async ({ next, path, type, ctx }) => {
  const start = performance.now();
  const userId = ctx.session?.user?.id ?? "anonymous";

  const result = await next();

  const durationMs = Math.round(performance.now() - start);
  const ok = result.ok;

  trpcLogger.debug(`${type} ${path}`, {
    path,
    type,
    userId,
    ok,
    durationMs,
  });

  return result;
});

const protectedMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return await next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/** Requires the caller to have a platform admin role. */
const adminMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  const role = ctx.session.user.role as UserRole | null;
  if (role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Platform admin access required",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/** Requires an active organization and verifies the caller is a member. */
const organizationMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const activeOrgId = ctx.session.session.activeOrganizationId;
  if (!activeOrgId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No active organization selected",
    });
  }

  const activeMember = await auth.api.getActiveMember({
    headers: ctx.headers,
  });
  if (!activeMember) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not a member of the active organization",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      activeOrgId,
      activeMember,
    },
  });
});

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);

export const adminProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware)
  .use(adminMiddleware);

export const orgProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware)
  .use(organizationMiddleware);

/**
 * Creates an org procedure that also checks the caller has specific permissions
 * in the active organization.
 *
 * @example
 * ```ts
 * const courseRouter = router({
 *   create: withOrgPermission({ course: ["create"] })
 *     .input(z.object({ name: z.string() }))
 *     .mutation(async ({ ctx, input }) => { ... }),
 * });
 * ```
 */
export const withOrgPermission = (permissions: Record<string, string[]>) =>
  orgProcedure.use(
    t.middleware(async ({ ctx, next }) => {
      const result = await auth.api.hasPermission({
        headers: ctx.headers,
        body: { permissions },
      });
      if (!result?.success) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient organization permissions",
        });
      }
      return next({ ctx });
    })
  );

/**
 * Verifies that the caller is a member of the given cohort. Organization
 * owners and admins bypass the membership check. Returns the cohort
 * membership record in the context when applicable.
 *
 * Use inside an `orgProcedure` handler or middleware chain where
 * `ctx.activeMember`, `ctx.session`, and `ctx.db` are available.
 *
 * @example
 * ```ts
 * const enrollmentRouter = router({
 *   list: orgProcedure
 *     .input(z.object({ cohortId: z.string() }))
 *     .query(async ({ ctx, input }) => {
 *       const cohortMembership = await verifyCohortMembership(ctx, input.cohortId);
 *       // proceed with cohort-scoped logic
 *     }),
 * });
 * ```
 */
export async function verifyCohortMembership(
  ctx: {
    session: NonNullable<Context["session"]>;
    activeMember: { role: string };
    db: Context["db"];
  },
  cohortId: string
) {
  // Organization owners and admins bypass cohort membership check
  const memberRole = ctx.activeMember.role;
  if (memberRole === "owner" || memberRole === "admin") {
    return null;
  }

  // Verify the user is a member of this specific cohort
  const membership = await ctx.db.query.teamMember.findFirst({
    where: and(
      eq(teamMember.userId, ctx.session.user.id),
      eq(teamMember.teamId, cohortId)
    ),
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not a member of this cohort",
    });
  }

  return membership;
}
