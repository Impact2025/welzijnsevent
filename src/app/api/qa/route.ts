import { NextResponse } from "next/server";
import { db, qaMessages, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { awardPoints, ACTIONS } from "@/lib/gamification";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const messages = await db
    .select()
    .from(qaMessages)
    .where(eq(qaMessages.eventId, eventId));

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const body = await req.json();

  const [message] = await db.insert(qaMessages).values({
    eventId:     body.eventId,
    sessionId:   body.sessionId,
    authorName:  body.isAnonymous ? null : body.authorName,
    content:     body.content,
    isAnonymous: body.isAnonymous ?? false,
    status:      "nieuw",
  }).returning();

  await pusherServer.trigger(
    getLiveChannel(body.eventId),
    PUSHER_EVENTS.QA_NEW,
    message
  );

  // Gamification: award points if question is non-anonymous and author is identifiable
  if (!body.isAnonymous && body.authorEmail) {
    const [attendee] = await db
      .select({ id: attendees.id })
      .from(attendees)
      .where(eq(attendees.email, body.authorEmail));
    if (attendee) {
      awardPoints(attendee.id, body.eventId, ACTIONS.QA_QUESTION.key, ACTIONS.QA_QUESTION.points).catch(console.error);
    }
  }

  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH(req: Request) {
  try {
    const { id, status, eventId } = await req.json();

    const [updated] = await db
      .update(qaMessages)
      .set({ status })
      .where(eq(qaMessages.id, id))
      .returning();

    await pusherServer.trigger(
      getLiveChannel(eventId),
      PUSHER_EVENTS.QA_UPDATED,
      updated
    );

    return NextResponse.json({ message: updated });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
