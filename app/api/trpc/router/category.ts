import { publicProcedure, router } from "../init";

export const categoryRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.category.findMany({
      orderBy: (cat, { asc }) => asc(cat.sortOrder),
    });
  }),
});
