import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  addToWishlist,
  createEnrollment,
  deleteEnrollment,
  getEnrollment,
  getEnrollmentsByUserId,
  getWishlistByUserId,
  getWishlistItem,
  removeFromWishlist,
  syncEnrollmentProgress,
} from "@/packages/db/queries/enrollment";
import { protectedProcedure, router } from "@/packages/trpc/core/init";

export const enrollmentRouter = router({
  /** List current user's enrollments with course data */
  list: protectedProcedure.query(async ({ ctx }) => {
    return getEnrollmentsByUserId(ctx.session.user.id);
  }),

  /** Check if enrolled in a specific course (syncs progress from lesson_progress) */
  isEnrolled: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const record = await getEnrollment(ctx.session.user.id, input.courseId);
      if (record) {
        await syncEnrollmentProgress(ctx.session.user.id, input.courseId);
        return {
          enrolled: true,
          enrollment: await getEnrollment(ctx.session.user.id, input.courseId),
        };
      }
      return { enrolled: false, enrollment: null };
    }),

  /** Enroll in a course */
  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getEnrollment(ctx.session.user.id, input.courseId);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already enrolled in this course",
        });
      }
      return createEnrollment({
        id: nanoid(),
        userId: ctx.session.user.id,
        courseId: input.courseId,
      });
    }),

  /** Unenroll from a course */
  unenroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await deleteEnrollment(ctx.session.user.id, input.courseId);
      return { success: true };
    }),

  // ─── Wishlist ──────────────────────────────────────────

  /** List current user's wishlist with course data */
  wishlist: protectedProcedure.query(async ({ ctx }) => {
    return getWishlistByUserId(ctx.session.user.id);
  }),

  /** Check if course is in wishlist */
  isWishlisted: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const record = await getWishlistItem(ctx.session.user.id, input.courseId);
      return { wishlisted: !!record };
    }),

  /** Add to wishlist */
  addToWishlist: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getWishlistItem(
        ctx.session.user.id,
        input.courseId
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already in wishlist",
        });
      }
      return addToWishlist({
        id: nanoid(),
        userId: ctx.session.user.id,
        courseId: input.courseId,
      });
    }),

  /** Remove from wishlist */
  removeFromWishlist: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromWishlist(ctx.session.user.id, input.courseId);
      return { success: true };
    }),
});
