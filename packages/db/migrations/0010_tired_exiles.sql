ALTER TABLE "lesson" ALTER COLUMN "type" SET DEFAULT 'article';--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "settings" SET DEFAULT '{"useDeviceTimezone":true,"enableFacehash":true,"marketingEmails":true}'::jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "cohort_org_name_uidx" ON "auth"."cohort" USING btree ("organization_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "cohort_member_team_user_uidx" ON "auth"."cohort_member" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_org_user_uidx" ON "auth"."member" USING btree ("organization_id","user_id");--> statement-breakpoint
ALTER TABLE "lesson" DROP COLUMN "is_locked";