import { asc } from "drizzle-orm";
import { category } from "@/packages/db/schema/course";
import { publicProcedure, router } from "../init";

export const categoryRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        order: category.order,
      })
      .from(category)
      .orderBy(asc(category.order));
  }),
});
