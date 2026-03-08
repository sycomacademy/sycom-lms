import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { checkHealth } from "@/packages/db/queries";
import { publicProcedure, router } from "../init";
import { adminRouter } from "./admin";
import { blogRouter } from "./blog";
import { categoryRouter } from "./category";
import { courseRouter } from "./course";
import { feedbackRouter } from "./feedback";
import { inviteRouter } from "./invite";
import { orgRouter } from "./org";
import { overviewRouter } from "./overview";
import { storageRouter } from "./storage";
import { userRouter } from "./user";

export const appRouter = router({
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    const result = await checkHealth(ctx.db);
    return result;
  }),
  user: userRouter,
  feedback: feedbackRouter,
  invite: inviteRouter,
  admin: adminRouter,
  blog: blogRouter,
  category: categoryRouter,
  course: courseRouter,
  org: orgRouter,
  overview: overviewRouter,
  storage: storageRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
