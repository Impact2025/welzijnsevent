import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { db } from "@/db";
import { demoRequests } from "@/db/schema";
import { sendDemoRequestConfirmation, sendAdminDemoRequestNotification } from "@/lib/email";

const Schema = z.object({
  naam:             z.string().trim().min(1).max(200),
  email:            z.string().trim().email(),
  telefoon:         z.string().trim().max(50).optional(),
  organisatieNaam:  z.string().trim().min(1).max(200),
  organisatieType:  z.string().trim().max(100).optional(),
  functie:          z.string().trim().max(100).optional(),
  eventsPerJaar:    z.string().trim().max(50).optional(),
  interesses:       z.array(z.string().max(100)).max(20).optional(),
  toelichting:      z.string().trim().max(2000).optional(),
  sociaalTarief:    z.boolean().optional(),
  voorkeursmoment:  z.string().trim().max(50).optional(),
  gewensteWeek:     z.string().trim().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`demo-aanvraag:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: "Limiet bereikt" }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const {
    naam, email, telefoon, organisatieNaam, organisatieType, functie,
    eventsPerJaar, interesses, toelichting, sociaalTarief, voorkeursmoment, gewensteWeek,
  } = parsed.data;

  let emailSent = false;
  try {
    await sendAdminDemoRequestNotification({
      naam, email, telefoon, organisatieNaam, organisatieType, functie,
      eventsPerJaar, interesses, toelichting, sociaalTarief: !!sociaalTarief,
      voorkeursmoment, gewensteWeek,
    });
    await sendDemoRequestConfirmation({
      to: email, naam, organisatieNaam,
      sociaalTarief: !!sociaalTarief, voorkeursmoment,
    });
    emailSent = true;
  } catch (err) {
    console.error("Demo-aanvraag e-mail versturen mislukt:", err);
  }

  try {
    await db.insert(demoRequests).values({
      naam, email, telefoon, organisatieNaam, organisatieType, functie,
      eventsPerJaar, interesses, toelichting, sociaalTarief: !!sociaalTarief,
      voorkeursmoment, gewensteWeek, emailSent,
    });
  } catch (err) {
    console.error("Demo-aanvraag DB insert mislukt:", err);
    return NextResponse.json({ error: "Opslaan mislukt" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
