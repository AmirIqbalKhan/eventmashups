CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"avatar" text,
	"bio" text,
	"interests" jsonb,
	"isOrganizer" boolean DEFAULT false NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	"stripeCustomerId" text,
	"stripeConnectAccountId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"address" text,
	"latitude" real,
	"longitude" real,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"organizerId" text NOT NULL,
	"isPublished" boolean DEFAULT false NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"maxAttendees" integer,
	"allowResale" boolean DEFAULT true NOT NULL,
	"allowSplitPayments" boolean DEFAULT false NOT NULL,
	"type" text DEFAULT 'in-person' NOT NULL,
	"joinLink" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ticketTiers" (
	"id" text PRIMARY KEY NOT NULL,
	"eventId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"soldQuantity" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"eventId" text NOT NULL,
	"ticketTierId" text NOT NULL,
	"buyerId" text NOT NULL,
	"currentOwnerId" text NOT NULL,
	"qrCode" text NOT NULL,
	"stripePaymentIntentId" text,
	"stripeSessionId" text,
	"status" text DEFAULT 'active' NOT NULL,
	"transferHistory" jsonb DEFAULT '[]' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ticketTransfers" (
	"id" text PRIMARY KEY NOT NULL,
	"fromUserId" text NOT NULL,
	"toUserId" text NOT NULL,
	"ticketId" text NOT NULL,
	"transferType" text NOT NULL,
	"transferPrice" integer,
	"stripeTransferId" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "userMatches" (
	"id" text PRIMARY KEY NOT NULL,
	"eventId" text NOT NULL,
	"user1Id" text NOT NULL,
	"user2Id" text NOT NULL,
	"matchScore" real NOT NULL,
	"isMatched" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "events_organizerId_idx" ON "events"("organizerId");
CREATE INDEX IF NOT EXISTS "events_category_idx" ON "events"("category");
CREATE INDEX IF NOT EXISTS "events_startDate_idx" ON "events"("startDate");
CREATE INDEX IF NOT EXISTS "ticketTiers_eventId_idx" ON "ticketTiers"("eventId");
CREATE INDEX IF NOT EXISTS "tickets_eventId_idx" ON "tickets"("eventId");
CREATE INDEX IF NOT EXISTS "tickets_currentOwnerId_idx" ON "tickets"("currentOwnerId");
CREATE INDEX IF NOT EXISTS "ticketTransfers_ticketId_idx" ON "ticketTransfers"("ticketId");
CREATE INDEX IF NOT EXISTS "userMatches_eventId_idx" ON "userMatches"("eventId"); 