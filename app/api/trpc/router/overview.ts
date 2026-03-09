import { TRPCError } from "@trpc/server";
import { getAdminOverview, getInstructorOverview } from "@/packages/db/queries";
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

const instructorProcedure = protectedProcedure.use(({ ctx, next }) => {
  const role = ctx.session.user.role;

  if (role !== "content_creator" && role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Content creator or platform admin access required",
    });
  }

  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const overviewRouter = router({
  admin: adminProcedure.query(async ({ ctx }) => {
    return getAdminOverview(ctx.db);
  }),

  instructor: instructorProcedure.query(async ({ ctx }) => {
    return getInstructorOverview(
      {
        userId: ctx.session.user.id,
        isAdmin: ctx.session.user.role === "platform_admin",
      },
      ctx.db
    );
  }),
});
