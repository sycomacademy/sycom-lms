import { submitFeedback } from "@/packages/db/queries";
import { submitFeedbackSchema } from "@/packages/utils/schema";
import { protectedProcedure, router } from "../init";

export const feedbackRouter = router({
  submit: protectedProcedure
    .input(submitFeedbackSchema)
    .mutation(async ({ ctx, input }) => {
      return submitFeedback(ctx.db, {
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        message: input.message,
      });
    }),
});
