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
    ownerId: text("owner_id"), // polymorphic ref: user / course / organization
    ownerType: text("owner_type"), // "user" | "organization" | "course"
    createdAt,
    updatedAt,
  },
  (t) => [
    index("media_asset_publicId_idx").on(t.publicId),
    index("media_asset_ownerId_idx").on(t.ownerId),
  ]
);

export type MediaAsset = typeof mediaAsset.$inferSelect;
export type InsertMediaAsset = typeof mediaAsset.$inferInsert;
