ALTER TABLE "rsvps" ADD COLUMN "owner_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rsvps" ADD COLUMN "reminder_sent_at" timestamp with time zone;--> statement-breakpoint
-- RSVPs from before owner emails existed are not announced after the fact.
UPDATE "rsvps" SET "owner_notified_at" = "created_at";--> statement-breakpoint
CREATE INDEX "rsvps_owner_pending_idx" ON "rsvps" USING btree ("created_at") WHERE "rsvps"."owner_notified_at" IS NULL;
