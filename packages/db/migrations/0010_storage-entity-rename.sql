CREATE TYPE "public"."storage_entity_type" AS ENUM('user', 'organization', 'cohort', 'course', 'lesson', 'report', 'blog-post');--> statement-breakpoint
ALTER TABLE "storage"."media_asset" RENAME COLUMN "owner_id" TO "entity_id";--> statement-breakpoint
ALTER TABLE "storage"."media_asset" RENAME COLUMN "owner_type" TO "entity_type";--> statement-breakpoint
ALTER TABLE "storage"."media_asset" ALTER COLUMN "entity_type" TYPE "public"."storage_entity_type" USING "entity_type"::"public"."storage_entity_type";--> statement-breakpoint
ALTER INDEX "storage"."media_asset_ownerId_idx" RENAME TO "media_asset_entityId_idx";--> statement-breakpoint
CREATE INDEX "media_asset_entityType_entityId_idx" ON "storage"."media_asset" USING btree ("entity_type","entity_id");
