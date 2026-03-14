import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, qaMessages, attendees, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { awardPoints, ACTIONS } from "@/lib/gamification";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { getCurrentOrg } from "@/lib/auth";
import { z } from "zod";

const QAPostSchema = z.object({
  eventId:     z.string().uuid(),
  sessionId:   z.string().uuid().optional().nullable(),
  content:     z.string().min(1).max(500).trim(),
  authorName:  z.string().max(200).trim().optional().nullable(),
  authorEmail: z.string().email().optional().nullable(),
  isAnonymous: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const messages = await db
    .select()
    .from(qaMessages)
    .where(eq(qaMessages.eventId, eventId));

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  // Rate limit: max 5 vragen per IP per minuut
  const ip = getClientIp(req);
  const rl = rateLimit(`qa:${ip}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = QAPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const data = parsed.data;

    // Verify the event exists and is public or live
    const [event] = await db.select({ id: events.id, status: events.status, isPublic: events.isPublic })
      .from(events).where(eq(events.id, data.eventId));
    if (!event) return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });

    const [message] = await db.insert(qaMessages).values({
      eventId:     data.eventId,
      sessionId:   data.sessionId ?? null,
      authorName:  data.isAnonymous ? null : (data.authorName ?? null),
      content:     data.content,
      isAnonymous: data.isAnonymous,
      status:      "nieuw",
    }).returning();

    await pusherServer.trigger(
      getLiveChannel(data.eventId),
      PUSHER_EVENTS.QA_NEW,
      message
    );

    // Gamification — only if non-anonymous and email provided
    if (!data.isAnonymous && data.authorEmail) {
      const [attendee] = await db
        .select({ id: attendees.id })
        .from(attendees)
        .where(eq(attendees.email, data.authorEmail));
      if (attendee) {
        awardPoints(attendee.id, data.eventId, ACTIONS.QA_QUESTION.key, ACTIONS.QA_QUESTION.points)
          .catch(console.error);
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("[qa POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — moderatie (alleen voor ingelogde organizers)
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const org = await getCurrentOrg();
    if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

    const body = await req.json();
    const { id, status, eventId } = body;

    if (!id || !status || !eventId) {
      return NextResponse.json({ error: "id, status en eventId zijn vereist" }, { status: 422 });
    }

    const allowedStatuses = ["nieuw", "beantwoord", "verborgen"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Ongeldige status" }, { status: 422 });
    }

    // Verify the event belongs to this org
    const [event] = await db.select({ id: events.id }).from(events).where(
      and(eq(events.id, eventId), eq(events.organizationId, org.id))
    );
    if (!event) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });

    const [updated] = await db
      .update(qaMessages)
      .set({ status })
      .where(and(eq(qaMessages.id, id), eq(qaMessages.eventId, eventId)))
      .returning();

    await pusherServer.trigger(
      getLiveChannel(eventId),
      PUSHER_EVENTS.QA_UPDATED,
      updated
    );

    return NextResponse.json({ message: updated });
  } catch (err) {
    console.error("[qa PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
