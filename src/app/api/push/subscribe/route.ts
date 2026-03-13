import { NextResponse } from "next/server";
import { db, pushSubscriptions } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const SubscribeSchema = z.object({
  eventId:  z.string().uuid(),
  endpoint: z.string().url(),
  auth:     z.string().min(1),
  p256dh:   z.string().min(1),
});

// POST — save a new push subscription
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { eventId, endpoint, auth, p256dh } = parsed.data;

  // Upsert: update auth/p256dh if endpoint already exists for this event
  const [existing] = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.eventId, eventId), eq(pushSubscriptions.endpoint, endpoint)));

  if (existing) {
    await db
      .update(pushSubscriptions)
      .set({ auth, p256dh })
      .where(eq(pushSubscriptions.id, existing.id));
  } else {
    await db.insert(pushSubscriptions).values({ eventId, endpoint, auth, p256dh });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE — remove a subscription
export async function DELETE(request: Request) {
  const body = await request.json();
  const { eventId, endpoint } = body as { eventId?: string; endpoint?: string };
  if (!eventId || !endpoint) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.eventId, eventId), eq(pushSubscriptions.endpoint, endpoint)));

  return new NextResponse(null, { status: 204 });
}
