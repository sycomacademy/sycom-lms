import { TRPCError } from "@trpc/server";
import { createLoggerWithContext } from "@/packages/utils/logger";
import { t } from "./core";

const trpcLogger = createLoggerWithContext("trpc:init");

/** Logs every procedure call: path, type, caller, and duration. */
export const loggingMiddleware = t.middleware(
  async ({ next, path, type, ctx }) => {
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
  }
);

export const protectedMiddleware = t.middleware(async ({ next, ctx }) => {
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

// /** Requires the caller to have a platform admin role. */
// export const adminMiddleware = t.middleware(async ({ next, ctx }) => {
//   if (!ctx.session) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "Authentication required",
//     });
//   }
//   const role = ctx.session.user.role as UserRole | null;
//   if (role !== "platform_admin") {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "Platform admin access required",
//     });
//   }
//   return next({ ctx: { ...ctx, session: ctx.session } });
// });

// /** Requires an active organization and verifies the caller is a member. */
// export const organizationMiddleware = t.middleware(async ({ next, ctx }) => {
//   if (!ctx.session) {
//     throw new TRPCError({
//       code: "UNAUTHORIZED",
//       message: "Authentication required",
//     });
//   }

//   const activeOrgId = ctx.session.session.activeOrganizationId;
//   if (!activeOrgId) {
//     throw new TRPCError({
//       code: "BAD_REQUEST",
//       message: "No active organization selected",
//     });
//   }

//   const activeMember = await auth.api.getActiveMember({
//     headers: ctx.headers,
//   });
//   if (!activeMember) {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "Not a member of the active organization",
//     });
//   }

//   return next({
//     ctx: {
//       ...ctx,
//       session: ctx.session,
//       activeOrgId,
//       activeMember,
//     },
//   });
// });

// /**
//  * Middleware that checks the caller has specific permissions in the active
//  * organization.
//  *
//  * @example
//  * ```ts
//  * const courseRouter = router({
//  *   create: orgProcedure
//  *     .use(withOrgPermission({ course: ["create"] }))
//  *     .input(z.object({ name: z.string() }))
//  *     .mutation(async ({ ctx, input }) => { ... }),
//  * });
//  * ```
//  */
// export const withOrgPermission = (permissions: Record<string, string[]>) =>
//   t.middleware(async ({ ctx, next }) => {
//     const result = await auth.api.hasPermission({
//       headers: ctx.headers,
//       body: { permissions },
//     });
//     if (!result?.success) {
//       throw new TRPCError({
//         code: "FORBIDDEN",
//         message: "Insufficient organization permissions",
//       });
//     }
//     return next({ ctx });
//   });

// /**
//  * Verifies that the caller is a member of the given cohort. Organization
//  * owners and admins bypass the membership check. Returns the cohort
//  * membership record in the context when applicable.
//  *
//  * Use inside an `orgProcedure` handler or middleware chain where
//  * `ctx.activeMember`, `ctx.session`, and `ctx.db` are available.
//  *
//  * @example
//  * ```ts
//  * const enrollmentRouter = router({
//  *   list: orgProcedure
//  *     .input(z.object({ cohortId: z.string() }))
//  *     .query(async ({ ctx, input }) => {
//  *       const cohortMembership = await verifyCohortMembership(ctx, input.cohortId);
//  *       // proceed with cohort-scoped logic
//  *     }),
//  * });
//  * ```
//  */
// export async function verifyCohortMembership(
//   ctx: {
//     session: NonNullable<Context["session"]>;
//     activeMember: { role: string };
//     db: Context["db"];
//   },
//   _cohortId: string
// ) {
//   // Organization owners and admins bypass cohort membership check
//   const memberRole = ctx.activeMember.role;
//   if (memberRole === "owner" || memberRole === "admin") {
//     return null;
//   }

//   // Verify the user is a member of this specific cohort
//   const membership = await ctx.db.query.teamMember.findFirst({
//     where:
//       and(
//         // eq(teamMember.userId, ctx.session.user.id),
//         // eq(teamMember.teamId, cohortId)
//       ),
//   });

//   if (!membership) {
//     throw new TRPCError({
//       code: "FORBIDDEN",
//       message: "Not a member of this cohort",
//     });
//   }

//   return membership;
// }
