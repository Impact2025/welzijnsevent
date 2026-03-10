import { NextRequest, NextResponse } from "next/server";
import { db, events, socialWallPosts, attendees } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { pusherServer, getLiveChannel } from "@/lib/pusher";

// GET — haal posts op voor een event
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  const all = req.nextUrl.searchParams.get("all") === "true";
  if (!eventId) return NextResponse.json({ error: "eventId vereist" }, { status: 400 });

  // all=true gebruikt de organizer (auth check)
  if (all) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    const posts = await db
      .select()
      .from(socialWallPosts)
      .where(eq(socialWallPosts.eventId, eventId))
      .orderBy(desc(socialWallPosts.createdAt));
    return NextResponse.json(posts);
  }

  const posts = await db
    .select()
    .from(socialWallPosts)
    .where(and(eq(socialWallPosts.eventId, eventId), eq(socialWallPosts.status, "visible")))
    .orderBy(desc(socialWallPosts.createdAt));

  return NextResponse.json(posts);
}

// POST — nieuwe post plaatsen (publiek)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { eventId, authorName, authorEmail, content } = body;

  if (!eventId || !authorName?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Vul alle verplichte velden in" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "Bericht mag maximaal 500 tekens bevatten" }, { status: 400 });
  }

  // Controleer of event bestaat en publiek is
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || !event.isPublic) {
    return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });
  }

  const [post] = await db
    .insert(socialWallPosts)
    .values({
      eventId,
      authorName: authorName.trim(),
      authorEmail: authorEmail?.trim() || null,
      content: content.trim(),
      reactions: {},
      status: "visible",
    })
    .returning();

  // Realtime broadcast naar live channel
  await pusherServer.trigger(getLiveChannel(eventId), "wall:new", post);

  return NextResponse.json(post, { status: 201 });
}

// PATCH — reageren op post (publiek emoji-reactie)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { postId, emoji } = body;

  if (!postId || !emoji) {
    return NextResponse.json({ error: "postId en emoji vereist" }, { status: 400 });
  }

  const ALLOWED_EMOJIS = ["❤️", "👏", "🔥", "💡", "🙌"];
  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Ongeldige emoji" }, { status: 400 });
  }

  const [post] = await db.select().from(socialWallPosts).where(eq(socialWallPosts.id, postId));
  if (!post || post.status !== "visible") {
    return NextResponse.json({ error: "Post niet gevonden" }, { status: 404 });
  }

  const reactions = (post.reactions as Record<string, number>) ?? {};
  reactions[emoji] = (reactions[emoji] ?? 0) + 1;

  const [updated] = await db
    .update(socialWallPosts)
    .set({ reactions })
    .where(eq(socialWallPosts.id, postId))
    .returning();

  await pusherServer.trigger(getLiveChannel(post.eventId), "wall:reaction", {
    postId,
    reactions: updated.reactions,
  });

  return NextResponse.json(updated);
}
