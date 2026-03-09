import { NextResponse } from "next/server";
import { db, organizations } from "@/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [org] = await db.select().from(organizations);
    return NextResponse.json({ organization: org ?? null });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const [updated] = await db
      .update(organizations)
      .set(data)
      .where(eq(organizations.id, id))
      .returning();

    return NextResponse.json({ organization: updated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
