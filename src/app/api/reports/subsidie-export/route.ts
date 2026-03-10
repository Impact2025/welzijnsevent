export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db, events, attendees, feedback, networkMatches, sessions, sessionRegistrations, organizations } from "@/db";
import { eq, count, avg, and } from "drizzle-orm";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return new NextResponse("eventId verplicht", { status: 400 });
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return new NextResponse("Evenement niet gevonden", { status: 404 });

    // Organisatie
    const [org] = event.organizationId
      ? await db.select().from(organizations).where(eq(organizations.id, event.organizationId))
      : [null];

    // Deelnemers
    const allAttendees = await db.select().from(attendees).where(eq(attendees.eventId, eventId));
    const totalRegistered = allAttendees.length;
    const totalCheckedIn = allAttendees.filter((a) => a.status === "ingecheckt").length;
    const attendanceRate =
      totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

    // Rolverdeling
    const roleCounts: Record<string, number> = {};
    for (const a of allAttendees) {
      const role = a.role?.trim() || "Niet opgegeven";
      roleCounts[role] = (roleCounts[role] ?? 0) + 1;
    }
    const roleRows = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([role, n]) => ({ role, n, pct: Math.round((n / totalRegistered) * 100) }));

    // Organisatieverdeling (top 5)
    const orgCounts: Record<string, number> = {};
    for (const a of allAttendees) {
      const o = a.organization?.trim() || "Onbekend";
      orgCounts[o] = (orgCounts[o] ?? 0) + 1;
    }
    const orgRows = Object.entries(orgCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([orgName, n]) => ({ orgName, n }));

    // Tevredenheid
    const [{ avg: avgRatingRaw }] = await db
      .select({ avg: avg(feedback.rating) })
      .from(feedback)
      .where(eq(feedback.eventId, eventId));
    const avgRating = avgRatingRaw ? parseFloat(avgRatingRaw) : null;
    const [{ count: feedbackCount }] = await db
      .select({ count: count() })
      .from(feedback)
      .where(eq(feedback.eventId, eventId));

    // Netwerk matches (nieuwe verbindingen)
    const [{ count: matchCount }] = await db
      .select({ count: count() })
      .from(networkMatches)
      .where(eq(networkMatches.eventId, eventId));

    // Sessies
    const eventSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.eventId, eventId));

    const sessionData = await Promise.all(
      eventSessions.map(async (s) => {
        const [{ count: regCount }] = await db
          .select({ count: count() })
          .from(sessionRegistrations)
          .where(eq(sessionRegistrations.sessionId, s.id));
        const [{ avg: sAvg }] = await db
          .select({ avg: avg(feedback.rating) })
          .from(feedback)
          .where(eq(feedback.sessionId, s.id));
        return {
          title: s.title,
          speaker: s.speaker,
          regCount: Number(regCount),
          capacity: s.capacity,
          fill:
            s.capacity && Number(regCount) > 0
              ? Math.min(100, Math.round((Number(regCount) / s.capacity) * 100))
              : null,
          rating: sAvg ? parseFloat(sAvg).toFixed(1) : null,
        };
      })
    );

    const rapportDatum = format(new Date(), "d MMMM yyyy", { locale: nl });
    const eventDatum = format(event.startsAt, "d MMMM yyyy", { locale: nl });
    const eventTijd = `${format(event.startsAt, "HH:mm")}–${format(event.endsAt, "HH:mm")}`;

    const starsHtml = (rating: number) => {
      const full = Math.round(rating);
      return [1, 2, 3, 4, 5]
        .map((i) => `<span style="color:${i <= full ? "#C8522A" : "#DDD8D0"}">★</span>`)
        .join("");
    };

    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Subsidie Impactrapportage – ${event.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #1C1814;
      background: #FAF6F0;
      padding: 32px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #C8522A; color: white; padding: 32px 40px; }
    .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .header .sub { opacity: 0.82; font-size: 13px; }
    .header .meta { margin-top: 16px; display: flex; gap: 24px; flex-wrap: wrap; }
    .header .meta-item { font-size: 12px; opacity: 0.9; }
    .header .meta-item strong { display: block; opacity: 1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; opacity: 0.7; }
    .content { padding: 32px 40px; }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #9E9890; margin-bottom: 12px;
      padding-bottom: 6px; border-bottom: 1px solid #EDE8E1;
    }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .kpi-card {
      background: #FAF6F0; border-radius: 12px; padding: 16px; text-align: center;
    }
    .kpi-number { font-size: 28px; font-weight: 800; color: #C8522A; line-height: 1; }
    .kpi-label { font-size: 11px; color: #9E9890; margin-top: 4px; font-weight: 600; }
    .kpi-sub { font-size: 10px; color: #B8B3AC; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #9E9890; text-align: left; padding: 8px 12px; background: #FAF6F0; }
    td { padding: 8px 12px; border-bottom: 1px solid #F0EBE4; font-size: 12px; color: #1C1814; }
    tr:last-child td { border-bottom: none; }
    .progress-bar { height: 6px; background: #EDE8E1; border-radius: 999px; overflow: hidden; margin-top: 4px; }
    .progress-fill { height: 100%; background: #C8522A; border-radius: 999px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .badge-green { background: #D1FAE5; color: #065F46; }
    .badge-terra { background: #FDEEDD; color: #9A3412; }
    .info-box {
      background: #F0F7F2; border: 1px solid #C8E0CE; border-radius: 12px;
      padding: 16px 20px; margin-bottom: 12px;
    }
    .info-box h3 { font-size: 12px; font-weight: 700; color: #2D5A3D; margin-bottom: 6px; }
    .info-box p { font-size: 12px; color: #4A7A59; line-height: 1.6; }
    .signature-box {
      border: 1px dashed #DDD8D0; border-radius: 12px; padding: 20px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 8px;
    }
    .signature-field { }
    .signature-field .label { font-size: 10px; color: #9E9890; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 32px; }
    .signature-field .line { border-bottom: 1px solid #DDD8D0; margin-bottom: 6px; }
    .signature-field .name-line { font-size: 11px; color: #B8B3AC; }
    .footer { padding: 16px 40px; border-top: 1px solid #EDE8E1; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 11px; color: #B8B3AC; }
    @media print {
      body { background: white; padding: 0; }
      .page { border-radius: 0; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center; padding: 16px 0 24px; font-family: sans-serif;">
    <button onclick="window.print()"
      style="background:#C8522A; color:white; border:none; padding:12px 28px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer;">
      📄 Opslaan als PDF
    </button>
    <p style="color:#9E9890; font-size:12px; margin-top:8px;">Gebruik Ctrl+P of de knop hierboven → Opslaan als PDF</p>
  </div>

  <div class="page">
    <!-- Header -->
    <div class="header">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <div style="font-size:11px; font-weight:700; opacity:0.7; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">
            Subsidie Impactrapportage
          </div>
          <h1>${event.title}</h1>
          <p class="sub">${org?.name ?? "Welzijnsorganisatie"}</p>
        </div>
        <div style="text-align:right; font-size:11px; opacity:0.8;">
          <div>Rapportdatum: ${rapportDatum}</div>
          <div style="margin-top:4px; font-size:10px; opacity:0.7;">WMO art. 2.1.4 / IZA</div>
        </div>
      </div>
      <div class="meta">
        <div class="meta-item"><strong>Datum</strong>${eventDatum}</div>
        <div class="meta-item"><strong>Tijd</strong>${eventTijd}</div>
        ${event.location ? `<div class="meta-item"><strong>Locatie</strong>${event.location}</div>` : ""}
        <div class="meta-item"><strong>Organisatie</strong>${org?.name ?? "–"}</div>
      </div>
    </div>

    <div class="content">

      <!-- KPI Samenvatting -->
      <div class="section">
        <div class="section-title">Kern KPI's — Maatschappelijk Bereik</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-number">${totalRegistered}</div>
            <div class="kpi-label">Aangemeld</div>
            <div class="kpi-sub">deelnemers bereikt</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-number">${totalCheckedIn}</div>
            <div class="kpi-label">Aanwezig</div>
            <div class="kpi-sub">${attendanceRate}% opkomstpercentage</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-number" style="font-size:22px;">${avgRating ? avgRating.toFixed(1) : "–"}</div>
            <div class="kpi-label">Tevredenheid</div>
            <div class="kpi-sub">${avgRating ? starsHtml(avgRating) : "geen feedback"}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-number">${matchCount}</div>
            <div class="kpi-label">Verbindingen</div>
            <div class="kpi-sub">nieuwe contacten gelegd</div>
          </div>
        </div>
      </div>

      <!-- WMO/IZA Toelichting -->
      <div class="section">
        <div class="section-title">WMO / IZA Verantwoording</div>
        <div class="info-box">
          <h3>Maatschappelijke meerwaarde</h3>
          <p>
            Met dit evenement zijn ${totalRegistered} personen uit de welzijnssector bereikt,
            waarvan ${totalCheckedIn} fysiek aanwezig (${attendanceRate}% opkomst).
            Er zijn ${matchCount} nieuwe professionele verbindingen gelegd via het netwerkmatchingssysteem.
            ${avgRating ? `De gemiddelde tevredenheid bedroeg ${avgRating.toFixed(1)}/5, gebaseerd op ${feedbackCount} evaluaties.` : ""}
          </p>
        </div>
        <div class="info-box">
          <h3>Bijdrage aan IZA-doelstellingen</h3>
          <p>
            Dit evenement draagt bij aan de doelstellingen van het Integraal Zorgakkoord (IZA) door het versterken van samenwerking
            tussen zorg- en welzijnsorganisaties, het bevorderen van kennisdeling en het faciliteren van
            netwerkontwikkeling in de regio.
          </p>
        </div>
      </div>

      <!-- Doelgroepverdeling -->
      ${
        roleRows.length > 0
          ? `<div class="section">
          <div class="section-title">Doelgroepverdeling (WMO Monitoring)</div>
          <table>
            <thead><tr><th>Rol / Doelgroep</th><th>Aantal</th><th>Aandeel</th><th style="width:35%">Verdeling</th></tr></thead>
            <tbody>
              ${roleRows
                .map(
                  (r) => `<tr>
                <td style="font-weight:600;">${r.role}</td>
                <td>${r.n}</td>
                <td><span class="badge badge-terra">${r.pct}%</span></td>
                <td><div class="progress-bar"><div class="progress-fill" style="width:${r.pct}%"></div></div></td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`
          : ""
      }

      <!-- Organisaties -->
      ${
        orgRows.length > 0
          ? `<div class="section">
          <div class="section-title">Vertegenwoordigde Organisaties (top ${orgRows.length})</div>
          <table>
            <thead><tr><th>Organisatie</th><th>Deelnemers</th></tr></thead>
            <tbody>
              ${orgRows
                .map(
                  (o) => `<tr>
                <td>${o.orgName}</td>
                <td>${o.n}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`
          : ""
      }

      <!-- Sessieoverzicht -->
      ${
        sessionData.length > 0
          ? `<div class="section">
          <div class="section-title">Sessieoverzicht & Bezettingsgraad</div>
          <table>
            <thead><tr><th>Sessie</th><th>Spreker</th><th>Registraties</th><th>Bezetting</th><th>Score</th></tr></thead>
            <tbody>
              ${sessionData
                .map(
                  (s) => `<tr>
                <td style="font-weight:600;">${s.title}</td>
                <td style="color:#6B6560;">${s.speaker ?? "–"}</td>
                <td>${s.regCount}</td>
                <td>${s.fill !== null ? `<span class="badge badge-green">${s.fill}%</span>` : "–"}</td>
                <td>${s.rating ? `${s.rating} ★` : "–"}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>`
          : ""
      }

      <!-- Tevredenheid detail -->
      ${
        avgRating
          ? `<div class="section">
          <div class="section-title">Tevredenheidsanalyse</div>
          <table>
            <thead><tr><th>Indicator</th><th>Waarde</th><th>Beoordeling</th></tr></thead>
            <tbody>
              <tr>
                <td>Gemiddeld tevredenheidscijfer</td>
                <td style="font-weight:700; color:#C8522A;">${avgRating.toFixed(1)} / 5.0</td>
                <td>${starsHtml(avgRating)} (${Number(feedbackCount)} evaluaties)</td>
              </tr>
              <tr>
                <td>Opkomstpercentage</td>
                <td style="font-weight:700;">${attendanceRate}%</td>
                <td><span class="badge ${attendanceRate >= 70 ? "badge-green" : "badge-terra"}">${attendanceRate >= 80 ? "Uitstekend" : attendanceRate >= 60 ? "Goed" : "Matig"}</span></td>
              </tr>
              <tr>
                <td>Nieuwe verbindingen</td>
                <td style="font-weight:700;">${matchCount}</td>
                <td>via AI-netwerkmatchmaking</td>
              </tr>
            </tbody>
          </table>
        </div>`
          : ""
      }

      <!-- Handtekeningen -->
      <div class="section">
        <div class="section-title">Ondertekening & Verificatie</div>
        <div class="signature-box">
          <div class="signature-field">
            <div class="label">Verantwoordelijk organisator</div>
            <div class="line">&nbsp;</div>
            <div class="name-line">Naam + handtekening</div>
          </div>
          <div class="signature-field">
            <div class="label">Datum verificatie</div>
            <div class="line">&nbsp;</div>
            <div class="name-line">Datum</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" style="height: 24px; width: auto; opacity: 0.6;" />
      <p>Rapport gegenereerd op ${rapportDatum}</p>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("subsidie-export fout:", err);
    return new NextResponse("Interne serverfout", { status: 500 });
  }
}
