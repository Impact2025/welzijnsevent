import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, sessions, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { sendEventPush } from "@/lib/push";
import { SessionSchema, SessionPatchSchema, validationError } from "@/lib/validation";
import { getCurrentOrg } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const list = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, eventId));

    return NextResponse.json({ sessions: list });
  } catch (err) {
    console.error("[sessions GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = SessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    // Verify the event belongs to this org
    const [event] = await db.select({ id: events.id }).from(events).where(
      and(eq(events.id, parsed.data.eventId), eq(events.organizationId, org.id))
    );
    if (!event) return NextResponse.json({ error: "Evenement niet gevonden of geen toegang" }, { status: 403 });

    const data = parsed.data;
    const [session] = await db.insert(sessions).values({
      eventId:     data.eventId,
      title:       data.title,
      description: data.description,
      speaker:     data.speaker,
      speakerOrg:  data.speakerOrg,
      location:    data.location,
      streamUrl:   data.streamUrl ?? null,
      startsAt:    new Date(data.startsAt),
      endsAt:      new Date(data.endsAt),
      capacity:    data.capacity,
      sortOrder:   data.sortOrder,
    }).returning();

    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    console.error("[sessions POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const authSession = await auth();
  if (!authSession?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = SessionPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const { id, isLive, streamUrl, eventId } = parsed.data;

    // Verify the event (if provided) belongs to this org
    if (eventId) {
      const [event] = await db.select({ id: events.id }).from(events).where(
        and(eq(events.id, eventId), eq(events.organizationId, org.id))
      );
      if (!event) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    } else {
      // Without eventId we can't verify ownership — require it
      return NextResponse.json({ error: "eventId vereist" }, { status: 422 });
    }

    const patch: Record<string, unknown> = {};
    if (isLive    !== undefined) patch.isLive    = isLive;
    if (streamUrl !== undefined) patch.streamUrl = streamUrl;

    const [updated] = await db
      .update(sessions)
      .set(patch)
      .where(and(eq(sessions.id, id), eq(sessions.eventId, eventId)))
      .returning();

    if (isLive !== undefined) {
      await pusherServer.trigger(
        getLiveChannel(eventId),
        isLive ? PUSHER_EVENTS.SESSION_STARTED : PUSHER_EVENTS.SESSION_ENDED,
        updated
      );

      if (isLive) {
        sendEventPush(eventId, {
          title: "🎤 Nu live",
          body:  updated.title + (updated.streamUrl ? " · Online meekijken beschikbaar" : ""),
          url:   `/e/${eventId}`,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ session: updated });
  } catch (err) {
    console.error("[sessions PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
