import { TRPCError } from "@trpc/server";
import z from "zod";
import {
  getSignedUrl,
  removeAsset,
  signUploadParams,
} from "@/packages/storage/cloudinary";
import { deleteAsset, saveAsset } from "@/packages/storage/queries";
import {
  saveAssetSchema,
  signedUrlSchema,
  signUploadSchema,
  storageResourceTypeSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, router } from "../init";

export const storageRouter = router({
  signUpload: protectedProcedure
    .input(signUploadSchema)
    .mutation(async ({ input }) => {
      return signUploadParams(input.folder, input.ownerId);
    }),

  saveAsset: protectedProcedure
    .input(saveAssetSchema)
    .mutation(async ({ ctx, input }) => {
      return saveAsset({
        publicId: input.publicId,
        secureUrl: input.secureUrl,
        folder: input.folder,
        resourceType: input.resourceType,
        format: input.format,
        bytes: input.bytes,
        width: input.width,
        height: input.height,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        uploadedBy: ctx.session.user.id,
      });
    }),

  getSignedDownloadUrl: protectedProcedure
    .input(signedUrlSchema)
    .query(async ({ input }) => {
      const url = await getSignedUrl(input.assetId, input.expireIn, {
        download: input.download,
      });

      return {
        url,
        expiresIn: input.expireIn,
      };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        assetId: z.string().min(1),
        resourceType: storageResourceTypeSchema.optional(),
      })
    )
    .mutation(async ({ input }) => {
      await removeAsset(input.assetId, {
        resourceType: input.resourceType,
        invalidate: true,
      });

      const deleted = await deleteAsset(input.assetId);

      if (!deleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Asset record could not be deleted",
        });
      }

      return deleted;
    }),
});
