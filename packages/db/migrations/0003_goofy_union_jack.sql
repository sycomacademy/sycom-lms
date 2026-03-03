CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_team_id_cohort_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_team_id_cohort_id_fk";
--> statement-breakpoint
DROP TYPE "public"."organization_role";--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('org_owner', 'org_admin', 'org_auditor', 'org_teacher', 'org_student');--> statement-breakpoint
DROP TYPE "public"."platform_role";--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('platform_admin', 'content_creator', 'platform_student');--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_team_id" text;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_cohort_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teamMember_teamId_idx" ON "team_member" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "teamMember_userId_idx" ON "team_member" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "member" DROP COLUMN "team_id";