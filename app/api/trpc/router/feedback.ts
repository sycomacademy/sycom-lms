import { submitFeedback, submitReport } from "@/packages/db/queries";
import { uploadBase64 } from "@/packages/storage/cloudinary";
import { saveAsset } from "@/packages/storage/queries";
import {
  submitFeedbackSchema,
  submitReportSchema,
} from "@/packages/utils/schema";
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
  submitReport: protectedProcedure
    .input(submitReportSchema)
    .mutation(async ({ ctx, input }) => {
      let imageUrl: string | null = null;

      if (input.imageBase64 && input.imageMimeType) {
        const uploadResult = await uploadBase64(
          input.imageBase64,
          "reports",
          ctx.session.user.id
        );

        await saveAsset({
          publicId: uploadResult.publicId,
          secureUrl: uploadResult.secureUrl,
          folder: uploadResult.folder,
          resourceType: uploadResult.resourceType,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
          width: uploadResult.width,
          height: uploadResult.height,
          entityId: ctx.session.user.id,
          entityType: "report",
          uploadedBy: ctx.session.user.id,
        });

        imageUrl = uploadResult.secureUrl;
      }

      return submitReport(ctx.db, {
        userId: ctx.session.user.id,
        email: ctx.session.user.email,
        type: input.type,
        subject: input.subject,
        description: input.description,
        imageUrl,
      });
    }),
});
