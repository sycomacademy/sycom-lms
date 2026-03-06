ALTER TABLE "enrollment" DROP CONSTRAINT "enrollment_user_course_uniq";--> statement-breakpoint
ALTER TABLE "lesson_completion" DROP CONSTRAINT "lesson_completion_user_lesson_uniq";--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD COLUMN "organization_id" text;--> statement-breakpoint
UPDATE "enrollment"
SET "organization_id" = COALESCE(
  (
    SELECT m."organization_id"
    FROM "auth"."member" m
    WHERE m."user_id" = "enrollment"."user_id"
    ORDER BY m."created_at" ASC
    LIMIT 1
  ),
  (
    SELECT o."id"
    FROM "auth"."organization" o
    WHERE o."slug" = 'platform'
    LIMIT 1
  ),
  (
    SELECT o."id"
    FROM "auth"."organization" o
    ORDER BY o."created_at" ASC
    LIMIT 1
  )
)
WHERE "organization_id" IS NULL;--> statement-breakpoint
UPDATE "lesson_completion"
SET "organization_id" = COALESCE(
  (
    SELECT m."organization_id"
    FROM "auth"."member" m
    WHERE m."user_id" = "lesson_completion"."user_id"
    ORDER BY m."created_at" ASC
    LIMIT 1
  ),
  (
    SELECT o."id"
    FROM "auth"."organization" o
    WHERE o."slug" = 'platform'
    LIMIT 1
  ),
  (
    SELECT o."id"
    FROM "auth"."organization" o
    ORDER BY o."created_at" ASC
    LIMIT 1
  )
)
WHERE "organization_id" IS NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_completion" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enrollment_org_id_idx" ON "enrollment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "lesson_completion_org_id_idx" ON "lesson_completion" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_course_org_uniq" UNIQUE("user_id","course_id","organization_id");--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_user_lesson_org_uniq" UNIQUE("user_id","lesson_id","organization_id");
