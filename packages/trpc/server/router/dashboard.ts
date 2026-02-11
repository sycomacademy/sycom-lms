import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { profile } from "@/packages/db/schema/profile";
import { protectedProcedure, router } from "../init";

export const dashboardRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, ctx.session.user.id))
      .limit(1);
    return { profile: row ?? null };
  }),
});
