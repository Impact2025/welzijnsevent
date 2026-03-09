import { NextResponse } from "next/server";
import { db, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { pusherServer, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const { qrCode } = await req.json();
    if (!qrCode) return NextResponse.json({ error: "qrCode required" }, { status: 400 });

    const [attendee] = await db
      .select()
      .from(attendees)
      .where(eq(attendees.qrCode, qrCode));

    if (!attendee) {
      return NextResponse.json({ error: "Deelnemer niet gevonden" }, { status: 404 });
    }

    if (attendee.status === "ingecheckt") {
      return NextResponse.json({ attendee, alreadyCheckedIn: true });
    }

    const [updated] = await db
      .update(attendees)
      .set({ status: "ingecheckt", checkedInAt: new Date() })
      .where(eq(attendees.id, attendee.id))
      .returning();

    await pusherServer.trigger(
      getEventChannel(attendee.eventId),
      PUSHER_EVENTS.ATTENDEE_CHECKIN,
      { attendeeId: updated.id, name: updated.name }
    );

    return NextResponse.json({ attendee: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
