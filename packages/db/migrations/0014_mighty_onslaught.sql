ALTER TABLE "public_invite" DROP CONSTRAINT "public_invite_created_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "public_invite" ADD CONSTRAINT "public_invite_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;