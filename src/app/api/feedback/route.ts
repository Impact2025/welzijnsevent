import { NextRequest, NextResponse } from "next/server";
import { db, feedback, attendees, sessions, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const PostSchema = z.object({
  sessionId:     z.string().uuid(),
  attendeeToken: z.string().min(1),
  rating:        z.number().int().min(1).max(5),
  comment:       z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const rows = await db
    .select()
    .from(feedback)
    .where(eq(feedback.eventId, eventId));

  return NextResponse.json({ feedback: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { sessionId, attendeeToken, rating, comment } = parsed.data;

  // Resolve attendee by QR token
  const [attendee] = await db.select().from(attendees).where(eq(attendees.qrCode, attendeeToken));
  if (!attendee) return NextResponse.json({ error: "Ongeldig token" }, { status: 403 });

  const [session] = await db.select().from(sessions).where(
    and(eq(sessions.id, sessionId), eq(sessions.eventId, attendee.eventId))
  );
  if (!session) return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });

  // Upsert: one rating per attendee per session
  const [existing] = await db.select().from(feedback).where(
    and(eq(feedback.sessionId, sessionId), eq(feedback.attendeeId, attendee.id))
  );

  if (existing) {
    const [updated] = await db
      .update(feedback)
      .set({ rating, comment: comment ?? null })
      .where(eq(feedback.id, existing.id))
      .returning();
    return NextResponse.json({ feedback: updated });
  }

  const [created] = await db.insert(feedback).values({
    eventId:    attendee.eventId,
    sessionId,
    attendeeId: attendee.id,
    rating,
    comment:    comment ?? null,
  }).returning();

  return NextResponse.json({ feedback: created }, { status: 201 });
}
