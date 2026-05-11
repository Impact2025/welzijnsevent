import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, volunteerMessages, organizations, orgMembers } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { Resend } from "resend";

const Schema = z.object({
  eventId:        z.string().uuid().optional(),
  vacancyId:      z.string().uuid().optional(),
  recipientEmail: z.string().email(),
  recipientName:  z.string().max(200).optional().nullable(),
  subject:        z.string().min(1).max(300),
  body:           z.string().min(1).max(5000),
});

async function getOrgForUser(userId: string) {
  const [org] = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.userId, userId)).limit(1);
  if (org) return org.id;
  const [m] = await db.select({ organizationId: orgMembers.organizationId }).from(orgMembers).where(eq(orgMembers.userId, userId)).limit(1);
  return m?.organizationId ?? null;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ongeldige invoer" }, { status: 422 });

  const orgId = await getOrgForUser(session.user.id);
  if (!orgId) return NextResponse.json({ error: "Geen organisatie" }, { status: 403 });

  const { recipientEmail, recipientName, subject, body: msgBody, eventId, vacancyId } = parsed.data;

  const [message] = await db
    .insert(volunteerMessages)
    .values({
      organizationId: orgId,
      eventId:        eventId   ?? null,
      vacancyId:      vacancyId ?? null,
      senderId:       session.user.id,
      recipientEmail,
      recipientName:  recipientName ?? null,
      subject,
      body:           msgBody,
    })
    .returning();

  // Send actual email
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  if (resend) {
    const name = recipientName ?? recipientEmail.split("@")[0];
    const paragraphs = msgBody
      .split(/\n\n+/)
      .map((p) => `<p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 16px;">${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

    await resend.emails.send({
      from:    "Bijeen <hello@bijeen.app>",
      replyTo: "hello@bijeen.app",
      to:      recipientEmail,
      subject,
      html: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="100" height="30" style="height:30px;width:auto;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8431F 100%);padding:32px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;">Bericht van de organisatie</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:15px;font-weight:700;margin:0 0 20px;">Beste ${name},</p>
        ${paragraphs}
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Vragen? Stuur een mail naar <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body></html>`,
    }).catch(() => {});
  }

  return NextResponse.json({ message }, { status: 201 });
}
