import { NextResponse } from "next/server";
import { db, attendees, networkMatches } from "@/db";
import { eq } from "drizzle-orm";

// GET /api/network-matches?attendeeToken=[qrCode]
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("attendeeToken");
  if (!token) return NextResponse.json({ error: "attendeeToken required" }, { status: 400 });

  const [attendee] = await db.select().from(attendees).where(eq(attendees.qrCode, token));
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  // Fetch matches where this attendee is A or B
  const [asA, asB] = await Promise.all([
    db.select().from(networkMatches).where(eq(networkMatches.attendeeAId, attendee.id)),
    db.select().from(networkMatches).where(eq(networkMatches.attendeeBId, attendee.id)),
  ]);

  const allMatches = [...asA, ...asB].filter(m => m.status !== "declined");

  // For each match, fetch the other attendee's info
  const enriched = await Promise.all(
    allMatches.map(async (match) => {
      const otherId = match.attendeeAId === attendee.id ? match.attendeeBId : match.attendeeAId;
      const [other] = await db
        .select({
          id:           attendees.id,
          name:         attendees.name,
          organization: attendees.organization,
          role:         attendees.role,
        })
        .from(attendees)
        .where(eq(attendees.id, otherId!));
      return { ...match, other: other ?? null };
    })
  );

  return NextResponse.json({ matches: enriched });
}
