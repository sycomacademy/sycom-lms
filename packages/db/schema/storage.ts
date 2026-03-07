import { index, integer, pgEnum, pgSchema, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../helper";
import { user } from "./auth";

export const storageFolderEnum = pgEnum("storage_folder", [
  "avatars",
  "thumbnails",
  "course-content",
  "demo",
  "reports",
]);
export type StorageFolder = (typeof storageFolderEnum.enumValues)[number];

export const storageResourceTypeEnum = pgEnum("storage_resource_type", [
  "image",
  "video",
  "file",
  "audio",
]);
export type StorageResourceType =
  (typeof storageResourceTypeEnum.enumValues)[number];

export const storageEntityTypeEnum = pgEnum("storage_entity_type", [
  "user",
  "organization",
  "cohort",
  "course",
  "lesson",
  "report",
  "blog-post",
]);
export type StorageEntityType =
  (typeof storageEntityTypeEnum.enumValues)[number];

const storageSchema = pgSchema("storage");

export const mediaAsset = storageSchema.table(
  "media_asset",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    publicId: text("public_id").notNull().unique(), // sycom/avatars/user-123/uuid
    secureUrl: text("secure_url").notNull(),
    folder: storageFolderEnum("folder").notNull(),
    resourceType: storageResourceTypeEnum("resource_type").notNull(),
    format: text("format"), // jpg, mp4, pdf
    bytes: integer("bytes"),
    width: integer("width"),
    height: integer("height"),
    uploadedBy: text("uploaded_by").references(() => user.id),
    entityId: text("entity_id"), // polymorphic resource reference, e.g. user / cohort / course / lesson / report
    entityType: storageEntityTypeEnum("entity_type"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("media_asset_publicId_idx").on(t.publicId),
    index("media_asset_entityId_idx").on(t.entityId),
    index("media_asset_entityType_entityId_idx").on(t.entityType, t.entityId),
  ]
);

export type MediaAsset = typeof mediaAsset.$inferSelect;
export type InsertMediaAsset = typeof mediaAsset.$inferInsert;
