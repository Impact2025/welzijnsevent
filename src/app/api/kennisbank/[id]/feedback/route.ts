import { NextResponse } from "next/server";
import { db, knowledgeBaseArticles } from "@/db";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await req.json();
    if (type !== "helpful" && type !== "notHelpful") {
      return NextResponse.json({ error: "Ongeldig type" }, { status: 422 });
    }

    const col = type === "helpful"
      ? knowledgeBaseArticles.helpfulCount
      : knowledgeBaseArticles.notHelpfulCount;

    await db.update(knowledgeBaseArticles)
      .set({ [type === "helpful" ? "helpfulCount" : "notHelpfulCount"]: sql`${col} + 1` })
      .where(eq(knowledgeBaseArticles.id, params.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
