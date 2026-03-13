import { Resend } from "resend";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/lib/plans";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const REPLY_TO = "hello@bijeen.app";

// ─── Organisatie: welkomstmail (trial) ───────────────────────────────────────

interface WelcomeTrialEmailProps {
  to: string;
  firstName: string;
  orgName: string;
  trialEndsAt: Date;
  dashboardUrl: string;
}

export async function sendWelcomeTrialEmail(props: WelcomeTrialEmailProps) {
  if (!resend) return;
  const { to, firstName, orgName, trialEndsAt, dashboardUrl } = props;
  const expiryFormatted = trialEndsAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Welkom bij Bijeen, ${firstName}! Je proefperiode is gestart`,
    html: buildWelcomeTrialHtml({ firstName, orgName, expiryFormatted, dashboardUrl }),
  });
}

function buildWelcomeTrialHtml({ firstName, orgName, expiryFormatted, dashboardUrl }: {
  firstName: string; orgName: string; expiryFormatted: string; dashboardUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij Bijeen</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;display:inline-block;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2D5A3D 0%,#1E3D29 100%);padding:40px 32px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:32px;line-height:1;">🌱</div>
        <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Welkom bij Bijeen!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;font-weight:500;">${orgName}</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Geweldig dat je Bijeen gaat gebruiken voor jouw organisatie. Je proefperiode van 14 dagen is gestart — volledig gratis, geen betaalgegevens nodig.
        </p>

        <!-- Trial info box -->
        <div style="background:linear-gradient(135deg,#FFF4EF 0%,#FFEEE6 100%);border:1px solid #F5D4C4;border-radius:14px;padding:20px 24px;margin:0 0 28px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Je proefperiode</p>
          <p style="color:#C8522A;font-size:22px;font-weight:800;margin:0 0 4px;">Gratis t/m ${expiryFormatted}</p>
          <p style="color:#6B6560;font-size:13px;margin:0;">Daarna kies je een passend abonnement, of stop je — geen verplichtingen.</p>
        </div>

        <!-- What you can do -->
        <p style="color:#1C1814;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Wat je kunt doen tijdens de proefperiode</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
          ${["Je eerste evenement aanmaken en publiceren", "Tot 50 deelnemers uitnodigen en beheren", "Live polls en Q&amp;A sessies draaien", "Het platform volledig verkennen"].map(f => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F0EBE4;vertical-align:top;">
              <span style="color:#2D5A3D;font-size:16px;margin-right:10px;">✓</span>
              <span style="color:#1C1814;font-size:14px;">${f}</span>
            </td>
          </tr>`).join("")}
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 8px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:15px 36px;border-radius:12px;letter-spacing:-0.2px;">
            Start je eerste evenement →
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;line-height:1.6;margin:0;">
        Vragen? Stuur een mail naar <a href="mailto:hello@bijeen.app" style="color:#9E9890;">hello@bijeen.app</a><br>
        <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Organisatie: betalingsbevestiging (abonnement actief) ───────────────────

interface PaymentConfirmationEmailProps {
  to: string;
  firstName: string;
  orgName: string;
  plan: string;
  amountCents: number;
  expiresAt: Date;
  dashboardUrl: string;
}

export async function sendPaymentConfirmationEmail(props: PaymentConfirmationEmailProps) {
  if (!resend) return;
  const { to, firstName, orgName, plan, amountCents, expiresAt, dashboardUrl } = props;
  const planLabel = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.label ?? plan;
  const features = PLAN_FEATURES[plan] ?? [];
  const amount = (amountCents / 100).toLocaleString("nl-NL", { style: "currency", currency: "EUR" });
  const expiryFormatted = expiresAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Betaling ontvangen — ${planLabel} abonnement actief`,
    html: buildPaymentConfirmationHtml({ firstName, orgName, planLabel, features, amount, expiryFormatted, dashboardUrl }),
  });
}

function buildPaymentConfirmationHtml({ firstName, orgName, planLabel, features, amount, expiryFormatted, dashboardUrl }: {
  firstName: string; orgName: string; planLabel: string; features: string[];
  amount: string; expiryFormatted: string; dashboardUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Betaling bevestigd – Bijeen</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;display:inline-block;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:32px;line-height:1;">🎊</div>
        <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Betaling ontvangen!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:15px;margin:0;font-weight:500;">${orgName} · ${planLabel}</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Bedankt voor je betaling. Je <strong style="color:#1C1814;">${planLabel}</strong>-abonnement is nu actief en je kunt direct aan de slag.
        </p>

        <!-- Receipt -->
        <div style="background:#FAF6F0;border-radius:14px;padding:20px 24px;margin:0 0 28px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Betalingsoverzicht</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:7px 0;border-bottom:1px solid #EDE8E1;color:#6B6560;font-size:13px;">Abonnement</td>
              <td style="padding:7px 0;border-bottom:1px solid #EDE8E1;color:#1C1814;font-size:13px;font-weight:700;text-align:right;">${planLabel}</td>
            </tr>
            <tr>
              <td style="padding:7px 0;border-bottom:1px solid #EDE8E1;color:#6B6560;font-size:13px;">Bedrag</td>
              <td style="padding:7px 0;border-bottom:1px solid #EDE8E1;color:#1C1814;font-size:13px;font-weight:700;text-align:right;">${amount} / jaar</td>
            </tr>
            <tr>
              <td style="padding:7px 0;color:#6B6560;font-size:13px;">Geldig t/m</td>
              <td style="padding:7px 0;color:#2D5A3D;font-size:13px;font-weight:700;text-align:right;">${expiryFormatted}</td>
            </tr>
          </table>
        </div>

        <!-- Features -->
        <p style="color:#1C1814;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Wat er voor je klaarstaat</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
          ${features.map(f => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F0EBE4;vertical-align:top;">
              <span style="color:#C8522A;font-size:16px;margin-right:10px;">✓</span>
              <span style="color:#1C1814;font-size:14px;">${f}</span>
            </td>
          </tr>`).join("")}
        </table>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 8px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:15px 36px;border-radius:12px;letter-spacing:-0.2px;">
            Ga naar mijn dashboard →
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;line-height:1.6;margin:0;">
        Bewaar deze mail als bewijs van betaling.<br>
        Vragen? <a href="mailto:hello@bijeen.app" style="color:#9E9890;">hello@bijeen.app</a> · <strong style="color:#9E9890;">Bijeen</strong>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Deelnemer: wachtlijstbevestiging ────────────────────────────────────────

interface WaitlistConfirmationProps {
  to: string;
  name: string;
  eventTitle: string;
  position: number;
}

export async function sendWaitlistConfirmation(props: WaitlistConfirmationProps) {
  if (!resend) return;
  const { to, name, eventTitle, position } = props;
  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Je staat op de wachtlijst: ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Wachtlijst – ${eventTitle}</title></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#2D5A3D 0%,#1E3D29 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">⏳</div>
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;">Je staat op de wachtlijst!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:600;margin:0 0 8px;">Hoi ${name},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Het evenement zit momenteel vol, maar we hebben je op de wachtlijst gezet. We laten je direct weten zodra er een plek vrijkomt.
        </p>
        <div style="background:linear-gradient(135deg,#FFF4EF 0%,#FFEEE6 100%);border:1px solid #F5D4C4;border-radius:14px;padding:20px 24px;text-align:center;margin:0 0 24px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Jouw positie op de wachtlijst</p>
          <p style="color:#C8522A;font-size:48px;font-weight:800;margin:0 0 4px;line-height:1;">${position}</p>
          <p style="color:#6B6560;font-size:13px;margin:0;">We sturen je een e-mail zodra je aan de beurt bent.</p>
        </div>
        <p style="color:#9E9890;font-size:12px;line-height:1.6;margin:0;">
          Wil je je wachtlijstplek annuleren? Reageer dan op deze e-mail.
        </p>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;margin:0;">
        <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── Deelnemer: wachtlijst promotie (plek vrijgekomen) ───────────────────────

interface WaitlistPromotionProps {
  to: string;
  name: string;
  eventTitle: string;
  registerUrl: string;
}

export async function sendWaitlistPromotion(props: WaitlistPromotionProps) {
  if (!resend) return;
  const { to, name, eventTitle, registerUrl } = props;
  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Goed nieuws! Er is een plek vrijgekomen: ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Plek vrijgekomen – ${eventTitle}</title></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">🎉</div>
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;">Er is een plek vrijgekomen!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:600;margin:0 0 8px;">Hoi ${name},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.7;margin:0 0 28px;">
          Goed nieuws! Er is een plek vrijgekomen bij <strong style="color:#1C1814;">${eventTitle}</strong> en jij bent de volgende op de wachtlijst. Meld je aan via de knop hieronder — je plek is 48 uur gereserveerd.
        </p>
        <div style="text-align:center;margin:0 0 24px;">
          <a href="${registerUrl}" style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;letter-spacing:-0.2px;">
            Bevestig mijn aanmelding →
          </a>
        </div>
        <div style="background:#FFF4EF;border:1px solid #F5D4C4;border-radius:12px;padding:16px;text-align:center;">
          <p style="color:#C8522A;font-size:13px;font-weight:700;margin:0 0 4px;">⏰ Je plek vervalt over 48 uur</p>
          <p style="color:#6B6560;font-size:12px;margin:0;">Meld je op tijd aan, anders gaat de plek naar de volgende persoon op de wachtlijst.</p>
        </div>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;margin:0;">
        <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── Deelnemer: herinnering (24u vóór evenement) ─────────────────────────────

interface EventReminderEmailProps {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  qrCode: string;
  appUrl: string;
  orgName?:  string | null;
  orgLogo?:  string | null;
  orgColor?: string | null;
}

export async function sendEventReminderEmail(props: EventReminderEmailProps) {
  if (!resend) return;
  const { to, name, eventTitle, eventDate, eventLocation, qrCode, appUrl, orgName, orgLogo, orgColor } = props;
  const ticketUrl   = `${appUrl}/ticket/${qrCode}`;
  const brandColor  = orgColor ?? "#C8522A";
  const brandDark   = adjustColor(brandColor, -20);
  const brandHeader = orgLogo
    ? `<img src="${orgLogo}" alt="${orgName ?? "Organisator"}" height="36" style="height:36px;width:auto;display:inline-block;max-width:160px;" />`
    : `<span style="color:#9E9890;font-size:13px;font-weight:600;">${orgName ?? "Bijeen"}</span>`;

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Herinnering: morgen is het zover — ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">${brandHeader}</div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,${brandColor} 0%,${brandDark} 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">⏰</div>
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;">Morgen is het zover!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:600;margin:0 0 8px;">Hoi ${name},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Dit is een vriendelijke herinnering: morgen vindt <strong>${eventTitle}</strong> plaats. We kijken ernaar uit je te verwelkomen!
        </p>
        <div style="background:#FAF6F0;border-radius:14px;padding:20px;margin:0 0 24px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding:6px 0;border-bottom:1px solid #EDE8E1;">
              <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Datum</span>
              <span style="color:#1C1814;font-size:14px;font-weight:600;">📅 ${eventDate}</span>
            </td></tr>
            ${eventLocation ? `<tr><td style="padding:6px 0;">
              <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Locatie</span>
              <span style="color:#1C1814;font-size:14px;font-weight:600;">📍 ${eventLocation}</span>
            </td></tr>` : ""}
          </table>
        </div>
        <div style="text-align:center;">
          <a href="${ticketUrl}" style="display:inline-block;background:${brandColor};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;">
            Bekijk mijn QR-ticket →
          </a>
        </div>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;margin:0;">Verstuurd via <strong style="color:#9E9890;">Bijeen</strong></p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── Deelnemer: bedankmail met survey-link (na evenement) ─────────────────────

interface ThankYouEmailProps {
  to: string;
  name: string;
  eventTitle: string;
  eventSlug: string;
  attendeeId: string;
  appUrl: string;
}

export async function sendThankYouWithSurveyEmail(props: ThankYouEmailProps) {
  if (!resend) return;
  const { to, name, eventTitle, eventSlug, attendeeId, appUrl } = props;
  const surveyUrl = `${appUrl}/e/${eventSlug}/survey?a=${attendeeId}`;

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Bedankt voor je komst — deel je feedback over ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <div style="font-size:40px;margin-bottom:12px;">🌟</div>
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;">Bedankt voor je komst!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:600;margin:0 0 8px;">Hoi ${name},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Bedankt dat je aanwezig was bij <strong>${eventTitle}</strong>! We hopen dat je een mooie en inspirerende dag hebt gehad.
        </p>
        <div style="background:linear-gradient(135deg,#FFF4EF 0%,#FFEEE6 100%);border:1px solid #F5D4C4;border-radius:14px;padding:20px;margin:0 0 24px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">📝</div>
          <p style="color:#1C1814;font-size:14px;font-weight:700;margin:0 0 6px;">Deel je feedback</p>
          <p style="color:#6B6560;font-size:12px;line-height:1.6;margin:0 0 16px;">
            Het duurt slechts 2 minuten. Jouw input helpt ons het evenement volgend jaar nog beter te maken.
          </p>
          <a href="${surveyUrl}" style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;">
            Vul de enquête in →
          </a>
        </div>
        <p style="color:#9E9890;font-size:12px;line-height:1.6;text-align:center;margin:0;">
          Je feedback is anoniem en wordt alleen intern gebruikt.
        </p>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;margin:0;"><strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector</p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── Deelnemer: aanmeldingsbevestiging ────────────────────────────────────────

interface ConfirmationEmailProps {
  to: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  qrCode: string;
  appUrl: string;
  attendeeId?: string;
  // Org branding (optional — falls back to Bijeen defaults)
  orgName?: string | null;
  orgLogo?: string | null;
  orgColor?: string | null;
}

export async function sendRegistrationConfirmation(props: ConfirmationEmailProps) {
  if (!resend) {
    console.warn("RESEND_API_KEY niet geconfigureerd — e-mail niet verstuurd");
    return;
  }

  const { to, name, eventTitle, eventDate, eventLocation, qrCode, appUrl, attendeeId, orgName, orgLogo, orgColor } = props;
  const ticketUrl = `${appUrl}/ticket/${qrCode}`;

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Je aanmelding is bevestigd: ${eventTitle}`,
    html: buildConfirmationHtml({ name, eventTitle, eventDate, eventLocation, ticketUrl, attendeeId, orgName, orgLogo, orgColor }),
  });
}

// Darken a hex color by `amount` (0–255 per channel)
function adjustColor(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(clean.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(clean.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(clean.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function buildConfirmationHtml({
  name,
  eventTitle,
  eventDate,
  eventLocation,
  ticketUrl,
  orgName,
  orgLogo,
  orgColor,
  attendeeId,
}: {
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  ticketUrl: string;
  orgName?: string | null;
  orgLogo?: string | null;
  orgColor?: string | null;
  attendeeId?: string;
}) {
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const brandColor  = orgColor ?? "#C8522A";
  const brandDark   = adjustColor(brandColor, -20);
  const brandHeader = orgLogo
    ? `<img src="${orgLogo}" alt="${orgName ?? "Organisator"}" height="40" style="height:40px;width:auto;display:inline-block;max-width:180px;" />`
    : `<span style="color:#9E9890;font-size:13px;font-weight:600;">${orgName ?? "Bijeen"}</span>`;

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
      ${brandHeader}
    </div>

    <!-- Card -->
    <div style="background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, ${brandColor} 0%, ${brandDark} 100%); padding: 32px; text-align: center;">
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
             style="display: inline-block; background: ${brandColor}; color: #FFFFFF; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 10px; letter-spacing: -0.2px;">
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
        &nbsp;·&nbsp;
        <a href="${appUrl}/api/unsubscribe?id=${attendeeId ?? ""}" style="color: #B8B3AC; text-decoration: underline;">Uitschrijven</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Custom broadcast ────────────────────────────────────────────────────────

export async function sendCustomBroadcast(props: {
  to: string;
  attendeeName: string;
  eventTitle: string;
  subject: string;
  message: string;
}) {
  if (!resend) return;
  const { to, attendeeName, eventTitle, subject, message } = props;
  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject,
    html: buildBroadcastHtml({ attendeeName, eventTitle, message }),
  });
}

// ─── Team uitnodiging ─────────────────────────────────────────────────────────

export async function sendTeamInviteEmail(props: {
  to: string;
  orgName: string;
  inviteUrl: string;
  invitedBy: string;
}) {
  if (!resend) return;
  const { to, orgName, inviteUrl, invitedBy } = props;
  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `${invitedBy} heeft je uitgenodigd voor ${orgName} op Bijeen`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px;text-align:center;">
    <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" height="32" style="height:32px;width:auto;margin-bottom:24px;" />
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#12100E 0%,#2A2520 100%);padding:36px 32px;text-align:center;">
        <div style="font-size:36px;margin-bottom:12px;">👥</div>
        <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0 0 6px;">Je bent uitgenodigd!</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:13px;margin:0;">${invitedBy} nodigt je uit bij <strong style="color:#fff;">${orgName}</strong></p>
      </div>
      <div style="padding:32px;">
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Je hebt een uitnodiging ontvangen om deel te nemen aan het team van <strong>${orgName}</strong> op Bijeen. Accepteer de uitnodiging om toegang te krijgen tot het dashboard.
        </p>
        <a href="${inviteUrl}" style="display:block;background:#C8522A;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;">
          Uitnodiging accepteren →
        </a>
        <p style="color:#9E9890;font-size:11px;margin:16px 0 0;">
          Link is 7 dagen geldig. Als je deze uitnodiging niet verwacht, kun je dit bericht negeren.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
  });
}

function buildBroadcastHtml({ attendeeName, eventTitle, message }: {
  attendeeName: string; eventTitle: string; message: string;
}) {
  const paragraphs = message
    .split(/\n\n+/)
    .map(p => `<p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 16px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/Bijeen-logo.png" alt="Bijeen" width="100" height="30" style="height:30px;width:auto;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8431F 100%);padding:32px;text-align:center;">
        <p style="color:rgba(255,255,255,0.75);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">${eventTitle}</p>
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0;">Bericht van de organisatie</h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:15px;font-weight:700;margin:0 0 20px;">Beste ${attendeeName},</p>
        ${paragraphs}
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Je ontvangt dit bericht omdat je geregistreerd bent voor <strong>${eventTitle}</strong>.
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`;
}
