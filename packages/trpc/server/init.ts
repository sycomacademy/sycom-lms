import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? treeifyError(error.cause) : null,
      },
    };
  },
});

export const router = t.router;
export const callerFactory = t.createCallerFactory;

const protectedMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(protectedMiddleware);
