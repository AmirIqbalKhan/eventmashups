CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"organizer_id" uuid,
	"is_published" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"max_attendees" integer,
	"allow_resale" boolean DEFAULT true,
	"allow_split_payments" boolean DEFAULT false,
	"type" text DEFAULT 'in-person' NOT NULL,
	"join_link" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_role" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"quantity" integer NOT NULL,
	"sold_quantity" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ticket_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"transfer_type" text NOT NULL,
	"transfer_price" numeric(10, 2),
	"stripe_transfer_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"ticket_tier_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"current_owner_id" uuid NOT NULL,
	"qr_code" text NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_session_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"transfer_history" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user1_id" uuid NOT NULL,
	"user2_id" uuid NOT NULL,
	"match_score" integer,
	"is_matched" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"avatar" text,
	"bio" text,
	"interests" jsonb,
	"is_organizer" boolean DEFAULT false,
	"is_admin" boolean DEFAULT false,
	"stripe_customer_id" text,
	"stripe_connect_account_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ticket_transfers" ADD CONSTRAINT "ticket_transfers_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_tier_id_ticket_tiers_id_fk" FOREIGN KEY ("ticket_tier_id") REFERENCES "ticket_tiers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_current_owner_id_users_id_fk" FOREIGN KEY ("current_owner_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_matches" ADD CONSTRAINT "user_matches_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_matches" ADD CONSTRAINT "user_matches_user1_id_users_id_fk" FOREIGN KEY ("user1_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_matches" ADD CONSTRAINT "user_matches_user2_id_users_id_fk" FOREIGN KEY ("user2_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
