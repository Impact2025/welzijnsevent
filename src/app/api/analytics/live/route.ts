import { NextResponse } from "next/server";
import { db, attendees, qaMessages, attendeePoints } from "@/db";
import { eq, and, gte, sum } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const allAttendees = await db
    .select({ status: attendees.status, checkedInAt: attendees.checkedInAt })
    .from(attendees)
    .where(eq(attendees.eventId, eventId));

  const totalRegistered = allAttendees.length;
  const checkedIn       = allAttendees.filter(a => a.status === "ingecheckt").length;

  // New Q&A in last 10 min
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentQA  = await db
    .select()
    .from(qaMessages)
    .where(and(eq(qaMessages.eventId, eventId), gte(qaMessages.createdAt, tenMinAgo)));

  // Total points earned
  const [{ total }] = await db
    .select({ total: sum(attendeePoints.points) })
    .from(attendeePoints)
    .where(eq(attendeePoints.eventId, eventId));

  // Check-in timeline: bucket by 15-min intervals
  const checkedInAttendees = allAttendees.filter(a => a.checkedInAt);
  const buckets: Record<string, number> = {};
  for (const a of checkedInAttendees) {
    const d = new Date(a.checkedInAt!);
    // Round down to 15-min bucket
    d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0);
    const key = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  const timeline = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, count]) => ({ time, count }));

  return NextResponse.json({
    totalRegistered,
    checkedIn,
    recentQA:    recentQA.length,
    totalPoints: Number(total ?? 0),
    timeline,
  });
}
