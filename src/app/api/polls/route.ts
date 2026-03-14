import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, polls, events } from "@/db";
import { eq, and } from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { sendEventPush } from "@/lib/push";
import { PollSchema, PollPatchSchema, validationError } from "@/lib/validation";
import { getCurrentOrg } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const [poll] = await db
      .select()
      .from(polls)
      .where(eq(polls.eventId, eventId));

    return NextResponse.json({ poll: poll ?? null });
  } catch (err) {
    console.error("[polls GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = PollSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const data = parsed.data;
    const [poll] = await db.insert(polls).values({
      eventId:   data.eventId,
      sessionId: data.sessionId,
      question:  data.question,
      options:   data.options,
      isActive:  true,
    }).returning();

    // Notify subscribers a new poll is live
    sendEventPush(data.eventId, {
      title: "📊 Nieuwe poll",
      body:  data.question,
      url:   `/e/${data.eventId}/live`,
    }).catch(console.error);

    return NextResponse.json({ poll }, { status: 201 });
  } catch (err) {
    console.error("[polls POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = PollPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }

    const { id, isActive, options, eventId } = parsed.data;

    // Verify the event belongs to this org
    if (eventId) {
      const [event] = await db.select({ id: events.id }).from(events).where(
        and(eq(events.id, eventId), eq(events.organizationId, org.id))
      );
      if (!event) return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (options !== undefined)  updateData.options  = options;

    const [updated] = await db
      .update(polls)
      .set(updateData)
      .where(eq(polls.id, id))
      .returning();

    if (eventId) {
      await pusherServer.trigger(
        getLiveChannel(eventId),
        PUSHER_EVENTS.POLL_UPDATED,
        updated
      );
    }

    return NextResponse.json({ poll: updated });
  } catch (err) {
    console.error("[polls PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
