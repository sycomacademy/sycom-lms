CREATE SCHEMA IF NOT EXISTS "storage";--> statement-breakpoint
CREATE TYPE "public"."storage_folder" AS ENUM('avatars', 'thumbnails', 'course-content', 'demo');--> statement-breakpoint
CREATE TYPE "public"."storage_resource_type" AS ENUM('image', 'video', 'file', 'audio');--> statement-breakpoint
CREATE TABLE "storage"."media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"secure_url" text NOT NULL,
	"folder" "storage_folder" NOT NULL,
	"resource_type" "storage_resource_type" NOT NULL,
	"format" text,
	"bytes" integer,
	"width" integer,
	"height" integer,
	"uploaded_by" text,
	"owner_id" text,
	"owner_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_asset_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "storage"."media_asset" ADD CONSTRAINT "media_asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_asset_publicId_idx" ON "storage"."media_asset" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "media_asset_ownerId_idx" ON "storage"."media_asset" USING btree ("owner_id");
