CREATE TYPE "public"."invitation_plan" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"invitation_id" uuid,
	"owner_id" text,
	"provider" text DEFAULT 'paystack' NOT NULL,
	"product" text DEFAULT 'invitation_premium' NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"provider_transaction_id" text,
	"channel" text,
	"failure_reason" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_reference_unique" UNIQUE("reference"),
	CONSTRAINT "orders_amount_positive" CHECK ("orders"."amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD COLUMN "plan" "invitation_plan" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_invitation_idx" ON "orders" USING btree ("invitation_id");--> statement-breakpoint
CREATE INDEX "orders_owner_idx" ON "orders" USING btree ("owner_id");