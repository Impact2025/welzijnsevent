import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { db } from "@/db";
import { rapportLeads } from "@/db/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const Schema = z.object({
  email:            z.string().email(),
  naam:             z.string().max(200).optional(),
  organisatieNaam:  z.string().max(200).optional(),
  evenementNaam:    z.string().max(200).optional(),
  gemeente:         z.string().max(100).optional(),
  aantalDeelnemers: z.number().int().optional(),
  doelgroepen:      z.array(z.string()).optional(),
  themas:           z.array(z.string()).optional(),
  rapportHtml:      z.string().max(60000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`rapport-email:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Limiet bereikt" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const {
    email, naam, organisatieNaam, evenementNaam,
    gemeente, aantalDeelnemers, doelgroepen, themas, rapportHtml,
  } = parsed.data;

  // Sla lead op in DB
  let emailSent = false;
  try {
    if (resend) {
      // Notificatie naar intern
      await resend.emails.send({
        from:  "Bijeen Leads <hello@bijeen.app>",
        to:    "hallo@bijeen.app",
        subject: `Nieuw impactrapport-lead: ${organisatieNaam ?? email}`,
        html: `
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Naam:</strong> ${naam ?? "—"}</p>
          <p><strong>Organisatie:</strong> ${organisatieNaam ?? "—"}</p>
          <p><strong>Evenement:</strong> ${evenementNaam ?? "—"}</p>
          <p><strong>Gemeente:</strong> ${gemeente ?? "—"}</p>
          <p><strong>Deelnemers:</strong> ${aantalDeelnemers ?? "—"}</p>
          <p><strong>Doelgroepen:</strong> ${(doelgroepen ?? []).join(", ") || "—"}</p>
          <p><strong>Thema's:</strong> ${(themas ?? []).join(", ") || "—"}</p>
        `,
      });

      // Follow-up naar lead
      await resend.emails.send({
        from:    "Bijeen <hello@bijeen.app>",
        replyTo: "hallo@bijeen.app",
        to:      email,
        subject: `Uw WMO-impactrapport — ${evenementNaam ?? "uw evenement"}`,
        html:    buildLeadEmail({ naam, organisatieNaam, evenementNaam, rapportHtml }),
      });

      emailSent = true;
    }
  } catch (err) {
    console.error("E-mail versturen mislukt:", err);
  }

  // Sla altijd op in DB, ook als e-mail faalt
  try {
    await db.insert(rapportLeads).values({
      email,
      naam,
      organisatieNaam,
      evenementNaam,
      gemeente,
      aantalDeelnemers,
      doelgroepen,
      themas,
      emailSent,
    });
  } catch (err) {
    console.error("DB insert mislukt:", err);
  }

  return NextResponse.json({ ok: true });
}

function buildLeadEmail({
  naam,
  organisatieNaam,
  evenementNaam,
  rapportHtml,
}: {
  naam?: string;
  organisatieNaam?: string;
  evenementNaam?: string;
  rapportHtml: string;
}) {
  const greeting    = naam ? `Beste ${naam}` : "Geachte relatie";
  const orgLabel    = organisatieNaam ?? "uw organisatie";
  const eventLabel  = evenementNaam  ?? "uw evenement";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>WMO-impactrapport — ${eventLabel}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="max-width:680px;margin:0 auto;padding:32px 16px;">

  <div style="text-align:center;margin-bottom:24px;">
    <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40"
         style="height:40px;width:40px;border-radius:8px;" />
  </div>

  <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

    <div style="background:linear-gradient(135deg,#C8522A 0%,#9E3E1C 100%);padding:40px 32px;text-align:center;">
      <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">
        WMO-impactrapportage
      </p>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.3px;">
        ${eventLabel}
      </h1>
      <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${orgLabel}</p>
    </div>

    <div style="padding:36px 32px;">
      <p style="color:#1C1814;font-size:15px;font-weight:700;margin:0 0 12px;">${greeting},</p>
      <p style="color:#5C5248;font-size:14px;line-height:1.75;margin:0 0 28px;">
        In de bijlage hieronder vindt u het WMO-impactrapport voor <strong>${eventLabel}</strong>.
        Dit rapport is gegenereerd op basis van de door u aangeleverde gegevens en is direct
        bruikbaar als bijlage bij uw subsidieaanvraag of verantwoording.
      </p>

      <div style="background:#FAF6F0;border:1px solid #F0E8DC;border-radius:14px;padding:28px 30px;
                  margin:0 0 32px;font-size:14px;line-height:1.8;color:#1C1814;">
        <p style="color:#9E9890;font-size:10px;font-weight:700;text-transform:uppercase;
                  letter-spacing:0.08em;margin:0 0 16px;border-bottom:1px solid #F0E8DC;padding-bottom:10px;">
          Rapport — ${eventLabel}
        </p>
        ${rapportHtml}
      </div>

      <div style="background:linear-gradient(135deg,#FFF0EB,#FFE4D6);border:1px solid #F5D4C4;
                  border-radius:14px;padding:24px 28px;margin:0 0 24px;">
        <p style="color:#1C1814;font-size:14px;font-weight:700;margin:0 0 8px;">
          Dit rapport automatisch na elk event?
        </p>
        <p style="color:#5C5248;font-size:13px;line-height:1.65;margin:0 0 18px;">
          Met Bijeen genereert u dit rapport automatisch na elk evenement — inclusief echte data
          over opkomst, tevredenheid per sessie en netwerkverbindingen. Geen handmatig invullen meer.
        </p>
        <a href="https://bijeen.app/sign-in?new=true&utm_source=rapport_email&utm_medium=email&utm_campaign=leadgen"
           style="display:inline-block;background:#C8522A;color:#fff;text-decoration:none;
                  font-weight:700;font-size:13px;padding:13px 26px;border-radius:10px;">
          Gratis starten — geen creditcard
        </a>
      </div>

      <p style="color:#B0A89E;font-size:11px;line-height:1.6;margin:0;">
        Dit rapport is gegenereerd via de gratis rapportgenerator van
        <a href="https://bijeen.app" style="color:#C8522A;text-decoration:none;">bijeen.app</a>,
        het evenementenplatform voor welzijnsorganisaties. Nederlandse servers · AVG-compliant.
      </p>
    </div>
  </div>
</div>
</body>
</html>`;
}
