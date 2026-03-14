import { NextRequest, NextResponse } from "next/server";
import { db, attendees, events, contactProfiles } from "@/db";
import { eq, inArray, and } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { auth } from "@/auth";
import { z } from "zod";
import { Resend } from "resend";
import { organizations } from "@/db/schema";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const BodySchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  filters: z.object({
    q: z.string().optional(),
    lifecycle: z.string().optional(),
    tag: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const { subject, body: emailBody, filters = {} } = parsed.data;

  // Get org details for branding
  const [orgDetails] = await db.select().from(organizations).where(eq(organizations.id, org.id));
  const brandColor = orgDetails?.primaryColor ?? "#C8522A";
  const orgName = orgDetails?.name ?? "Bijeen";
  const orgLogo = orgDetails?.logo ?? null;

  // Get all org event IDs
  const orgEvents = await db.select({ id: events.id }).from(events).where(eq(events.organizationId, org.id));
  const eventIds = orgEvents.map(e => e.id);
  if (eventIds.length === 0) return NextResponse.json({ sent: 0, skipped: 0 });

  // Fetch unique contacts (email opt-out respected)
  const attendeeRows = await db
    .select({ email: attendees.email, name: attendees.name, emailOptOut: attendees.emailOptOut })
    .from(attendees)
    .where(inArray(attendees.eventId, eventIds));

  // Deduplicate: keep one record per email (prefer non-optout)
  const emailMap = new Map<string, { email: string; name: string; emailOptOut: boolean }>();
  for (const row of attendeeRows) {
    const key = row.email.toLowerCase();
    const existing = emailMap.get(key);
    const optOut = row.emailOptOut ?? false;
    if (!existing || (!optOut && existing.emailOptOut)) {
      emailMap.set(key, { email: row.email, name: row.name, emailOptOut: optOut });
    }
  }

  // Apply CRM profile filters (lifecycle, tag)
  let contacts = Array.from(emailMap.values());

  if (filters.lifecycle || filters.tag || filters.q) {
    const profiles = await db.select().from(contactProfiles).where(eq(contactProfiles.organizationId, org.id));
    const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p]));

    if (filters.lifecycle) {
      contacts = contacts.filter(c => {
        const p = profileMap[c.email.toLowerCase()];
        return (p?.lifecycleStage ?? "contact") === filters.lifecycle;
      });
    }
    if (filters.tag) {
      contacts = contacts.filter(c => {
        const p = profileMap[c.email.toLowerCase()];
        return ((p?.tags ?? []) as string[]).includes(filters.tag!);
      });
    }
    if (filters.q) {
      const lower = filters.q.toLowerCase();
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(lower) || c.email.toLowerCase().includes(lower)
      );
    }
  }

  // Skip opt-outs
  const toSend = contacts.filter(c => !c.emailOptOut);
  const skipped = contacts.length - toSend.length;

  if (!resend) {
    return NextResponse.json({ sent: 0, skipped, error: "E-mail niet geconfigureerd (geen RESEND_API_KEY)" });
  }

  // Send in batches of 10 to stay within rate limits
  let sent = 0;
  const BATCH = 10;
  for (let i = 0; i < toSend.length; i += BATCH) {
    const batch = toSend.slice(i, i + BATCH);
    await Promise.all(batch.map(async contact => {
      try {
        await resend.emails.send({
          from: `${orgName} <hello@bijeen.app>`,
          replyTo: "hello@bijeen.app",
          to: contact.email,
          subject,
          html: buildBulkEmailHtml({ name: contact.name, subject, body: emailBody, orgName, orgLogo, brandColor }),
        });
        sent++;
      } catch {
        // continue on individual failure
      }
    }));
  }

  return NextResponse.json({ sent, skipped });
}

function buildBulkEmailHtml({
  name, subject, body, orgName, orgLogo, brandColor,
}: {
  name: string; subject: string; body: string;
  orgName: string; orgLogo: string | null; brandColor: string;
}) {
  const firstName = name.split(" ")[0];
  const bodyHtml = body
    .split("\n")
    .map(line => line.trim() ? `<p style="color:#1C1814;font-size:15px;line-height:1.7;margin:0 0 14px;">${line}</p>` : "<br/>")
    .join("");

  const orgHeader = orgLogo
    ? `<img src="${orgLogo}" alt="${orgName}" height="36" style="height:36px;width:auto;display:inline-block;max-width:160px;" />`
    : `<span style="color:#FFFFFF;font-size:16px;font-weight:700;">${orgName}</span>`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <div style="background:${brandColor};padding:28px 32px;text-align:center;">
        ${orgHeader}
      </div>

      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 16px;">Hoi ${firstName},</p>
        ${bodyHtml}
      </div>

      <div style="padding:20px 32px;border-top:1px solid #F0E8DC;text-align:center;">
        <p style="color:#9E9890;font-size:12px;margin:0;">
          Deze mail is verzonden door <strong>${orgName}</strong> via Bijeen.
          <br/>Je ontvangt dit bericht omdat je je hebt aangemeld voor een evenement.
        </p>
      </div>
    </div>

  </div>
</body>
</html>`;
}
