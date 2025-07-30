CREATE TABLE IF NOT EXISTS "role_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_role" text NOT NULL,
	"reason" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_applications" ADD CONSTRAINT "role_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action; 