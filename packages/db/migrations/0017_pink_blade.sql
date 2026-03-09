CREATE TABLE "org_course_entitlement" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"course_id" text NOT NULL,
	"max_seats" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"granted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_course_entitlement_org_course_uniq" UNIQUE("organization_id","course_id")
);
--> statement-breakpoint
ALTER TABLE "org_course_entitlement" ADD CONSTRAINT "org_course_entitlement_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_course_entitlement" ADD CONSTRAINT "org_course_entitlement_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_course_entitlement" ADD CONSTRAINT "org_course_entitlement_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "org_course_entitlement_org_id_idx" ON "org_course_entitlement" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_course_entitlement_course_id_idx" ON "org_course_entitlement" USING btree ("course_id");