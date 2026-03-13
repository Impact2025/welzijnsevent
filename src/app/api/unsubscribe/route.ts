import { NextRequest, NextResponse } from "next/server";
import { db, attendees } from "@/db";
import { eq } from "drizzle-orm";

// GET /api/unsubscribe?id=[attendeeId]
// Zet emailOptOut op true — geen auth vereist (link in email)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse(unsubscribePage("Ongeldige link", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const [attendee] = await db.select().from(attendees).where(eq(attendees.id, id));

  if (!attendee) {
    return new NextResponse(unsubscribePage("Deelnemer niet gevonden.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (attendee.emailOptOut) {
    return new NextResponse(unsubscribePage("Je was al uitgeschreven.", true), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  await db.update(attendees).set({ emailOptOut: true }).where(eq(attendees.id, id));

  return new NextResponse(unsubscribePage("Je bent uitgeschreven.", true), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function unsubscribePage(message: string, success: boolean) {
  const color = success ? "#2D5A3D" : "#C8522A";
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Uitschrijven</title>
</head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:420px;width:100%;margin:0 auto;padding:32px 16px;text-align:center;">
    <div style="width:64px;height:64px;border-radius:50%;background:${color}20;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
      ${success ? "✓" : "✗"}
    </div>
    <h1 style="font-size:20px;font-weight:800;color:#1C1814;margin:0 0 8px;">${success ? "Uitgeschreven" : "Fout"}</h1>
    <p style="font-size:14px;color:#5C5248;margin:0 0 24px;">${message}</p>
    <p style="font-size:12px;color:#9E9890;">
      Wil je je opnieuw aanmelden? Neem contact op met de organisator van het evenement.
    </p>
  </div>
</body>
</html>`;
}
