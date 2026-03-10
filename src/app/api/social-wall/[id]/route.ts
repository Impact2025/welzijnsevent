import { NextRequest, NextResponse } from "next/server";
import { db, socialWallPosts } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { pusherServer, getLiveChannel } from "@/lib/pusher";

// PATCH — modereren (verbergen/tonen) — alleen voor organisator
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { status } = await req.json();
  if (!["visible", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Ongeldig status" }, { status: 400 });
  }

  const [post] = await db.select().from(socialWallPosts).where(eq(socialWallPosts.id, params.id));
  if (!post) return NextResponse.json({ error: "Post niet gevonden" }, { status: 404 });

  const [updated] = await db
    .update(socialWallPosts)
    .set({ status })
    .where(eq(socialWallPosts.id, params.id))
    .returning();

  await pusherServer.trigger(getLiveChannel(post.eventId), "wall:moderated", {
    postId: params.id,
    status,
  });

  return NextResponse.json(updated);
}

// DELETE — verwijder post — alleen voor organisator
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const [post] = await db.select().from(socialWallPosts).where(eq(socialWallPosts.id, params.id));
  if (!post) return NextResponse.json({ error: "Post niet gevonden" }, { status: 404 });

  await db.delete(socialWallPosts).where(eq(socialWallPosts.id, params.id));

  await pusherServer.trigger(getLiveChannel(post.eventId), "wall:deleted", { postId: params.id });

  return NextResponse.json({ ok: true });
}
