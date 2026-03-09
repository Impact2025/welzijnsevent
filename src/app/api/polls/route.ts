import { NextResponse } from "next/server";
import { db, polls } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const [poll] = await db
    .select()
    .from(polls)
    .where(eq(polls.eventId, eventId));

  return NextResponse.json({ poll: poll ?? null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [poll] = await db.insert(polls).values({
      eventId:   body.eventId,
      sessionId: body.sessionId,
      question:  body.question,
      options:   body.options,
      isActive:  true,
    }).returning();

    return NextResponse.json({ poll }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, isActive, options, eventId } = await req.json();

    const updateData: Record<string, unknown> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (options !== undefined)  updateData.options  = options;

    const [updated] = await db
      .update(polls)
      .set(updateData)
      .where(eq(polls.id, id))
      .returning();

    if (eventId) {
      await pusherServer.trigger(
        getLiveChannel(eventId),
        PUSHER_EVENTS.POLL_UPDATED,
        updated
      );
    }

    return NextResponse.json({ poll: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
