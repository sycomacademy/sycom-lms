import { z } from "zod";

// Input schemas
export const requestUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string(),
  size: z.number().positive(),
  entityType: z.string(),
  entityId: z.string(),
  category: z.enum(["video", "document", "image", "avatar", "attachment"]),
});

export const confirmUploadSchema = z.object({
  sessionId: z.string(),
  url: z.url(),
  visibility: z.enum(["public", "private"]).default("public"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const listFilesSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  category: z.string().optional(),
});

export const fileIdSchema = z.object({
  fileId: z.string(),
});
