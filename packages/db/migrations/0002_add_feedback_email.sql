-- Add email column to feedback table (schema had it; migration was missing)
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "email" text NOT NULL DEFAULT '';
