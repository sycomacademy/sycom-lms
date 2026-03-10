-- Step 1: Add columns as nullable first
ALTER TABLE "enrollment" ADD COLUMN IF NOT EXISTS "organization_id" text;
--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN IF NOT EXISTS "cohort_id" text;
--> statement-breakpoint

-- Step 2: Populate organization_id and cohort_id for existing enrollments
-- First, try to populate from course_assignment if there's a matching assignment
UPDATE "enrollment" e
SET 
  "organization_id" = ca."organization_id",
  "cohort_id" = ca."cohort_id"
FROM "course_assignment" ca
WHERE e."course_id" = ca."course_id"
  AND e."organization_id" IS NULL;

--> statement-breakpoint

-- Step 3: For any remaining enrollments without organization/cohort, use the platform org and its default cohort
-- This requires knowing the platform org ID - you may need to adjust this
UPDATE "enrollment" e
SET 
  "organization_id" = (SELECT "id" FROM "auth"."organization" WHERE "slug" = 'sycom' LIMIT 1),
  "cohort_id" = (SELECT c."id" FROM "auth"."cohort" c 
                 INNER JOIN "auth"."organization" o ON c."organization_id" = o."id"
                 WHERE o."slug" = 'sycom' AND c."name" = 'Public' LIMIT 1)
WHERE e."organization_id" IS NULL;

--> statement-breakpoint

-- Step 4: Make columns NOT NULL after populating
ALTER TABLE "enrollment" ALTER COLUMN "organization_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "enrollment" ALTER COLUMN "cohort_id" SET NOT NULL;
--> statement-breakpoint

-- Step 5: Add foreign key constraints (idempotent - skip if already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollment_organization_id_organization_id_fk'
  ) THEN
    ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_organization_id_organization_id_fk" 
      FOREIGN KEY ("organization_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollment_cohort_id_cohort_id_fk'
  ) THEN
    ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_cohort_id_cohort_id_fk" 
      FOREIGN KEY ("cohort_id") REFERENCES "auth"."cohort"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint

-- Step 6: Add indexes
CREATE INDEX IF NOT EXISTS "enrollment_org_id_idx" ON "enrollment" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollment_cohort_id_idx" ON "enrollment" USING btree ("cohort_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollment_user_org_idx" ON "enrollment" USING btree ("user_id","organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "enrollment_user_course_cohort_idx" ON "enrollment" USING btree ("user_id","course_id","cohort_id");
--> statement-breakpoint

-- Step 7: Update the unique constraint to include cohort_id
ALTER TABLE "enrollment" DROP CONSTRAINT IF EXISTS "enrollment_user_course_uniq";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "enrollment_user_course_cohort_uniq" ON "enrollment" USING btree ("user_id","course_id","cohort_id");
