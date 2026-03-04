CREATE TABLE "scim_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"scim_token" text NOT NULL,
	"organization_id" text,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scim_provider_provider_id_unique" UNIQUE("provider_id"),
	CONSTRAINT "scim_provider_scim_token_unique" UNIQUE("scim_token")
);
--> statement-breakpoint
CREATE TABLE "sso_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"issuer" text NOT NULL,
	"domain" text NOT NULL,
	"oidc_config" text,
	"saml_config" text,
	"user_id" text,
	"provider_id" text NOT NULL,
	"organization_id" text,
	"domain_verified" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sso_provider_provider_id_unique" UNIQUE("provider_id")
);
--> statement-breakpoint
ALTER TABLE "sso_provider" ADD CONSTRAINT "sso_provider_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scimProvider_providerId_idx" ON "scim_provider" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "scimProvider_organizationId_idx" ON "scim_provider" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "ssoProvider_providerId_idx" ON "sso_provider" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "ssoProvider_domain_idx" ON "sso_provider" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "ssoProvider_organizationId_idx" ON "sso_provider" USING btree ("organization_id");