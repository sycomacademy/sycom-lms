CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"scope_id" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"category" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"storage_provider" text DEFAULT 'vercel-blob' NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "upload_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"scope" text NOT NULL,
	"scope_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"category" text NOT NULL,
	"storage_key" text NOT NULL,
	"client_token" text NOT NULL,
	"file_id" text,
	"error_message" text,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_files_entity" ON "files" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_files_scope" ON "files" USING btree ("scope","scope_id");--> statement-breakpoint
CREATE INDEX "idx_files_uploaded_by" ON "files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_files_category" ON "files" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_upload_sessions_user" ON "upload_sessions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_upload_sessions_expires" ON "upload_sessions" USING btree ("expires_at");