import { asc } from "drizzle-orm";
import { category } from "@/packages/db/schema/course";
import { protectedProcedure, router } from "../init";

export const categoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    return db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })
      .from(category)
      .orderBy(asc(category.order), asc(category.name));
  }),
});
