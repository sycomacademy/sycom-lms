import { z } from "zod";
import { feedback } from "@/packages/db/schema/feedback";
import { protectedProcedure, router } from "../init";

const submitFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Feedback is required")
    .max(2000, "Feedback must be less than 2000 characters"),
});

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      const [row] = await db
        .insert(feedback)
        .values({
          message: input.message,
          userId: session.user.id,
        })
        .returning();
      return row;
    }),
});
