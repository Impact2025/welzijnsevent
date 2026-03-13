import { NextRequest, NextResponse } from "next/server";
import { db, events, attendees, sessionRegistrations, sessions } from "@/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { getCurrentOrg } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

function escape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(cells: unknown[]): string {
  return cells.map(escape).join(",");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return new NextResponse("Geen organisatie", { status: 403 });

  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event || event.organizationId !== org.id) {
    return new NextResponse("Geen toegang", { status: 403 });
  }

  const allAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, params.id));

  // Haal sessie-inschrijvingen op
  const allRegs = await db
    .select({
      attendeeId: sessionRegistrations.attendeeId,
      sessionTitle: sessions.title,
    })
    .from(sessionRegistrations)
    .innerJoin(sessions, eq(sessions.id, sessionRegistrations.sessionId))
    .where(eq(sessions.eventId, params.id));

  // Groepeer per deelnemer
  const regsByAttendee: Record<string, string[]> = {};
  for (const reg of allRegs) {
    const id = reg.attendeeId ?? "";
    if (!regsByAttendee[id]) regsByAttendee[id] = [];
    regsByAttendee[id].push(reg.sessionTitle);
  }

  const lines: string[] = [
    row([
      "Naam", "E-mail", "Organisatie", "Rol",
      "Status", "Ingecheckt op", "Aangemeld op",
      "Netwerken opt-in", "Sessies", "Notities",
    ]),
  ];

  for (const a of allAttendees) {
    const sessiesTitles = (regsByAttendee[a.id] ?? []).join(" | ");
    lines.push(row([
      a.name,
      a.email,
      a.organization ?? "",
      a.role ?? "",
      a.status ?? "aangemeld",
      a.checkedInAt ? formatDateTime(a.checkedInAt) : "",
      a.registeredAt ? formatDateTime(a.registeredAt) : "",
      a.networkingOptIn ? "ja" : "nee",
      sessiesTitles,
      a.notes ?? "",
    ]));
  }

  const csv = "\uFEFF" + lines.join("\r\n"); // BOM voor Excel
  const filename = `deelnemers-${event.title.replace(/\s+/g, "-").toLowerCase()}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
