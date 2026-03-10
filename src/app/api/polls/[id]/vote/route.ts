import { NextResponse } from "next/server";
import { db, polls }    from "@/db";
import { eq }           from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { VoteSchema, validationError } from "@/lib/validation";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Rate limit: max 5 stemmen per IP per poll per minuut (voorkomt stem-spam)
  const ip = getClientIp(req);
  const rl = rateLimit(`vote:${params.id}:${ip}`, 5, 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = VoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(validationError(parsed.error), { status: 422 });
    }
    const { optionId } = parsed.data;

    const [poll] = await db.select().from(polls).where(eq(polls.id, params.id));
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }
    if (!poll.isActive) {
      return NextResponse.json({ error: "Poll is closed" }, { status: 400 });
    }

    const updatedOptions = poll.options.map((o) =>
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o
    );

    const [updated] = await db
      .update(polls)
      .set({ options: updatedOptions })
      .where(eq(polls.id, params.id))
      .returning();

    if (poll.eventId) {
      await pusherServer.trigger(
        getLiveChannel(poll.eventId),
        PUSHER_EVENTS.POLL_UPDATED,
        updated
      );
    }

    return NextResponse.json({ poll: updated });
  } catch (err) {
    console.error("[vote POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
