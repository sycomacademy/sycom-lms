-- Migration 0010 already created storage_entity_type and renamed media_asset columns.
-- This migration only adds the profile settings default.
ALTER TABLE "profile" ALTER COLUMN "settings" SET DEFAULT '{"useDeviceTimezone":true,"enableFacehash":true,"marketingEmails":true,"welcomeEmailSent":false}'::jsonb;