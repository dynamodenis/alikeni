CREATE TABLE "page_view_visitors" (
	"invitation_id" uuid NOT NULL,
	"day" date NOT NULL,
	"visitor_hash" text NOT NULL,
	CONSTRAINT "page_view_visitors_invitation_id_day_visitor_hash_pk" PRIMARY KEY("invitation_id","day","visitor_hash")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_hits" (
	"key" text NOT NULL,
	"at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_view_visitors" ADD CONSTRAINT "page_view_visitors_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_view_visitors_day_idx" ON "page_view_visitors" USING btree ("day");--> statement-breakpoint
CREATE INDEX "rate_limit_hits_key_at_idx" ON "rate_limit_hits" USING btree ("key","at");--> statement-breakpoint
CREATE INDEX "rate_limit_hits_at_idx" ON "rate_limit_hits" USING btree ("at");