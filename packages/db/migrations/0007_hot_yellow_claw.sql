ALTER TABLE "course" ADD COLUMN "summary" jsonb;--> statement-breakpoint
ALTER TABLE "lesson" ADD COLUMN "is_locked" boolean DEFAULT false NOT NULL;