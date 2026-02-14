-- Add email column with temporary default for existing rows
ALTER TABLE "report" ADD COLUMN "email" text;--> statement-breakpoint
-- Update existing rows to have a placeholder email (will get real email from user relation)
UPDATE "report" SET "email" = COALESCE((SELECT "email" FROM "auth"."user" WHERE "auth"."user"."id" = "report"."user_id"), 'unknown@example.com') WHERE "email" IS NULL;--> statement-breakpoint
-- Now make it NOT NULL
ALTER TABLE "report" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "image_url" text;