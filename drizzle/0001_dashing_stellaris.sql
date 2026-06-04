CREATE TABLE "chat_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"modelId" text NOT NULL,
	"inputTokens" integer DEFAULT 0 NOT NULL,
	"outputTokens" integer DEFAULT 0 NOT NULL,
	"totalTokens" integer DEFAULT 0 NOT NULL,
	"cacheReadTokens" integer DEFAULT 0 NOT NULL,
	"cacheWriteTokens" integer DEFAULT 0 NOT NULL,
	"reasoningTokens" integer DEFAULT 0 NOT NULL,
	"finishReason" text,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_usage" ADD CONSTRAINT "chat_usage_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_usage_userId_idx" ON "chat_usage" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "chat_usage_userId_createdAt_idx" ON "chat_usage" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "chat_usage_modelId_idx" ON "chat_usage" USING btree ("modelId");