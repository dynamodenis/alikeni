CREATE TYPE "public"."album_batch_status" AS ENUM('pending', 'approved');--> statement-breakpoint
CREATE TYPE "public"."album_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TABLE "album_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"uploader_name" text NOT NULL,
	"by_owner" boolean DEFAULT false NOT NULL,
	"declared_count" integer NOT NULL,
	"prepared_count" integer DEFAULT 0 NOT NULL,
	"status" "album_batch_status" NOT NULL,
	"finished_at" timestamp with time zone,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_batches_count_positive" CHECK ("album_batches"."declared_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "album_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invitation_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"kind" "album_kind" NOT NULL,
	"key" text NOT NULL,
	"thumb_key" text,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"duration_sec" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "album_items_key_unique" UNIQUE("key"),
	CONSTRAINT "album_items_bytes_positive" CHECK ("album_items"."bytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"invitation_id" uuid PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"guest_uploads" boolean DEFAULT true NOT NULL,
	"downloads" boolean DEFAULT true NOT NULL,
	"pin_salt" text,
	"pin_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "album_batches" ADD CONSTRAINT "album_batches_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_items" ADD CONSTRAINT "album_items_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_items" ADD CONSTRAINT "album_items_batch_id_album_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."album_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "album_batches_invitation_idx" ON "album_batches" USING btree ("invitation_id","created_at");--> statement-breakpoint
CREATE INDEX "album_batches_pending_idx" ON "album_batches" USING btree ("created_at") WHERE "album_batches"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "album_items_invitation_idx" ON "album_items" USING btree ("invitation_id","created_at");--> statement-breakpoint
CREATE INDEX "album_items_batch_idx" ON "album_items" USING btree ("batch_id");