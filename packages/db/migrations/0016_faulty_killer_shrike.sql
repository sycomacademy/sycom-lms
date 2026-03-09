CREATE TABLE "cohort_lesson_settings" (
	"cohort_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"unlocks_at" timestamp,
	"due_date" timestamp,
	"updated_by" text,
	CONSTRAINT "cohort_lesson_settings_cohort_id_lesson_id_pk" PRIMARY KEY("cohort_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "cohort_section_settings" (
	"cohort_id" text NOT NULL,
	"section_id" text NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"unlocks_at" timestamp,
	"due_date" timestamp,
	"updated_by" text,
	CONSTRAINT "cohort_section_settings_cohort_id_section_id_pk" PRIMARY KEY("cohort_id","section_id")
);
--> statement-breakpoint
CREATE TABLE "course_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"cohort_id" text NOT NULL,
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_assignment_cohort_course_uniq" UNIQUE("cohort_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "lesson_progress_enrollment_lesson_uniq" UNIQUE("enrollment_id","lesson_id")
);
--> statement-breakpoint
DROP TABLE "cohort_course" CASCADE;--> statement-breakpoint
DROP TABLE "cohort_lesson_due_date" CASCADE;--> statement-breakpoint
DROP TABLE "cohort_section_due_date" CASCADE;--> statement-breakpoint
DROP TABLE "lesson_completion" CASCADE;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "source" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollment" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "cohort_lesson_settings" ADD CONSTRAINT "cohort_lesson_settings_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "auth"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_lesson_settings" ADD CONSTRAINT "cohort_lesson_settings_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_lesson_settings" ADD CONSTRAINT "cohort_lesson_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_section_settings" ADD CONSTRAINT "cohort_section_settings_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "auth"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_section_settings" ADD CONSTRAINT "cohort_section_settings_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_section_settings" ADD CONSTRAINT "cohort_section_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignment" ADD CONSTRAINT "course_assignment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignment" ADD CONSTRAINT "course_assignment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignment" ADD CONSTRAINT "course_assignment_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "auth"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_assignment" ADD CONSTRAINT "course_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cohort_lesson_settings_cohort_id_idx" ON "cohort_lesson_settings" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "cohort_section_settings_cohort_id_idx" ON "cohort_section_settings" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "course_assignment_course_id_idx" ON "course_assignment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_assignment_org_id_idx" ON "course_assignment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "course_assignment_cohort_id_idx" ON "course_assignment" USING btree ("cohort_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_enrollment_id_idx" ON "lesson_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_lesson_id_idx" ON "lesson_progress" USING btree ("lesson_id");