import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, events, attendees } from "@/db";
import { eq, count, desc } from "drizzle-orm";
import { getCurrentOrg, getCurrentSubscription, isSubscriptionActive } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plans";

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

    const enriched = await Promise.all(
      allEvents.map(async (event) => {
        const [result] = await db
          .select({ count: count() })
          .from(attendees)
          .where(eq(attendees.eventId, event.id));
        return { ...event, attendeeCount: result.count };
      })
    );

    return NextResponse.json({ events: enriched });
  } catch (err) {
    console.error(err);
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
    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const [event] = await db.insert(events).values({
      organizationId: org.id,
      title:          body.title,
      description:    body.description,
      location:       body.location,
      startsAt:       new Date(body.startsAt),
      endsAt:         new Date(body.endsAt),
      maxAttendees:   body.maxAttendees,
      status:         "draft",
      slug,
      isPublic:       body.isPublic ?? false,
      tagline:        body.tagline ?? null,
    }).returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
