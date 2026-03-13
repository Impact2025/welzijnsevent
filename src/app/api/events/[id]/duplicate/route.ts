import { NextRequest, NextResponse } from "next/server";
import { db, events, sessions } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [source] = await db.select().from(events).where(eq(events.id, params.id));
  if (!source || source.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const sourceSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, params.id));

  // Shift dates by 1 year
  const yearMs = 365 * 24 * 60 * 60 * 1000;
  const newStartsAt = new Date(source.startsAt.getTime() + yearMs);
  const newEndsAt   = new Date(source.endsAt.getTime() + yearMs);

  const newSlug = source.slug
    ? `${source.slug}-kopie-${Date.now().toString(36)}`
    : `kopie-${Date.now().toString(36)}`;

  const [newEvent] = await db.insert(events).values({
    id:              randomUUID(),
    organizationId:  org.id,
    title:           `${source.title} (kopie)`,
    description:     source.description,
    location:        source.location,
    address:         source.address,
    coverImage:      source.coverImage,
    startsAt:        newStartsAt,
    endsAt:          newEndsAt,
    status:          "draft",
    maxAttendees:    source.maxAttendees,
    waitlistEnabled: source.waitlistEnabled,
    slug:            newSlug,
    isPublic:        false,
    tagline:         source.tagline,
    websiteColor:    source.websiteColor,
    surveyEnabled:   source.surveyEnabled,
    surveyQuestions: source.surveyQuestions,
  }).returning();

  // Copy sessions with new eventId (shift dates too)
  if (sourceSessions.length > 0) {
    await db.insert(sessions).values(
      sourceSessions.map(s => ({
        id:          randomUUID(),
        eventId:     newEvent.id,
        title:       s.title,
        description: s.description,
        speaker:     s.speaker,
        speakerOrg:  s.speakerOrg,
        location:    s.location,
        streamUrl:   s.streamUrl,
        startsAt:    new Date(s.startsAt.getTime() + yearMs),
        endsAt:      new Date(s.endsAt.getTime() + yearMs),
        capacity:    s.capacity,
        sortOrder:   s.sortOrder,
        isLive:      false,
      }))
    );
  }

  return NextResponse.json({ event: newEvent }, { status: 201 });
}
