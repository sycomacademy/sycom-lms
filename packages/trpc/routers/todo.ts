import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/packages/db";
import { todo } from "@/packages/db/schema/todo";

import { publicProcedure, router } from "@/packages/trpc/core/init";

export const todoRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ input }) => {
      return await db.insert(todo).values({
        text: input.text,
      });
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ input }) => {
      return await db
        .update(todo)
        .set({ completed: input.completed })
        .where(eq(todo.id, input.id));
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.delete(todo).where(eq(todo.id, input.id));
    }),
});
