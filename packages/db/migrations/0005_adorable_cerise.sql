CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"image_url" text,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_instructor" (
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'secondary' NOT NULL,
	"added_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_instructor_course_id_user_id_pk" PRIMARY KEY("course_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	CONSTRAINT "enrollment_user_course_uniq" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"section_id" text NOT NULL,
	"title" text NOT NULL,
	"content" jsonb,
	"type" text DEFAULT 'text' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"estimated_duration" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_completion" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_completion_user_lesson_uniq" UNIQUE("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "pathway" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"image_url" text,
	"difficulty" text DEFAULT 'beginner' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pathway_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pathway_course" (
	"pathway_id" text NOT NULL,
	"course_id" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pathway_course_pathway_id_course_id_pk" PRIMARY KEY("pathway_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "section" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_instructor" ADD CONSTRAINT "course_instructor_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_section_id_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_completion" ADD CONSTRAINT "lesson_completion_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway" ADD CONSTRAINT "pathway_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_course" ADD CONSTRAINT "pathway_course_pathway_id_pathway_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathway"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_course" ADD CONSTRAINT "pathway_course_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "section" ADD CONSTRAINT "section_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_status_idx" ON "course" USING btree ("status");--> statement-breakpoint
CREATE INDEX "course_created_by_idx" ON "course" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "enrollment_user_id_idx" ON "enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "enrollment_course_id_idx" ON "enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lesson_section_id_idx" ON "lesson" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "lesson_completion_user_id_idx" ON "lesson_completion" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lesson_completion_lesson_id_idx" ON "lesson_completion" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "pathway_status_idx" ON "pathway" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pathway_created_by_idx" ON "pathway" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "section_course_id_idx" ON "section" USING btree ("course_id");