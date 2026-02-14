import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import {
  FILE_CATEGORIES,
  type FileCategory,
  files,
  uploadSessions,
} from "@/packages/db/schema/files";
import { getStorageProvider } from "@/packages/storage";
import {
  buildStorageKey,
  generateId,
  validateFile,
} from "@/packages/storage/utils";
import { protectedProcedure, router } from "../init";

// Input schemas
const requestUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z.number().positive(),
  entityType: z.string(),
  entityId: z.string(),
  category: z.enum(["video", "document", "image", "avatar", "attachment"]),
});

const confirmUploadSchema = z.object({
  sessionId: z.string(),
  url: z.url(),
  visibility: z.enum(["public", "private"]).default("public"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const listFilesSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  category: z.string().optional(),
});

const fileIdSchema = z.object({
  fileId: z.string(),
});

/**
 * Resolve scope from entity type and ID
 * For now, all files are scoped to the user
 */
function resolveScope(userId: string, _entityType: string, _entityId: string) {
  // In a full implementation, you might check if the entity belongs to an org
  // For now, scope everything to the user
  return {
    type: "user" as const,
    id: userId,
  };
}

export const fileRouter = router({
  /**
   * Step 1: Request an upload session
   * Returns a session ID and upload URL for direct browser upload
   */
  requestUpload: protectedProcedure
    .input(requestUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Validate file against category constraints
      const validation = validateFile(
        input.category as FileCategory,
        input.contentType,
        input.size
      );

      if (!validation.valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.error,
        });
      }

      // Generate IDs
      const sessionId = generateId("ups");
      const fileId = generateId("fil");
      const clientToken = crypto.randomUUID();

      // Resolve scope
      const scope = resolveScope(userId, input.entityType, input.entityId);

      // Build storage key
      const storageKey = buildStorageKey({
        scope: scope.type,
        scopeId: scope.id,
        category: input.category,
        entityType: input.entityType,
        entityId: input.entityId,
        fileId,
        filename: input.filename,
      });

      // Session expires in 30 minutes
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Create upload session
      await ctx.db.insert(uploadSessions).values({
        id: sessionId,
        userId,
        status: "pending",
        filename: input.filename,
        contentType: input.contentType,
        size: input.size,
        scope: scope.type,
        scopeId: scope.id,
        entityType: input.entityType,
        entityId: input.entityId,
        category: input.category,
        storageKey,
        clientToken,
        expiresAt,
      });

      return {
        sessionId,
        clientToken,
        storageKey,
        expiresAt,
        maxSize: FILE_CATEGORIES[input.category as FileCategory].maxSize,
      };
    }),

  /**
   * Step 2: Confirm upload completed
   * Called after the file has been uploaded to storage
   */
  confirmUpload: protectedProcedure
    .input(confirmUploadSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Find the upload session (status should be "uploading" after token generation)
      const session = await ctx.db.query.uploadSessions.findFirst({
        where: and(
          eq(uploadSessions.id, input.sessionId),
          eq(uploadSessions.userId, userId)
        ),
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload session not found",
        });
      }

      // Check session status
      if (session.status === "completed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Upload session already completed",
        });
      }

      if (session.status !== "pending" && session.status !== "uploading") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invalid session status: ${session.status}`,
        });
      }

      // Check if session expired
      if (new Date() > session.expiresAt) {
        await ctx.db
          .update(uploadSessions)
          .set({ status: "expired" })
          .where(eq(uploadSessions.id, session.id));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Upload session expired",
        });
      }

      // Verify file exists in storage
      const storage = getStorageProvider();
      const exists = await storage.exists(input.url);

      if (!exists) {
        await ctx.db
          .update(uploadSessions)
          .set({
            status: "failed",
            errorMessage: "File not found in storage",
          })
          .where(eq(uploadSessions.id, session.id));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File not found in storage. Upload may have failed.",
        });
      }

      // Create file record
      const fileId = generateId("fil");

      const [file] = await ctx.db
        .insert(files)
        .values({
          id: fileId,
          scope: session.scope,
          scopeId: session.scopeId,
          uploadedBy: userId,
          entityType: session.entityType,
          entityId: session.entityId,
          category: session.category,
          filename: session.filename,
          contentType: session.contentType,
          size: session.size,
          storageProvider: storage.name,
          storageKey: session.storageKey,
          url: input.url,
          visibility: input.visibility,
          metadata: (input.metadata as Record<string, unknown>) ?? {},
        })
        .returning();

      // Mark session as completed
      await ctx.db
        .update(uploadSessions)
        .set({
          status: "completed",
          fileId,
          completedAt: new Date(),
        })
        .where(eq(uploadSessions.id, session.id));

      return file;
    }),

  /**
   * List files for an entity
   */
  listByEntity: protectedProcedure
    .input(listFilesSchema)
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(files.entityType, input.entityType),
        eq(files.entityId, input.entityId),
        isNull(files.deletedAt),
      ];

      if (input.category) {
        conditions.push(eq(files.category, input.category));
      }

      return ctx.db.query.files.findMany({
        where: and(...conditions),
        orderBy: (files, { desc }) => [desc(files.createdAt)],
      });
    }),

  /**
   * Get a single file by ID
   */
  getById: protectedProcedure
    .input(fileIdSchema)
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.query.files.findFirst({
        where: and(eq(files.id, input.fileId), isNull(files.deletedAt)),
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      return file;
    }),

  /**
   * Get a signed URL for private file access
   */
  getSignedUrl: protectedProcedure
    .input(fileIdSchema)
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.query.files.findFirst({
        where: eq(files.id, input.fileId),
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // TODO: Add access control checks here

      const storage = getStorageProvider();
      const signedUrl = await storage.getSignedUrl(file.url, 3600); // 1 hour

      return { url: signedUrl, expiresIn: 3600 };
    }),

  /**
   * Delete a file (soft delete)
   */
  delete: protectedProcedure
    .input(fileIdSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const file = await ctx.db.query.files.findFirst({
        where: and(eq(files.id, input.fileId), isNull(files.deletedAt)),
      });

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      // Check ownership
      if (file.uploadedBy !== userId) {
        // TODO: Add role-based access for admins
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this file",
        });
      }

      // Soft delete
      await ctx.db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(eq(files.id, input.fileId));

      // Optionally delete from storage (uncomment for hard delete)
      // const storage = getStorageProvider();
      // await storage.delete(file.url);

      return { success: true };
    }),
});
