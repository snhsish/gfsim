-- Run this in Supabase SQL editor if drizzle-kit push fails.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "dateOfBirth" date;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "mbti" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "zodiacSign" text;
