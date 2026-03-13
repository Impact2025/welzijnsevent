import { NextResponse } from "next/server";
import { db, events, sessions } from "@/db";
import { eq, asc } from "drizzle-orm";

// iCal date format: YYYYMMDDTHHMMSSZ (UTC)
function formatIcalDate(date: Date | string): string {
  return new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Escape special characters per RFC 5545
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Fold lines >75 chars per RFC 5545 §3.1
function fold(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    chunks.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n");
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, params.slug));

  if (!event || !event.isPublic) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const eventSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.eventId, event.id))
    .orderBy(asc(sessions.sortOrder));

  const now = formatIcalDate(new Date());
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://bijeen.app";

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bijeen//Welzijnsevent//NL",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:${esc(event.title)}`),
    "X-WR-TIMEZONE:Europe/Amsterdam",
    // ── Main event ──────────────────────────────────────────
    "BEGIN:VEVENT",
    `UID:event-${event.id}@bijeen.app`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcalDate(event.startsAt)}`,
    `DTEND:${formatIcalDate(event.endsAt)}`,
    fold(`SUMMARY:${esc(event.title)}`),
  ];

  if (event.description) lines.push(fold(`DESCRIPTION:${esc(event.description)}`));
  if (event.location || event.address) {
    lines.push(fold(`LOCATION:${esc(event.address ?? event.location ?? "")}`));
  }
  if (event.slug) lines.push(`URL:${baseUrl}/e/${event.slug}`);

  lines.push("END:VEVENT");

  // ── Sessions as sub-events ─────────────────────────────────
  for (const session of eventSessions) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:session-${session.id}@bijeen.app`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatIcalDate(session.startsAt)}`,
      `DTEND:${formatIcalDate(session.endsAt)}`,
      fold(`SUMMARY:${esc(session.title)}`),
    );

    if (session.description) lines.push(fold(`DESCRIPTION:${esc(session.description)}`));
    if (session.location)    lines.push(fold(`LOCATION:${esc(session.location)}`));
    if (session.speaker) {
      const credit = session.speakerOrg
        ? `${session.speaker} · ${session.speakerOrg}`
        : session.speaker;
      lines.push(fold(`COMMENT:Spreker: ${esc(credit)}`));
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug ?? event.id}.ics"`,
      "Cache-Control": "no-cache, no-store",
    },
  });
}
