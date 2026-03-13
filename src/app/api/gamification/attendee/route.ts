import { NextResponse } from "next/server";
import { db, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { getAttendeeStats } from "@/lib/gamification";

// GET /api/gamification/attendee?attendeeToken=[qrCode]
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("attendeeToken");
  if (!token) return NextResponse.json({ error: "attendeeToken required" }, { status: 400 });

  const [attendee] = await db.select().from(attendees).where(eq(attendees.qrCode, token));
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  const stats = await getAttendeeStats(attendee.id, attendee.eventId);
  return NextResponse.json(stats);
}
