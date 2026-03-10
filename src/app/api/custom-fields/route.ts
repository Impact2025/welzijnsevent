import { NextRequest, NextResponse } from "next/server";
import { db, customFormFields, events } from "@/db";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";

// GET — haal custom velden op voor event (ook publiek, voor inschrijfformulier)
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId vereist" }, { status: 400 });

  const fields = await db
    .select()
    .from(customFormFields)
    .where(eq(customFormFields.eventId, eventId))
    .orderBy(asc(customFormFields.sortOrder), asc(customFormFields.createdAt));

  return NextResponse.json(fields);
}

// POST — maak nieuw custom veld aan
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { eventId, label, type, options, required, sortOrder } = await req.json();

  if (!eventId || !label?.trim() || !type) {
    return NextResponse.json({ error: "eventId, label en type zijn vereist" }, { status: 400 });
  }

  const VALID_TYPES = ["text", "textarea", "select", "checkbox", "yesno"];
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Ongeldig veldtype" }, { status: 400 });
  }

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const [field] = await db
    .insert(customFormFields)
    .values({
      eventId,
      label: label.trim(),
      type,
      options: options ?? [],
      required: required ?? false,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json(field, { status: 201 });
}

// DELETE — verwijder custom veld
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { fieldId } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId vereist" }, { status: 400 });

  const [field] = await db
    .select({ id: customFormFields.id, eventId: customFormFields.eventId })
    .from(customFormFields)
    .where(eq(customFormFields.id, fieldId));

  if (!field) return NextResponse.json({ error: "Veld niet gevonden" }, { status: 404 });

  const [event] = await db.select().from(events).where(eq(events.id, field.eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  await db.delete(customFormFields).where(eq(customFormFields.id, fieldId));
  return NextResponse.json({ ok: true });
}

// PATCH — update custom veld (label, opties, volgorde)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { fieldId, label, options, required, sortOrder } = await req.json();
  if (!fieldId) return NextResponse.json({ error: "fieldId vereist" }, { status: 400 });

  const [field] = await db.select().from(customFormFields).where(eq(customFormFields.id, fieldId));
  if (!field) return NextResponse.json({ error: "Veld niet gevonden" }, { status: 404 });

  const [event] = await db.select().from(events).where(eq(events.id, field.eventId));
  if (!event || event.organizationId !== org.id) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const updates: Partial<typeof field> = {};
  if (label !== undefined) updates.label = label.trim();
  if (options !== undefined) updates.options = options;
  if (required !== undefined) updates.required = required;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;

  const [updated] = await db
    .update(customFormFields)
    .set(updates)
    .where(eq(customFormFields.id, fieldId))
    .returning();

  return NextResponse.json(updated);
}
