ALTER TABLE "storage"."media_asset" DROP CONSTRAINT "media_asset_uploaded_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "storage"."media_asset" ADD CONSTRAINT "media_asset_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;