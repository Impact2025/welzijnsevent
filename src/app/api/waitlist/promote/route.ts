import { NextResponse } from "next/server";
import { db, waitlist, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { sendWaitlistPromotion } from "@/lib/email";
import { WaitlistPromoteSchema, validationError } from "@/lib/validation";

// POST — promoveer een wachtlijst-entry naar beschikbaar (organizer only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = WaitlistPromoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const [entry] = await db
      .select()
      .from(waitlist)
      .where(eq(waitlist.id, parsed.data.waitlistId));

    if (!entry) return NextResponse.json({ error: "Wachtlijst-entry niet gevonden" }, { status: 404 });
    if (entry.status !== "waiting") {
      return NextResponse.json({ error: "Entry is al gepromoveerd of verlopen" }, { status: 400 });
    }

    const [event] = await db.select().from(events).where(eq(events.id, entry.eventId));
    if (!event) return NextResponse.json({ error: "Event niet gevonden" }, { status: 404 });

    // Stel vervaldatum in op 48 uur vanaf nu
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const [updated] = await db
      .update(waitlist)
      .set({ status: "promoted", notifiedAt: new Date(), expiresAt })
      .where(eq(waitlist.id, entry.id))
      .returning();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const registerUrl = `${appUrl}/e/${event.slug}/register?waitlistToken=${entry.token}`;

    // Promotiemmail (non-blocking)
    sendWaitlistPromotion({
      to: entry.email,
      name: entry.name,
      eventTitle: event.title,
      registerUrl,
    }).catch(err => console.error("[email] Wachtlijstpromotie mislukt:", err));

    return NextResponse.json({ entry: updated });
  } catch (err) {
    console.error("[waitlist/promote POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
