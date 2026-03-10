import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, sessions } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { SessionSchema, SessionPatchSchema, validationError } from "@/lib/validation";

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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = SessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;
    const [session] = await db.insert(sessions).values({
      eventId:     data.eventId,
      title:       data.title,
      description: data.description,
      speaker:     data.speaker,
      speakerOrg:  data.speakerOrg,
      location:    data.location,
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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = SessionPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const { id, isLive, eventId } = parsed.data;

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
  } catch (err) {
    console.error("[sessions PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
