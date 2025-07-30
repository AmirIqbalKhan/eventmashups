import { pgTable, text, timestamp, integer, boolean, uuid, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  interests: jsonb('interests').$type<string[]>(),
  isOrganizer: boolean('is_organizer').default(false),
  isAdmin: boolean('is_admin').default(false),
  stripeCustomerId: text('stripe_customer_id'),
  stripeConnectAccountId: text('stripe_connect_account_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Events table
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image: text('image'),
  category: text('category').notNull(),
  location: text('location').notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  organizerId: uuid('organizer_id').references(() => users.id),
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  maxAttendees: integer('max_attendees'),
  allowResale: boolean('allow_resale').default(true),
  allowSplitPayments: boolean('allow_split_payments').default(false),
  type: text('type').notNull().default('in-person'), // 'in-person' or 'virtual'
  joinLink: text('join_link'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Ticket tiers table
export const ticketTiers = pgTable('ticket_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  soldQuantity: integer('sold_quantity').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tickets table
export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  ticketTierId: uuid('ticket_tier_id').references(() => ticketTiers.id).notNull(),
  buyerId: uuid('buyer_id').references(() => users.id).notNull(),
  currentOwnerId: uuid('current_owner_id').references(() => users.id).notNull(),
  qrCode: text('qr_code').notNull().unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeSessionId: text('stripe_session_id'),
  status: text('status').notNull().default('active'), // active, transferred, refunded
  transferHistory: jsonb('transfer_history').$type<Array<{
    fromUserId: string;
    toUserId: string;
    transferredAt: string;
  }>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Ticket transfers table
export const ticketTransfers = pgTable('ticket_transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id').references(() => tickets.id).notNull(),
  fromUserId: uuid('from_user_id').references(() => users.id).notNull(),
  toUserId: uuid('to_user_id').references(() => users.id).notNull(),
  transferType: text('transfer_type').notNull(), // internal, external
  transferPrice: decimal('transfer_price', { precision: 10, scale: 2 }),
  stripeTransferId: text('stripe_transfer_id'),
  status: text('status').notNull().default('pending'), // pending, completed, cancelled
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Role applications table
export const roleApplications = pgTable('role_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  requestedRole: text('requested_role').notNull(), // 'admin' or 'organizer'
  reason: text('reason').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User matches table (for matchmaking feature)
export const userMatches = pgTable('user_matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  user1Id: uuid('user1_id').references(() => users.id).notNull(),
  user2Id: uuid('user2_id').references(() => users.id).notNull(),
  matchScore: integer('match_score'),
  isMatched: boolean('is_matched').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Group payments table (for collaborative ticket purchases)
export const groupPayments = pgTable('group_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  event_id: uuid('event_id').references(() => events.id).notNull(),
  ticket_tier_id: uuid('ticket_tier_id').references(() => ticketTiers.id).notNull(),
  total_quantity: integer('total_quantity').notNull(),
  total_amount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, completed, cancelled
  stripe_session_id: text('stripe_session_id'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Group payment contributions table
export const groupPaymentContributions = pgTable('group_payment_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  group_payment_id: uuid('group_payment_id').references(() => groupPayments.id).notNull(),
  contributor_id: uuid('contributor_id').references(() => users.id).notNull(),
  contributor_email: text('contributor_email').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  stripe_payment_intent_id: text('stripe_payment_intent_id'),
  status: text('status').notNull().default('pending'), // pending, completed, failed
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  tickets: many(tickets),
  sentTransfers: many(ticketTransfers, { relationName: 'fromUser' }),
  receivedTransfers: many(ticketTransfers, { relationName: 'toUser' }),
  roleApplications: many(roleApplications),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  ticketTiers: many(ticketTiers),
  tickets: many(tickets),
  userMatches: many(userMatches),
  groupPayments: many(groupPayments),
}));

export const ticketTiersRelations = relations(ticketTiers, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTiers.eventId],
    references: [events.id],
  }),
  tickets: many(tickets),
  groupPayments: many(groupPayments),
}));

export const groupPaymentsRelations = relations(groupPayments, ({ one, many }) => ({
  event: one(events, {
    fields: [groupPayments.event_id],
    references: [events.id],
  }),
  ticketTier: one(ticketTiers, {
    fields: [groupPayments.ticket_tier_id],
    references: [ticketTiers.id],
  }),
  contributions: many(groupPaymentContributions),
}));

export const groupPaymentContributionsRelations = relations(groupPaymentContributions, ({ one }) => ({
  groupPayment: one(groupPayments, {
    fields: [groupPaymentContributions.group_payment_id],
    references: [groupPayments.id],
  }),
  contributor: one(users, {
    fields: [groupPaymentContributions.contributor_id],
    references: [users.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  event: one(events, {
    fields: [tickets.eventId],
    references: [events.id],
  }),
  ticketTier: one(ticketTiers, {
    fields: [tickets.ticketTierId],
    references: [ticketTiers.id],
  }),
  buyer: one(users, {
    fields: [tickets.buyerId],
    references: [users.id],
  }),
  currentOwner: one(users, {
    fields: [tickets.currentOwnerId],
    references: [users.id],
  }),
  transfers: many(ticketTransfers),
}));

export const ticketTransfersRelations = relations(ticketTransfers, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketTransfers.ticketId],
    references: [tickets.id],
  }),
  fromUser: one(users, {
    fields: [ticketTransfers.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [ticketTransfers.toUserId],
    references: [users.id],
  }),
}));

export const roleApplicationsRelations = relations(roleApplications, ({ one }) => ({
  user: one(users, {
    fields: [roleApplications.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [roleApplications.reviewedBy],
    references: [users.id],
  }),
})); 