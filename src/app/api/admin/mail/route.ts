import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Resend } from "resend";

function isAdmin(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;
  return adminEmail && email === adminEmail;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY niet ingesteld" }, { status: 500 });
  }

  const { to, orgName, subject, message } = await req.json();

  if (!to || !subject || !message) {
    return NextResponse.json({ error: "to, subject en message zijn verplicht" }, { status: 400 });
  }

  const resend = new Resend(apiKey);

  const html = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A,#2D5A3D);padding:32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0;line-height:1.3;">
          Bericht van Bijeen
        </h1>
      </div>
      <div style="padding:32px;">
        ${orgName ? `<p style="color:#6B5E54;font-size:14px;margin:0 0 16px 0;">Beste ${orgName},</p>` : ""}
        <div style="color:#1C1814;font-size:15px;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <div style="margin-top:32px;padding-top:24px;border-top:1px solid #F0EAE2;text-align:center;">
          <p style="color:#A09890;font-size:12px;margin:0;">
            Dit bericht is verzonden door het Bijeen team.<br/>
            Antwoord op deze e-mail om contact op te nemen.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: "Bijeen <hello@bijeen.app>",
      replyTo: "hello@bijeen.app",
      to,
      subject,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mail send error:", err);
    return NextResponse.json({ error: "Verzenden mislukt" }, { status: 500 });
  }
}
