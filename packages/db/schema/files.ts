import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "@/packages/db/schema/auth";
import { createdAt, updatedAt } from "@/packages/db/schema/helper";

// File categories with their constraints
export const FILE_CATEGORIES = {
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  document: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  attachment: {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: null, // Any of the above types + audio/*
  },
} as const;

export type FileCategory = keyof typeof FILE_CATEGORIES;
export type FileVisibility = "public" | "private";
export type UploadStatus =
  | "pending"
  | "uploading"
  | "completed"
  | "failed"
  | "expired";

export interface FileMetadata {
  altText?: string;
  duration?: number; // For videos, in seconds
  width?: number;
  height?: number;
  [key: string]: unknown;
}

/**
 * Files table - stores metadata for all uploaded files
 */
export const files = pgTable(
  "files",
  {
    id: text("id").primaryKey(), // fil_xxx

    // Ownership
    scope: text("scope").notNull(), // 'user' | 'org'
    scopeId: text("scope_id").notNull(), // usr_xxx | org_xxx
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Entity relationship
    entityType: text("entity_type").notNull(), // 'profile', 'course', 'lesson'
    entityId: text("entity_id").notNull(), // prf_xxx, crs_xxx

    // Category
    category: text("category").notNull(), // 'avatar', 'video', 'document', etc.

    // File info
    filename: text("filename").notNull(), // Original filename
    contentType: text("content_type").notNull(), // MIME type
    size: bigint("size", { mode: "number" }).notNull(), // Bytes

    // Storage
    storageProvider: text("storage_provider").notNull().default("vercel-blob"),
    storageKey: text("storage_key").notNull(), // Path/key in storage
    url: text("url").notNull(), // Public URL

    // Access control
    visibility: text("visibility").notNull().default("public"),

    // Metadata
    metadata: jsonb("metadata").$type<FileMetadata>().default(sql`'{}'::jsonb`),

    // Timestamps
    createdAt,
    updatedAt,
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("idx_files_entity").on(table.entityType, table.entityId),
    index("idx_files_scope").on(table.scope, table.scopeId),
    index("idx_files_uploaded_by").on(table.uploadedBy),
    index("idx_files_category").on(table.category),
  ]
);

/**
 * Upload sessions - tracks pending uploads for the two-phase upload flow
 */
export const uploadSessions = pgTable(
  "upload_sessions",
  {
    id: text("id").primaryKey(), // ups_xxx

    // Session info
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),

    // Intended file info
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(),

    // Target location
    scope: text("scope").notNull(),
    scopeId: text("scope_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    category: text("category").notNull(),

    // Upload details
    storageKey: text("storage_key").notNull(), // Pre-computed path
    clientToken: text("client_token").notNull(), // Token for client upload

    // Result
    fileId: text("file_id").references(() => files.id),
    errorMessage: text("error_message"),

    // Timing
    expiresAt: timestamp("expires_at").notNull(),
    createdAt,
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("idx_upload_sessions_user").on(table.userId, table.status),
    index("idx_upload_sessions_expires").on(table.expiresAt),
  ]
);

// Relations
export const filesRelations = relations(files, ({ one }) => ({
  uploader: one(user, {
    fields: [files.uploadedBy],
    references: [user.id],
  }),
}));

export const uploadSessionsRelations = relations(uploadSessions, ({ one }) => ({
  user: one(user, {
    fields: [uploadSessions.userId],
    references: [user.id],
  }),
  file: one(files, {
    fields: [uploadSessions.fileId],
    references: [files.id],
  }),
}));
