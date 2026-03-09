CREATE TABLE "public_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "platform_role" NOT NULL,
	"token_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"revoked_at" timestamp,
	"accepted_user_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public_invite" ADD CONSTRAINT "public_invite_accepted_user_id_user_id_fk" FOREIGN KEY ("accepted_user_id") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_invite" ADD CONSTRAINT "public_invite_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "public_invite_email_idx" ON "public_invite" USING btree ("email");--> statement-breakpoint
CREATE INDEX "public_invite_status_idx" ON "public_invite" USING btree ("status");--> statement-breakpoint
CREATE INDEX "public_invite_expires_at_idx" ON "public_invite" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "public_invite_created_by_idx" ON "public_invite" USING btree ("created_by");--> statement-breakpoint
CREATE UNIQUE INDEX "public_invite_token_hash_uidx" ON "public_invite" USING btree ("token_hash");