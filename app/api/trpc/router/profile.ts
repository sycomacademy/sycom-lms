import { protectedProcedure, router } from "../init";

export const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.profile.findFirst({
      where: (p, { eq }) => eq(p.userId, ctx.session.user.id),
    });
  }),
});
