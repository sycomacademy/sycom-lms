ALTER TABLE "lesson_completion" DROP CONSTRAINT "lesson_completion_user_lesson_org_uniq";--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD COLUMN "enrollment_id" text;--> statement-breakpoint

WITH ranked_enrollments AS (
  SELECT
    lc."id" AS "lesson_completion_id",
    e."id" AS "enrollment_id",
    row_number() OVER (
      PARTITION BY lc."id"
      ORDER BY e."enrolled_at" ASC, e."id" ASC
    ) AS "rank"
  FROM "lesson_completion" lc
  INNER JOIN "lesson" l ON l."id" = lc."lesson_id"
  INNER JOIN "section" s ON s."id" = l."section_id"
  INNER JOIN "enrollment" e
    ON e."user_id" = lc."user_id"
   AND e."organization_id" = lc."organization_id"
   AND e."course_id" = s."course_id"
)
UPDATE "lesson_completion" lc
SET "enrollment_id" = ranked_enrollments."enrollment_id"
FROM ranked_enrollments
WHERE lc."id" = ranked_enrollments."lesson_completion_id"
  AND ranked_enrollments."rank" = 1;--> statement-breakpoint

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "lesson_completion"
    WHERE "enrollment_id" IS NULL
  ) THEN
    RAISE EXCEPTION 'Unable to backfill lesson_completion.enrollment_id for one or more rows';
  END IF;
END $$;--> statement-breakpoint

DROP INDEX "lesson_completion_user_id_idx";--> statement-breakpoint
DROP INDEX "lesson_completion_org_id_idx";--> statement-breakpoint
DROP INDEX "lesson_completion_user_org_idx";--> statement-breakpoint
ALTER TABLE "lesson_completion" DROP CONSTRAINT "lesson_completion_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "lesson_completion" DROP CONSTRAINT "lesson_completion_organization_id_organization_id_fk";--> statement-breakpoint
ALTER TABLE "lesson_completion" ALTER COLUMN "enrollment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_enrollment_lesson_uniq" UNIQUE("enrollment_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_completion_enrollment_id_idx" ON "lesson_completion" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "lesson_completion_enrollment_lesson_idx" ON "lesson_completion" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
ALTER TABLE "lesson_completion" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "lesson_completion" DROP COLUMN "organization_id";
