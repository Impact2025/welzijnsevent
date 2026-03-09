import {
  pgTable, uuid, text, integer, timestamp,
  boolean, jsonb, real
} from "drizzle-orm/pg-core";


// ── ORGANIZATIONS ──────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id:           uuid("id").defaultRandom().primaryKey(),
  name:         text("name").notNull(),
  slug:         text("slug").unique(),
  logo:         text("logo"),
  primaryColor: text("primary_color").default("#C8522A"),
  clerkOrgId:   text("clerk_org_id").unique(),
  createdAt:    timestamp("created_at").defaultNow(),
});

// ── EVENTS ─────────────────────────────────────────────────
export const events = pgTable("events", {
  id:             uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  title:          text("title").notNull(),
  description:    text("description"),
  location:       text("location"),
  address:        text("address"),
  coverImage:     text("cover_image"),
  startsAt:       timestamp("starts_at").notNull(),
  endsAt:         timestamp("ends_at").notNull(),
  status:         text("status").default("draft"),
  // draft | published | live | ended
  maxAttendees:   integer("max_attendees"),
  // Public website fields
  slug:           text("slug").unique(),
  isPublic:       boolean("is_public").default(false),
  tagline:        text("tagline"),
  websiteColor:   text("website_color"),
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
});

// ── SESSIONS ───────────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id:          uuid("id").defaultRandom().primaryKey(),
  eventId:     uuid("event_id").references(() => events.id).notNull(),
  title:       text("title").notNull(),
  description: text("description"),
  speaker:     text("speaker"),
  speakerOrg:  text("speaker_org"),
  location:    text("location"),
  startsAt:    timestamp("starts_at").notNull(),
  endsAt:      timestamp("ends_at").notNull(),
  isLive:      boolean("is_live").default(false),
  capacity:    integer("capacity"),
  sortOrder:   integer("sort_order").default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── ATTENDEES ──────────────────────────────────────────────
export const attendees = pgTable("attendees", {
  id:           uuid("id").defaultRandom().primaryKey(),
  eventId:      uuid("event_id").references(() => events.id).notNull(),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  organization: text("organization"),
  role:         text("role"),
  interests:    jsonb("interests").default([]),
  // voor AI matching
  status:       text("status").default("aangemeld"),
  // aangemeld | ingecheckt | afwezig
  checkedInAt:  timestamp("checked_in_at"),
  qrCode:       text("qr_code").unique(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// ── SESSION REGISTRATIONS ──────────────────────────────────
export const sessionRegistrations = pgTable("session_registrations", {
  id:         uuid("id").defaultRandom().primaryKey(),
  sessionId:  uuid("session_id").references(() => sessions.id),
  attendeeId: uuid("attendee_id").references(() => attendees.id),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ── POLLS ──────────────────────────────────────────────────
export const polls = pgTable("polls", {
  id:        uuid("id").defaultRandom().primaryKey(),
  eventId:   uuid("event_id").references(() => events.id),
  sessionId: uuid("session_id").references(() => sessions.id),
  question:  text("question").notNull(),
  options:   jsonb("options").notNull().$type<{ id: string; label: string; votes: number }[]>(),
  isActive:  boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Q&A MESSAGES ───────────────────────────────────────────
export const qaMessages = pgTable("qa_messages", {
  id:          uuid("id").defaultRandom().primaryKey(),
  eventId:     uuid("event_id").references(() => events.id),
  sessionId:   uuid("session_id").references(() => sessions.id),
  authorName:  text("author_name"),
  authorEmail: text("author_email"),
  content:     text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  status:      text("status").default("nieuw"),
  // nieuw | goedgekeurd | verwijderd
  upvotes:     integer("upvotes").default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── NETWORK MATCHES ────────────────────────────────────────
export const networkMatches = pgTable("network_matches", {
  id:          uuid("id").defaultRandom().primaryKey(),
  eventId:     uuid("event_id").references(() => events.id),
  attendeeAId: uuid("attendee_a_id").references(() => attendees.id),
  attendeeBId: uuid("attendee_b_id").references(() => attendees.id),
  score:       real("score"),
  reason:      text("reason"),
  status:      text("status").default("suggested"),
  // suggested | accepted | declined
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── FEEDBACK / RATINGS ─────────────────────────────────────
export const feedback = pgTable("feedback", {
  id:         uuid("id").defaultRandom().primaryKey(),
  eventId:    uuid("event_id").references(() => events.id),
  sessionId:  uuid("session_id").references(() => sessions.id),
  attendeeId: uuid("attendee_id").references(() => attendees.id),
  rating:     real("rating"),
  comment:    text("comment"),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ── TICKET TYPES ───────────────────────────────────────────
export const ticketTypes = pgTable("ticket_types", {
  id:          uuid("id").defaultRandom().primaryKey(),
  eventId:     uuid("event_id").references(() => events.id).notNull(),
  name:        text("name").notNull(),
  description: text("description"),
  price:       integer("price").notNull().default(0),
  // in centen; 0 = gratis
  currency:    text("currency").default("EUR"),
  maxQuantity: integer("max_quantity"),
  soldCount:   integer("sold_count").default(0),
  isActive:    boolean("is_active").default(true),
  sortOrder:   integer("sort_order").default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── ORDERS ─────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id:            uuid("id").defaultRandom().primaryKey(),
  eventId:       uuid("event_id").references(() => events.id).notNull(),
  ticketTypeId:  uuid("ticket_type_id").references(() => ticketTypes.id),
  attendeeId:    uuid("attendee_id").references(() => attendees.id),
  customerName:  text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  amount:        integer("amount").notNull(),
  // in centen
  currency:      text("currency").default("EUR"),
  status:        text("status").default("pending"),
  // pending | paid | failed | cancelled
  paymentId:     text("payment_id"),
  paymentUrl:    text("payment_url"),
  createdAt:     timestamp("created_at").defaultNow(),
  updatedAt:     timestamp("updated_at").defaultNow(),
});

// ── TYPES ──────────────────────────────────────────────────
export type Organization       = typeof organizations.$inferSelect;
export type Event              = typeof events.$inferSelect;
export type Session            = typeof sessions.$inferSelect;
export type Attendee           = typeof attendees.$inferSelect;
export type Poll               = typeof polls.$inferSelect;
export type QAMessage          = typeof qaMessages.$inferSelect;
export type NetworkMatch       = typeof networkMatches.$inferSelect;
export type Feedback           = typeof feedback.$inferSelect;
export type TicketType         = typeof ticketTypes.$inferSelect;
export type Order              = typeof orders.$inferSelect;
