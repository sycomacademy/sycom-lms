CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'auditor', 'teacher', 'student');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('platform_admin', 'content_creator', 'member');--> statement-breakpoint
ALTER TABLE "team" RENAME TO "cohort";--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "cohort" DROP CONSTRAINT "team_organization_id_organization_id_fk";
--> statement-breakpoint
DROP INDEX "team_organizationId_idx";--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_team_id_cohort_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."cohort"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_team_id_cohort_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."cohort"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort" ADD CONSTRAINT "cohort_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cohort_organizationId_idx" ON "cohort" USING btree ("organization_id");