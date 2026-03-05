CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"order" integer DEFAULT 0,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_category" (
	"course_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "course_category_course_id_category_id_pk" PRIMARY KEY("course_id","category_id")
);
--> statement-breakpoint
ALTER TABLE "course_category" ADD CONSTRAINT "course_category_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_category" ADD CONSTRAINT "course_category_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_category_category_id_idx" ON "course_category" USING btree ("category_id");