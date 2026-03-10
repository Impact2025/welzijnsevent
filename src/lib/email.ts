import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ConfirmationEmailProps {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  qrCode: string;
  appUrl: string;
}

export async function sendRegistrationConfirmation(props: ConfirmationEmailProps) {
  if (!resend) {
    console.warn("RESEND_API_KEY niet geconfigureerd — e-mail niet verstuurd");
    return;
  }

  const { to, name, eventTitle, eventDate, eventLocation, qrCode, appUrl } = props;
  const ticketUrl = `${appUrl}/ticket/${qrCode}`;

  await resend.emails.send({
    from: "Bijeen <noreply@bijeen.app>",
    to,
    subject: `Je aanmelding is bevestigd: ${eventTitle}`,
    html: buildConfirmationHtml({ name, eventTitle, eventDate, eventLocation, ticketUrl }),
  });
}

function buildConfirmationHtml({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  ticketUrl,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  ticketUrl: string;
}) {
  const locationRow = eventLocation
    ? `<tr>
        <td style="padding: 6px 0; vertical-align: top;">
          <span style="color: #9E9890; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Locatie</span>
          <span style="color: #1C1814; font-size: 14px; font-weight: 600;">📍 ${eventLocation}</span>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aanmelding bevestigd – ${eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 560px; margin: 0 auto; padding: 32px 16px;">

    <!-- Logo/Brand -->
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height: 40px; width: auto; display: inline-block;" />
    </div>

    <!-- Card -->
    <div style="background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #C8522A 0%, #A8421F 100%); padding: 32px; text-align: center;">
        <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 26px; line-height: 1;">🎉</div>
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.3px;">Je aanmelding is bevestigd!</h1>
        <p style="color: rgba(255,255,255,0.82); font-size: 14px; margin: 0; font-weight: 500;">${eventTitle}</p>
      </div>

      <!-- Body -->
      <div style="padding: 32px;">
        <p style="color: #1C1814; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Hoi ${name},</p>
        <p style="color: #6B6560; font-size: 14px; line-height: 1.7; margin: 0 0 28px;">
          Geweldig dat je erbij bent! Je bent succesvol aangemeld. Hieronder vind je alle details en je persoonlijke toegangscode.
        </p>

        <!-- Event details -->
        <div style="background: #FAF6F0; border-radius: 14px; padding: 20px; margin: 0 0 28px;">
          <p style="color: #9E9890; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">Evenementdetails</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #EDE8E1;">
                <span style="color: #9E9890; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Evenement</span>
                <span style="color: #1C1814; font-size: 14px; font-weight: 700;">${eventTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; border-bottom: 1px solid #EDE8E1;">
                <span style="color: #9E9890; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Datum</span>
                <span style="color: #1C1814; font-size: 14px; font-weight: 600;">📅 ${eventDate}</span>
              </td>
            </tr>
            ${locationRow}
          </table>
        </div>

        <!-- QR Code CTA -->
        <div style="background: linear-gradient(135deg, #FFF4EF 0%, #FFEEE6 100%); border: 1px solid #F5D4C4; border-radius: 14px; padding: 20px; margin: 0 0 28px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">📲</div>
          <p style="color: #1C1814; font-size: 14px; font-weight: 700; margin: 0 0 6px;">Je persoonlijke QR-code</p>
          <p style="color: #6B6560; font-size: 12px; line-height: 1.6; margin: 0 0 16px;">
            Gebruik deze QR-code voor snelle toegang op de dag zelf. Laat hem scannen bij de ingang.
          </p>
          <a href="${ticketUrl}"
             style="display: inline-block; background: #C8522A; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 10px; letter-spacing: -0.2px;">
            Bekijk mijn QR-ticket →
          </a>
        </div>

        <!-- Network teaser -->
        <div style="background: #F0F7F2; border: 1px solid #C8E0CE; border-radius: 14px; padding: 16px; margin: 0 0 8px;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 20px; flex-shrink: 0;">🤝</span>
            <div>
              <p style="color: #2D5A3D; font-size: 13px; font-weight: 700; margin: 0 0 4px;">Netwerken via AI-matching</p>
              <p style="color: #4A7A59; font-size: 12px; line-height: 1.6; margin: 0;">
                Op de community-pagina vind je vóór het evenement je aanbevolen gesprekspartners — geselecteerd op basis van jouw profiel en interesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 0 0;">
      <p style="color: #B8B3AC; font-size: 12px; line-height: 1.6; margin: 0;">
        Verstuurd via <strong style="color: #9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector<br>
        <a href="${ticketUrl}" style="color: #B8B3AC; text-decoration: underline;">Bekijk je ticket</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
