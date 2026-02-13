import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { treeifyError, ZodError } from "zod";
import { createLoggerWithContext } from "@/packages/utils/logger";
import type { Context } from "./context";

const trpcLogger = createLoggerWithContext("trpc:procedure");

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

/** Logs every procedure call: path, type, caller, and duration. */
const loggingMiddleware = t.middleware(async ({ next, path, type, ctx }) => {
  const start = performance.now();
  const userId = ctx.session?.user?.id ?? "anonymous";

  const result = await next();

  const durationMs = Math.round(performance.now() - start);
  const ok = result.ok;

  trpcLogger.debug(`${type} ${path}`, {
    path,
    type,
    userId,
    ok,
    durationMs,
  });

  return result;
});

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

export const publicProcedure = t.procedure.use(loggingMiddleware);

export const protectedProcedure = t.procedure
  .use(loggingMiddleware)
  .use(protectedMiddleware);
