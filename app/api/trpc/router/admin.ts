import { protectedProcedure, router } from "../init";

export const adminRouter = router({
  stats: protectedProcedure.query(({ ctx }) => {
    return {
      userId: ctx.session.user.id,
    };
  }),
});
