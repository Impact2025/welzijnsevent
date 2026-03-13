import { NextRequest, NextResponse } from "next/server";
import { db, attendees, events, organizations } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { z } from "zod";

async function getAttendeeWithAuth(attendeeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", status: 401 };

  const org = await getCurrentOrg();
  if (!org) return { error: "Geen organisatie", status: 403 };

  const [attendee] = await db.select().from(attendees).where(eq(attendees.id, attendeeId));
  if (!attendee) return { error: "Deelnemer niet gevonden", status: 404 };

  const [event] = await db.select().from(events).where(eq(events.id, attendee.eventId));
  if (!event || event.organizationId !== org.id) return { error: "Geen toegang", status: 403 };

  return { attendee, event, org };
}

const PatchSchema = z.object({
  notes:  z.string().max(2000).optional().nullable(),
  status: z.enum(["aangemeld", "ingecheckt", "afwezig"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getAttendeeWithAuth(params.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const [updated] = await db
    .update(attendees)
    .set({ ...parsed.data })
    .where(eq(attendees.id, params.id))
    .returning();

  return NextResponse.json({ attendee: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await getAttendeeWithAuth(params.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  await db.delete(attendees).where(eq(attendees.id, params.id));
  return NextResponse.json({ success: true });
}
