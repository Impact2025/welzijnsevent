import { NextRequest, NextResponse } from "next/server";
import { db, events, attendees } from "@/db";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { randomUUID } from "crypto";
import { z } from "zod";

const RowSchema = z.object({
  name:         z.string().min(1).max(200),
  email:        z.string().email().max(320),
  organization: z.string().max(200).optional(),
  role:         z.string().max(100).optional(),
});

const Schema = z.object({
  eventId: z.string().uuid(),
  rows:    z.array(RowSchema).min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { eventId, rows } = parsed.data;

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  // Fetch existing emails to skip duplicates
  const emails = rows.map(r => r.email.toLowerCase());
  const existing = await db
    .select({ email: attendees.email })
    .from(attendees)
    .where(and(eq(attendees.eventId, eventId), inArray(attendees.email, emails)));
  const existingEmails = new Set(existing.map(e => e.email.toLowerCase()));

  const toInsert = rows.filter(r => !existingEmails.has(r.email.toLowerCase()));

  if (toInsert.length > 0) {
    await db.insert(attendees).values(
      toInsert.map(r => ({
        id:           randomUUID(),
        eventId,
        name:         r.name,
        email:        r.email,
        organization: r.organization ?? null,
        role:         r.role ?? null,
        status:       "aangemeld" as const,
        qrCode:       randomUUID(),
        registeredAt: new Date(),
      }))
    );
  }

  return NextResponse.json({ created: toInsert.length, skipped: rows.length - toInsert.length });
}
