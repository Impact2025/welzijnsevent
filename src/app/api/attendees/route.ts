import { NextResponse } from "next/server";
import { db, attendees } from "@/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId));

    return NextResponse.json({ attendees: list });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [attendee] = await db.insert(attendees).values({
      eventId:      body.eventId,
      name:         body.name,
      email:        body.email,
      organization: body.organization,
      role:         body.role,
      status:       "aangemeld",
      qrCode:       randomUUID(),
    }).returning();

    return NextResponse.json({ attendee }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
