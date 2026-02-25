import { publicProcedure, router } from "../init";

export const courseRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.course.findMany({
      where: (c, { eq }) => eq(c.status, "published"),
    });
  }),
});
