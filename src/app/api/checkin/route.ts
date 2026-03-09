import { NextResponse } from "next/server";
import { db, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const { attendeeId, eventId } = await req.json();

    const [updated] = await db
      .update(attendees)
      .set({ status: "ingecheckt", checkedInAt: new Date() })
      .where(eq(attendees.id, attendeeId))
      .returning();

    // Broadcast via Pusher
    await pusherServer.trigger(
      getEventChannel(eventId),
      PUSHER_EVENTS.ATTENDEE_CHECKIN,
      { attendeeId, name: updated.name }
    );

    return NextResponse.json({ attendee: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
