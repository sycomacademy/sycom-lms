import { protectedProcedure, router } from "../init";

export const feedbackRouter = router({
  myCourseReviews: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.courseFeedback.findMany({
      where: (f, { eq }) => eq(f.userId, ctx.session.user.id),
    });
  }),
});
