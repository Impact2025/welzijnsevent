import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseCategories } from "@/db";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [cat] = await db.select().from(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, params.id));
    if (!cat) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    return NextResponse.json({ category: cat });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name        !== undefined) patch.name        = body.name;
    if (body.slug        !== undefined) patch.slug        = body.slug;
    if (body.description !== undefined) patch.description = body.description;
    if (body.icon        !== undefined) patch.icon        = body.icon;
    if (body.color       !== undefined) patch.color       = body.color;
    if (body.sortOrder   !== undefined) patch.sortOrder   = body.sortOrder;
    if (body.parentId    !== undefined) patch.parentId    = body.parentId;

    const [updated] = await db.update(knowledgeBaseCategories)
      .set(patch).where(eq(knowledgeBaseCategories.id, params.id)).returning();
    if (!updated) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

    return NextResponse.json({ category: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.delete(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
