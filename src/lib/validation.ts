import { z } from "zod";

// ─── Attendees ────────────────────────────────────────────────────────────────
export const AttendeeSchema = z.object({
  eventId:      z.string().uuid("Ongeldig eventId"),
  name:         z.string().min(1, "Naam is verplicht").max(200),
  email:        z.string().email("Ongeldig e-mailadres").max(320),
  organization: z.string().max(200).optional(),
  role:         z.string().max(100).optional(),
  interests:    z.array(z.string().max(100)).max(20).default([]),
});

// ─── Events ───────────────────────────────────────────────────────────────────
export const EventSchema = z.object({
  title:        z.string().min(1, "Titel is verplicht").max(200),
  description:  z.string().max(5000).optional(),
  location:     z.string().max(500).optional(),
  startsAt:     z.string().datetime({ message: "Ongeldige startdatum" }),
  endsAt:       z.string().datetime({ message: "Ongeldige einddatum" }),
  maxAttendees: z.number().int().positive().max(100_000).optional().nullable(),
  isPublic:     z.boolean().optional().default(false),
  tagline:      z.string().max(300).optional().nullable(),
  slug:         z.string().max(100).regex(/^[a-z0-9-]*$/, "Slug mag alleen kleine letters, cijfers en koppeltekens bevatten").optional(),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const SessionSchema = z.object({
  eventId:     z.string().uuid("Ongeldig eventId"),
  title:       z.string().min(1, "Titel is verplicht").max(200),
  description: z.string().max(2000).optional(),
  speaker:     z.string().max(200).optional(),
  speakerOrg:  z.string().max(200).optional(),
  location:    z.string().max(500).optional(),
  startsAt:    z.string().datetime(),
  endsAt:      z.string().datetime(),
  capacity:    z.number().int().positive().max(10_000).optional().nullable(),
  sortOrder:   z.number().int().optional().default(0),
});

export const SessionPatchSchema = z.object({
  id:      z.string().uuid("Ongeldig sessie-id"),
  isLive:  z.boolean(),
  eventId: z.string().uuid().optional(),
});

// ─── Polls ────────────────────────────────────────────────────────────────────
const PollOptionSchema = z.object({
  id:    z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  votes: z.number().int().min(0).default(0),
});

export const PollSchema = z.object({
  eventId:   z.string().uuid("Ongeldig eventId"),
  sessionId: z.string().uuid().optional().nullable(),
  question:  z.string().min(1, "Vraag is verplicht").max(500),
  options:   z.array(PollOptionSchema).min(2, "Minimaal 2 opties").max(10),
});

export const PollPatchSchema = z.object({
  id:       z.string().uuid("Ongeldig poll-id"),
  isActive: z.boolean().optional(),
  options:  z.array(PollOptionSchema).optional(),
  eventId:  z.string().uuid().optional(),
});

export const VoteSchema = z.object({
  optionId: z.string().min(1).max(100),
});

// ─── Organizations ────────────────────────────────────────────────────────────
export const OrganizationPatchSchema = z.object({
  name:         z.string().min(1).max(200).optional(),
  logo:         z.string().url().max(500).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ongeldig kleurformaat").optional().nullable(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const SubscriptionSchema = z.object({
  plan: z.enum(["starter", "groei", "organisatie"], {
    errorMap: () => ({ message: "Ongeldig abonnementsplan" }),
  }),
});

// ─── Payments (public ticket) ─────────────────────────────────────────────────
export const PaymentSchema = z.object({
  eventId:      z.string().uuid("Ongeldig eventId"),
  ticketTypeId: z.string().uuid().optional(),
  name:         z.string().min(1).max(200),
  email:        z.string().email().max(320),
  organization: z.string().max(200).optional(),
  role:         z.string().max(100).optional(),
  interests:    z.array(z.string().max(100)).max(20).optional(),
  slug:         z.string().max(100).optional(),
});

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export const WaitlistSchema = z.object({
  eventId:      z.string().uuid("Ongeldig eventId"),
  name:         z.string().min(1, "Naam is verplicht").max(200),
  email:        z.string().email("Ongeldig e-mailadres").max(320),
  organization: z.string().max(200).optional(),
  role:         z.string().max(100).optional(),
  interests:    z.array(z.string().max(100)).max(20).default([]),
});

export const WaitlistPromoteSchema = z.object({
  waitlistId: z.string().uuid("Ongeldig wachtlijst-id"),
});

// ─── Helper ───────────────────────────────────────────────────────────────────
export function validationError(errors: z.ZodError) {
  const messages = errors.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  return { error: `Validatiefout: ${messages}` };
}
