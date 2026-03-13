import { NextRequest, NextResponse } from "next/server";
import { db, events, attendees } from "@/db";
import { eq, and, not, or } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { sendCustomBroadcast } from "@/lib/email";
import { z } from "zod";

const Schema = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  segment: z.enum(["all", "aangemeld", "ingecheckt"]).default("all"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { subject, message, segment } = parsed.data;

  const conditions = [
    eq(attendees.eventId, params.id),
    not(attendees.emailOptOut),
  ];
  if (segment === "aangemeld") conditions.push(eq(attendees.status, "aangemeld"));
  if (segment === "ingecheckt") conditions.push(eq(attendees.status, "ingecheckt"));
  if (segment === "all") conditions.push(
    or(eq(attendees.status, "aangemeld"), eq(attendees.status, "ingecheckt"))!
  );

  const targets = await db
    .select()
    .from(attendees)
    .where(and(...conditions));

  // Batch 100 per run
  const batch = targets.slice(0, 100);
  await Promise.allSettled(
    batch.map(a =>
      sendCustomBroadcast({
        to: a.email,
        attendeeName: a.name,
        eventTitle: event.title,
        subject,
        message,
      })
    )
  );

  return NextResponse.json({ sent: batch.length, total: targets.length });
}
