import {
  pgTable, uuid, text, integer, timestamp,
  boolean, jsonb, real, primaryKey
} from "drizzle-orm/pg-core";

// ── AUTH.JS TABLES ──────────────────────────────────────────
export const authUsers = pgTable("auth_users", {
  id:            text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name"),
  email:         text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image:         text("image"),
});

export const authAccounts = pgTable("auth_accounts", {
  userId:            text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}));

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId:       text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}));

// ── ORGANIZATIONS ──────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id:           uuid("id").defaultRandom().primaryKey(),
  name:         text("name").notNull(),
  slug:         text("slug").unique(),
  logo:         text("logo"),
  primaryColor: text("primary_color").default("#C8522A"),
  customDomain: text("custom_domain"),
  userId:       text("user_id").references(() => authUsers.id, { onDelete: "cascade" }).unique(),
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
  maxAttendees:    integer("max_attendees"),
  waitlistEnabled: boolean("waitlist_enabled").default(true),
  // Public website fields
  slug:           text("slug").unique(),
  isPublic:       boolean("is_public").default(false),
  tagline:        text("tagline"),
  websiteColor:   text("website_color"),
  // Survey / tevredenheidsonderzoek
  surveyEnabled:  boolean("survey_enabled").default(false),
  surveyQuestions: jsonb("survey_questions").default([]).$type<SurveyQuestion[]>(),
  // Email tracking
  reminderSentAt:  timestamp("reminder_sent_at"),
  thankYouSentAt:  timestamp("thank_you_sent_at"),
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
});

// Forward declaration for survey question type (used in events)
export type SurveyQuestion = {
  id: string;
  label: string;
  type: "rating" | "text" | "yesno" | "nps";
  required?: boolean;
};

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
  status:          text("status").default("aangemeld"),
  // aangemeld | ingecheckt | afwezig
  checkedInAt:     timestamp("checked_in_at"),
  qrCode:          text("qr_code").unique(),
  emailOptOut:     boolean("email_opt_out").default(false),
  networkingOptIn: boolean("networking_opt_in").default(false),
  // GDPR opt-in for AI matching
  customResponses: jsonb("custom_responses").default({}).$type<Record<string, string | string[]>>(),
  // Answers to custom form fields
  registeredAt:    timestamp("registered_at").defaultNow(),
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

// ── WAITLIST ────────────────────────────────────────────────
export const waitlist = pgTable("waitlist", {
  id:           uuid("id").defaultRandom().primaryKey(),
  eventId:      uuid("event_id").references(() => events.id).notNull(),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  organization: text("organization"),
  role:         text("role"),
  interests:    jsonb("interests").default([]),
  position:     integer("position").notNull(),
  // 1 = volgende in de rij
  status:       text("status").default("waiting"),
  // waiting | promoted | expired
  token:        text("token").unique().notNull(),
  // magic link token (UUID)
  notifiedAt:   timestamp("notified_at"),
  expiresAt:    timestamp("expires_at"),
  // magic link vervalt na 48u
  createdAt:    timestamp("created_at").defaultNow(),
});

// ── SOCIAL WALL POSTS ──────────────────────────────────────
export const socialWallPosts = pgTable("social_wall_posts", {
  id:          uuid("id").defaultRandom().primaryKey(),
  eventId:     uuid("event_id").references(() => events.id).notNull(),
  authorName:  text("author_name").notNull(),
  authorEmail: text("author_email"),
  content:     text("content").notNull(),
  imageUrl:    text("image_url"),
  reactions:   jsonb("reactions").default({}).$type<Record<string, number>>(),
  // emoji → count, e.g. {"❤️": 5, "👏": 3}
  status:      text("status").default("visible"),
  // visible | hidden
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── SURVEY RESPONSES ───────────────────────────────────────
export const surveyResponses = pgTable("survey_responses", {
  id:              uuid("id").defaultRandom().primaryKey(),
  eventId:         uuid("event_id").references(() => events.id).notNull(),
  attendeeId:      uuid("attendee_id").references(() => attendees.id),
  overallRating:   integer("overall_rating"),
  // 1-5
  npsScore:        integer("nps_score"),
  // 0-10
  highlights:      text("highlights"),
  improvements:    text("improvements"),
  wouldRecommend:  boolean("would_recommend"),
  customAnswers:   jsonb("custom_answers").default({}).$type<Record<string, string>>(),
  createdAt:       timestamp("created_at").defaultNow(),
});

// ── CUSTOM FORM FIELDS ─────────────────────────────────────
export const customFormFields = pgTable("custom_form_fields", {
  id:        uuid("id").defaultRandom().primaryKey(),
  eventId:   uuid("event_id").references(() => events.id).notNull(),
  label:     text("label").notNull(),
  type:      text("type").notNull().default("text"),
  // text | textarea | select | checkbox | yesno
  options:   jsonb("options").default([]).$type<string[]>(),
  // for select/checkbox types
  required:  boolean("required").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── SUBSCRIPTIONS ──────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id:             uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
  plan:           text("plan").notNull(),
  // trial | starter | groei | organisatie
  status:         text("status").default("active"),
  // active | expired | cancelled | pending_payment
  startsAt:       timestamp("starts_at").defaultNow(),
  expiresAt:      timestamp("expires_at"),
  paymentId:      text("payment_id"),
  amountPaid:     integer("amount_paid"),
  // in centen, null voor trial
  createdAt:      timestamp("created_at").defaultNow(),
  updatedAt:      timestamp("updated_at").defaultNow(),
});

// ── ADMIN AUDIT LOG ────────────────────────────────────────
export const adminAuditLog = pgTable("admin_audit_log", {
  id:            uuid("id").defaultRandom().primaryKey(),
  adminEmail:    text("admin_email").notNull(),
  action:        text("action").notNull(),
  // subscription_update | subscription_create | subscription_delete
  targetOrgId:   uuid("target_org_id"),
  targetOrgName: text("target_org_name"),
  previousValue: jsonb("previous_value"),
  newValue:      jsonb("new_value"),
  note:          text("note"),
  createdAt:     timestamp("created_at").defaultNow(),
});

// ── TYPES ──────────────────────────────────────────────────
export type AdminAuditLog      = typeof adminAuditLog.$inferSelect;
export type AuthUser           = typeof authUsers.$inferSelect;
export type Organization       = typeof organizations.$inferSelect;
export type Subscription       = typeof subscriptions.$inferSelect;
export type Event              = typeof events.$inferSelect;
export type Session            = typeof sessions.$inferSelect;
export type Attendee           = typeof attendees.$inferSelect;
export type Poll               = typeof polls.$inferSelect;
export type QAMessage          = typeof qaMessages.$inferSelect;
export type NetworkMatch       = typeof networkMatches.$inferSelect;
export type Feedback           = typeof feedback.$inferSelect;
export type TicketType         = typeof ticketTypes.$inferSelect;
export type Order              = typeof orders.$inferSelect;
export type WaitlistEntry      = typeof waitlist.$inferSelect;
export type SocialWallPost     = typeof socialWallPosts.$inferSelect;
export type SurveyResponse     = typeof surveyResponses.$inferSelect;
export type CustomFormField    = typeof customFormFields.$inferSelect;
