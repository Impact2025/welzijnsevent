import { NextResponse } from "next/server";
import { db, events, sessions, attendees } from "@/db";
import { eq, count } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, params.id));
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const eventSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, params.id));

    const [{ count: attendeeCount }] = await db
      .select({ count: count() })
      .from(attendees)
      .where(eq(attendees.eventId, params.id));

    return NextResponse.json({ event: { ...event, sessions: eventSessions, attendeeCount } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const [updated] = await db
      .update(events)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(events.id, params.id))
      .returning();

    return NextResponse.json({ event: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(events).where(eq(events.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
