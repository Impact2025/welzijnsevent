import { NextResponse } from "next/server";
import { db, attendees, networkMatches } from "@/db";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";
import { awardPoints, ACTIONS } from "@/lib/gamification";

const PatchSchema = z.object({
  attendeeToken: z.string().min(1),
  status:        z.enum(["accepted", "declined"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { attendeeToken, status } = parsed.data;

  // Validate token
  const [attendee] = await db.select().from(attendees).where(eq(attendees.qrCode, attendeeToken));
  if (!attendee) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  // Validate the match belongs to this attendee
  const [match] = await db
    .select()
    .from(networkMatches)
    .where(
      and(
        eq(networkMatches.id, params.id),
        or(
          eq(networkMatches.attendeeAId, attendee.id),
          eq(networkMatches.attendeeBId, attendee.id)
        )
      )
    );

  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [updated] = await db
    .update(networkMatches)
    .set({ status })
    .where(eq(networkMatches.id, params.id))
    .returning();

  if (status === "accepted" && match.eventId) {
    awardPoints(
      attendee.id,
      match.eventId,
      ACTIONS.NETWORK_MATCH_ACCEPT.key,
      ACTIONS.NETWORK_MATCH_ACCEPT.points
    ).catch(console.error);
  }

  return NextResponse.json(updated);
}
