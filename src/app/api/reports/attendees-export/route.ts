import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, attendees, events } from "@/db";
import { eq } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const INTEREST_LABELS: Record<string, string> = {
  interest_networking:  "Netwerken",
  interest_workshops:   "Workshops",
  interest_keynotes:    "Keynotes",
  interest_innovation:  "Innovatie",
  interest_policy:      "Beleid",
  interest_practice:    "Praktijk",
};

const STATUS_LABELS: Record<string, string> = {
  aangemeld:  "Aangemeld",
  ingecheckt: "Ingecheckt",
  afwezig:    "Afwezig",
};

function escapeCell(value: string | null | undefined): string {
  const str = value ?? "";
  // RFC 4180: omsluit met aanhalingstekens als komma, aanhalingsteken of newline aanwezig
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(rows: string[][]): string {
  return rows.map(row => row.map(escapeCell).join(",")).join("\r\n");
}

function buildExcelHtml(headers: string[], rows: string[][], eventTitle: string): string {
  const headerCells = headers.map(h => `<th style="background:#C8522A;color:#fff;font-weight:bold;padding:6px 10px;">${h}</th>`).join("");
  const bodyRows = rows.map((row, i) =>
    `<tr style="background:${i % 2 === 0 ? "#FAF6F0" : "#fff"};">${row.map(cell =>
      `<td style="padding:5px 10px;border:1px solid #e5e7eb;">${cell ?? ""}</td>`
    ).join("")}</tr>`
  ).join("");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${eventTitle.slice(0, 31)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body><table border="1"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
}

export async function GET(req: Request) {
  // Rate limit: max 20 exports per IP per uur
  const ip = getClientIp(req);
  const rl = rateLimit(`export:${ip}`, 20, 60 * 60 * 1000);
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const format = searchParams.get("format") ?? "csv";

    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
    if (!["csv", "excel"].includes(format)) {
      return NextResponse.json({ error: "format moet 'csv' of 'excel' zijn" }, { status: 400 });
    }

    // Verifieer dat de org dit event bezit
    const org = await getCurrentOrg();
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event || !org || event.organizationId !== org.id) {
      return NextResponse.json({ error: "Event niet gevonden" }, { status: 404 });
    }

    const list = await db
      .select()
      .from(attendees)
      .where(eq(attendees.eventId, eventId))
      .orderBy(attendees.registeredAt);

    const headers = [
      "Naam",
      "E-mail",
      "Organisatie",
      "Functie",
      "Status",
      "Aangemeld op",
      "Ingecheckt op",
      "Interesses",
    ];

    const dataRows = list.map(a => {
      const interests = Array.isArray(a.interests)
        ? (a.interests as string[]).map(k => INTEREST_LABELS[k] ?? k).join("; ")
        : "";
      return [
        a.name,
        a.email,
        a.organization ?? "",
        a.role ?? "",
        STATUS_LABELS[a.status ?? "aangemeld"] ?? a.status ?? "",
        a.registeredAt ? formatDateTime(a.registeredAt) : "",
        a.checkedInAt  ? formatDateTime(a.checkedInAt)  : "",
        interests,
      ];
    });

    const dateStr = formatDate(new Date(), "yyyy-MM-dd");
    const slug = event.slug ?? eventId.slice(0, 8);
    const filename = `deelnemers-${slug}-${dateStr}`;

    if (format === "excel") {
      const html = buildExcelHtml(headers, dataRows, event.title);
      return new Response(html, {
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.xls"`,
        },
      });
    }

    // CSV: UTF-8 BOM zodat Excel op Windows de encoding correct leest
    const BOM = "\uFEFF";
    const csv = BOM + buildCsv([headers, ...dataRows]);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (err) {
    console.error("[attendees-export GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
