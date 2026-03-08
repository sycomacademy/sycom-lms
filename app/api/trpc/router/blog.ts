import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  getPublicBlogPostBySlug,
  hasBlogAccessForEditing,
  listInstructorBlogPosts,
  listPublicBlogPosts,
  updateBlogPost,
} from "@/packages/db/queries";
import {
  createBlogPostSchema,
  deleteBlogPostSchema,
  listBlogPostsSchema,
  listPublicBlogPostsSchema,
  updateBlogPostSchema,
} from "@/packages/utils/schema";
import { protectedProcedure, publicProcedure, router, t } from "../init";

const instructorMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const role = ctx.session.user.role;
  if (role !== "content_creator" && role !== "platform_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Content creator or platform admin access required",
    });
  }

  return next({ ctx: { ...ctx, session: ctx.session } });
});

const instructorProcedure = protectedProcedure.use(instructorMiddleware);

async function assertInstructorBlogAccess(
  db: Parameters<typeof hasBlogAccessForEditing>[0],
  postId: string,
  userId: string,
  userRole: string | null
) {
  const result = await hasBlogAccessForEditing(db, {
    postId,
    userId,
    userRole,
  });

  if (!result) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have access to this blog post",
    });
  }

  return result;
}

export const blogRouter = router({
  listPublic: publicProcedure
    .input(listPublicBlogPostsSchema)
    .query(async ({ ctx, input }) => {
      const result = await listPublicBlogPosts(ctx.db, input);
      return { ...result, limit: input.limit, offset: input.offset };
    }),

  getPublicBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return getPublicBlogPostBySlug(ctx.db, input);
    }),

  list: instructorProcedure
    .input(listBlogPostsSchema)
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const result = await listInstructorBlogPosts(db, {
        ...input,
        userId: session.user.id,
        isAdmin: session.user.role === "platform_admin",
      });

      return { ...result, limit: input.limit, offset: input.offset };
    }),

  getById: instructorProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      await assertInstructorBlogAccess(
        db,
        input.postId,
        session.user.id,
        session.user.role ?? null
      );

      const post = await getBlogPostById(db, input);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }

      return post;
    }),

  create: instructorProcedure
    .input(createBlogPostSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await createBlogPost(ctx.db, {
        ...input,
        createdBy: ctx.session.user.id,
      });

      if (result.conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A blog post with this slug already exists",
        });
      }

      return result.post;
    }),

  update: instructorProcedure
    .input(updateBlogPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { postId, ...data } = input;

      await assertInstructorBlogAccess(
        db,
        postId,
        session.user.id,
        session.user.role ?? null
      );

      const result = await updateBlogPost(db, { postId, data });

      if (result.conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A blog post with this slug already exists",
        });
      }

      if ("noFields" in result && result.noFields) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      if ("notFound" in result && result.notFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }

      return result.post;
    }),

  delete: instructorProcedure
    .input(deleteBlogPostSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      await assertInstructorBlogAccess(
        db,
        input.postId,
        session.user.id,
        session.user.role ?? null
      );

      const deleted = await deleteBlogPost(db, input);
      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blog post not found",
        });
      }

      return { success: true };
    }),
});
