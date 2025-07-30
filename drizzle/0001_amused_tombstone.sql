CREATE TABLE IF NOT EXISTS "group_payment_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_payment_id" uuid NOT NULL,
	"contributor_id" uuid NOT NULL,
	"contributor_email" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_tier_id" uuid NOT NULL,
	"total_quantity" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"amount_per_person" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"stripe_session_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_payment_contributions" ADD CONSTRAINT "group_payment_contributions_group_payment_id_group_payments_id_fk" FOREIGN KEY ("group_payment_id") REFERENCES "group_payments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_payment_contributions" ADD CONSTRAINT "group_payment_contributions_contributor_id_users_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_payments" ADD CONSTRAINT "group_payments_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_payments" ADD CONSTRAINT "group_payments_ticket_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("ticket_tier_id") REFERENCES "ticket_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
