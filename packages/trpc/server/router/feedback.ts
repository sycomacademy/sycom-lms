import { submitFeedback } from "@/packages/db/queries";
import { submitFeedbackSchema } from "@/packages/types/profile";
import { protectedProcedure, router } from "../init";

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      return submitFeedback(db, {
        userId: session.user.id,
        email: session.user.email,
        message: input.message,
      });
    }),
});
