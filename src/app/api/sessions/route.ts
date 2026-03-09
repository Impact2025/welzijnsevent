import { NextResponse } from "next/server";
import { db, sessions } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const list = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, eventId));

  return NextResponse.json({ sessions: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [session] = await db.insert(sessions).values({
      eventId:    body.eventId,
      title:      body.title,
      description: body.description,
      speaker:    body.speaker,
      speakerOrg: body.speakerOrg,
      location:   body.location,
      startsAt:   new Date(body.startsAt),
      endsAt:     new Date(body.endsAt),
      capacity:   body.capacity,
      sortOrder:  body.sortOrder ?? 0,
    }).returning();

    return NextResponse.json({ session }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isLive, eventId } = await req.json();

    const [updated] = await db
      .update(sessions)
      .set({ isLive })
      .where(eq(sessions.id, id))
      .returning();

    if (eventId) {
      await pusherServer.trigger(
        getLiveChannel(eventId),
        isLive ? PUSHER_EVENTS.SESSION_STARTED : PUSHER_EVENTS.SESSION_ENDED,
        updated
      );
    }

    return NextResponse.json({ session: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
