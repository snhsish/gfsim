-- Run this in Supabase SQL editor if auth tables already exist.
CREATE TABLE IF NOT EXISTS "gf_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"dateOfBirth" date NOT NULL,
	"nativeLanguage" text NOT NULL,
	"nationality" text NOT NULL,
	"isBisexual" boolean NOT NULL,
	"mbti" text,
	"zodiacSign" text NOT NULL,
	"maturityTier" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "gf_profile_userId_unique" UNIQUE("userId")
);

ALTER TABLE "gf_profile"
  ADD CONSTRAINT "gf_profile_userId_user_id_fk"
  FOREIGN KEY ("userId") REFERENCES "public"."user"("id")
  ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "gf_profile_userId_idx" ON "gf_profile" USING btree ("userId");
