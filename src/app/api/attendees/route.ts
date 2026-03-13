import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, attendees, events, waitlist, organizations } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendRegistrationConfirmation } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";
import { AttendeeSchema, validationError } from "@/lib/validation";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    // Verify the requesting org owns this event
    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });

    const [event] = await db.select().from(events).where(
      and(eq(events.id, eventId), eq(events.organizationId, org.id))
    );
    if (!event) return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId));

    return NextResponse.json({ attendees: list });
  } catch (err) {
    console.error("[attendees GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Rate limit: max 10 registraties per IP per 10 minuten
  const ip = getClientIp(req);
  const rl = rateLimit(`attendees:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = AttendeeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;
    const waitlistToken = body.waitlistToken as string | undefined;
    const networkingOptIn = body.networkingOptIn === true;
    const customResponses = body.customResponses ?? {};

    // Fetch event + org for plan limit check
    const [event] = await db.select().from(events).where(eq(events.id, data.eventId));
    if (!event) return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });

    // Plan limit: max attendees per event
    const [eventOrg] = await db.select().from(organizations).where(
      eq(organizations.id, event.organizationId!)
    );
    if (eventOrg) {
      const subscription = await getCurrentSubscription(eventOrg.id);
      const active = isSubscriptionActive(subscription);
      const plan = (active && subscription?.plan) ? subscription.plan : "trial";
      const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.trial;

      const [{ total }] = await db
        .select({ total: count() })
        .from(attendees)
        .where(eq(attendees.eventId, data.eventId));

      if (total >= limits.attendeesPerEvent) {
        return NextResponse.json(
          { error: `Maximum aantal deelnemers (${limits.attendeesPerEvent}) bereikt voor dit abonnement.` },
          { status: 403 }
        );
      }
    }

    // Duplicate email check
    const [existing] = await db
      .select({ id: attendees.id })
      .from(attendees)
      .where(and(eq(attendees.eventId, data.eventId), eq(attendees.email, data.email)));
    if (existing) {
      return NextResponse.json(
        { error: "Dit e-mailadres is al aangemeld voor dit evenement." },
        { status: 409 }
      );
    }

    const [attendee] = await db
      .insert(attendees)
      .values({
        eventId:         data.eventId,
        name:            data.name,
        email:           data.email,
        organization:    data.organization,
        role:            data.role,
        interests:       data.interests,
        status:          "aangemeld",
        qrCode:          randomUUID(),
        networkingOptIn,
        customResponses,
      })
      .returning();

    // Markeer wachtlijst-entry als ingevuld (als aangemeld via magic link)
    if (waitlistToken) {
      db.update(waitlist)
        .set({ status: "promoted" })
        .where(and(eq(waitlist.token, waitlistToken), eq(waitlist.eventId, data.eventId)))
        .catch(err => console.error("[waitlist] Token markering mislukt:", err));
    }

    // Stuur bevestigingsmail (non-blocking — laat registratie niet mislukken als mail faalt)
    if (attendee.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      sendRegistrationConfirmation({
        to: attendee.email,
        name: attendee.name,
        eventTitle: event.title,
        eventDate: formatDateTime(event.startsAt),
        eventLocation: event.location,
        qrCode: attendee.qrCode!,
        appUrl,
        attendeeId: attendee.id,
        orgName:  eventOrg?.name,
        orgLogo:  eventOrg?.logo,
        orgColor: eventOrg?.primaryColor,
      }).catch((err) => console.error("[email] Bevestigingsmail mislukt:", err));
    }

    return NextResponse.json({ attendee }, { status: 201 });
  } catch (err) {
    console.error("[attendees POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
