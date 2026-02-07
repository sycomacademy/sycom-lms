CREATE TABLE "quiz_question" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"question_text" text NOT NULL,
	"type" text NOT NULL,
	"options" jsonb NOT NULL,
	"hint" text,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"time_spent" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_progress_user_lesson" UNIQUE("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"question_id" text NOT NULL,
	"selected_answers" jsonb NOT NULL,
	"is_correct" boolean NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_lesson_id_course_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_question_id_quiz_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_question"("id") ON DELETE cascade ON UPDATE no action;