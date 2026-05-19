import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, knowledgeBaseCategories } from "@/db";
import { asc, sql } from "drizzle-orm";

function slugify(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.email !== process.env.ADMIN_EMAIL) return null;
  return session;
}

export async function GET() {
  try {
    const cats = await db
      .select()
      .from(knowledgeBaseCategories)
      .orderBy(asc(knowledgeBaseCategories.sortOrder), asc(knowledgeBaseCategories.name));
    return NextResponse.json({ categories: cats });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, description, icon, color, sortOrder, parentId } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Naam is verplicht" }, { status: 422 });

    const baseSlug  = slugify(name);
    const existing  = await db.select({ slug: knowledgeBaseCategories.slug })
      .from(knowledgeBaseCategories)
      .where(sql`${knowledgeBaseCategories.slug} LIKE ${baseSlug + "%"}`);
    const usedSlugs = new Set(existing.map(r => r.slug));
    let   slug      = baseSlug;
    let   counter   = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${counter++}`;

    const [cat] = await db.insert(knowledgeBaseCategories).values({
      name: name.trim(), slug,
      description: description ?? null,
      icon:        icon        ?? "📚",
      color:       color       ?? "#C8522A",
      sortOrder:   sortOrder   ?? 0,
      parentId:    parentId    ?? null,
    }).returning();

    return NextResponse.json({ category: cat }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
