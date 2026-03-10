import { NextResponse } from "next/server";
import { db, attendees, waitlist, events } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { sendWaitlistPromotion } from "@/lib/email";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// POST — deelnemer annuleert (token = qrCode ter authenticatie), auto-promoveer wachtlijst
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`cancel:${ip}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const { attendeeId, token } = body ?? {};

    if (!attendeeId || !token) {
      return NextResponse.json({ error: "attendeeId en token zijn verplicht" }, { status: 400 });
    }

    // Valideer token (= qrCode)
    const [attendee] = await db
      .select()
      .from(attendees)
      .where(and(eq(attendees.id, attendeeId), eq(attendees.qrCode, token)));

    if (!attendee) {
      return NextResponse.json({ error: "Ongeldige link" }, { status: 404 });
    }
    if (attendee.status === "afwezig") {
      return NextResponse.json({ error: "Al geannuleerd" }, { status: 400 });
    }

    // Annuleer de deelnemer
    await db
      .update(attendees)
      .set({ status: "afwezig" })
      .where(eq(attendees.id, attendeeId));

    // Auto-promoveer de eerste persoon op de wachtlijst
    const [nextInLine] = await db
      .select()
      .from(waitlist)
      .where(and(eq(waitlist.eventId, attendee.eventId), eq(waitlist.status, "waiting")))
      .orderBy(asc(waitlist.position))
      .limit(1);

    if (nextInLine) {
      const [event] = await db.select().from(events).where(eq(events.id, attendee.eventId));
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      await db
        .update(waitlist)
        .set({ status: "promoted", notifiedAt: new Date(), expiresAt })
        .where(eq(waitlist.id, nextInLine.id));

      if (event) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const registerUrl = `${appUrl}/e/${event.slug}/register?waitlistToken=${nextInLine.token}`;

        sendWaitlistPromotion({
          to: nextInLine.email,
          name: nextInLine.name,
          eventTitle: event.title,
          registerUrl,
        }).catch(err => console.error("[email] Auto-promotie mislukt:", err));
      }
    }

    return NextResponse.json({ success: true, promoted: nextInLine?.name ?? null });
  } catch (err) {
    console.error("[attendees/cancel POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
