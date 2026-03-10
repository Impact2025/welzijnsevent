import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, events, attendees } from "@/db";
import { eq, count, desc, inArray } from "drizzle-orm";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plans";
import { EventSchema, validationError } from "@/lib/validation";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ events: [] });

    const allEvents = await db
      .select()
      .from(events)
      .where(eq(events.organizationId, org.id))
      .orderBy(desc(events.startsAt));

    // Batch count — 1 query i.p.v. N queries (N+1 fix)
    const eventIds = allEvents.map((e) => e.id);
    const counts = eventIds.length > 0
      ? await db
          .select({ eventId: attendees.eventId, total: count() })
          .from(attendees)
          .where(inArray(attendees.eventId, eventIds))
          .groupBy(attendees.eventId)
      : [];
    const countMap = new Map(counts.map((c) => [c.eventId, c.total]));

    const enriched = allEvents.map((event) => ({
      ...event,
      attendeeCount: countMap.get(event.id) ?? 0,
    }));

    return NextResponse.json({ events: enriched });
  } catch (err) {
    console.error("[events GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Organisatie niet gevonden" }, { status: 404 });

    // Plan limit check
    const subscription = await getCurrentSubscription(org.id);
    const active = isSubscriptionActive(subscription);
    const plan = (active && subscription?.plan) ? subscription.plan : "trial";
    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.trial;

    const [{ total }] = await db
      .select({ total: count() })
      .from(events)
      .where(eq(events.organizationId, org.id));

    if (total >= limits.events) {
      return NextResponse.json({
        error: `Jouw ${limits.label}-plan staat max. ${limits.events} evenement${limits.events === 1 ? "" : "en"} toe. Upgrade om door te gaan.`,
        limitReached: true,
        plan,
      }, { status: 403 });
    }

    const body = await req.json();
    const parsed = EventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;
    const slug = data.slug
      ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const [event] = await db.insert(events).values({
      organizationId: org.id,
      title:          data.title,
      description:    data.description,
      location:       data.location,
      startsAt:       new Date(data.startsAt),
      endsAt:         new Date(data.endsAt),
      maxAttendees:   data.maxAttendees,
      status:         "draft",
      slug,
      isPublic:       data.isPublic ?? false,
      tagline:        data.tagline ?? null,
    }).returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[events POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
