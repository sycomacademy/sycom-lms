import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { checkHealth } from "@/packages/db/queries";
import { publicProcedure, router } from "../init";

export const appRouter = router({
  healthCheck: publicProcedure.query(async ({ ctx }) => {
    const result = await checkHealth(ctx.db);
    return {
      dbHealth: result,
      apiHealth: "OK",
    };
  }),
});

export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
