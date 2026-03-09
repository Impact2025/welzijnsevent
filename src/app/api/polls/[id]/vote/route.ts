import { NextResponse } from "next/server";
import { db, polls }    from "@/db";
import { eq }           from "drizzle-orm";
import { pusherServer, getLiveChannel, PUSHER_EVENTS } from "@/lib/pusher";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { optionId } = await req.json();
    if (!optionId) {
      return NextResponse.json({ error: "optionId required" }, { status: 400 });
    }

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
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
