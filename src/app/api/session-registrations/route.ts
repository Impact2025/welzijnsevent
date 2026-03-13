import { NextResponse } from "next/server";
import { db, attendees, sessions, sessionRegistrations } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";

const BodySchema = z.object({
  attendeeToken: z.string().min(1),
  sessionId:     z.string().uuid(),
});

// Resolve token → attendee, return null if invalid
async function resolveToken(token: string) {
  const [a] = await db.select().from(attendees).where(eq(attendees.qrCode, token));
  return a ?? null;
}

// GET — list all session IDs the attendee is registered for
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("attendeeToken");
  if (!token) return NextResponse.json({ error: "attendeeToken required" }, { status: 400 });

  const attendee = await resolveToken(token);
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const regs = await db
    .select({ sessionId: sessionRegistrations.sessionId })
    .from(sessionRegistrations)
    .where(eq(sessionRegistrations.attendeeId, attendee.id));

  return NextResponse.json({ registeredIds: regs.map(r => r.sessionId) });
}

// POST — register for a session
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { attendeeToken, sessionId } = parsed.data;

  const attendee = await resolveToken(attendeeToken);
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  // Check session exists and belongs to same event
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.eventId, attendee.eventId)));
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  // Check capacity
  if (session.capacity) {
    const [result] = await db
      .select({ total: count() })
      .from(sessionRegistrations)
      .where(eq(sessionRegistrations.sessionId, sessionId));
    if (result && Number(result.total) >= session.capacity) {
      return NextResponse.json({ error: "Sessie is vol" }, { status: 409 });
    }
  }

  // Upsert — ignore if already registered
  const [existing] = await db
    .select()
    .from(sessionRegistrations)
    .where(and(
      eq(sessionRegistrations.sessionId, sessionId),
      eq(sessionRegistrations.attendeeId, attendee.id)
    ));

  if (!existing) {
    await db.insert(sessionRegistrations).values({ sessionId, attendeeId: attendee.id });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE — unregister from a session
export async function DELETE(request: Request) {
  const body = await request.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { attendeeToken, sessionId } = parsed.data;

  const attendee = await resolveToken(attendeeToken);
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  await db
    .delete(sessionRegistrations)
    .where(and(
      eq(sessionRegistrations.sessionId, sessionId),
      eq(sessionRegistrations.attendeeId, attendee.id)
    ));

  return new NextResponse(null, { status: 204 });
}
