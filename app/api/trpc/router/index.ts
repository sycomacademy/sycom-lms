import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { checkHealth } from "@/packages/db/queries";
import { publicProcedure, router } from "../init";
import { adminRouter } from "./admin";
import { categoryRouter } from "./category";
import { courseRouter } from "./course";
import { feedbackRouter } from "./feedback";
import { orgRouter } from "./org";
import { userRouter } from "./user";

export const appRouter = router({
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    const result = await checkHealth(ctx.db);
    return result;
  }),
  user: userRouter,
  feedback: feedbackRouter,
  admin: adminRouter,
  category: categoryRouter,
  course: courseRouter,
  org: orgRouter,
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
