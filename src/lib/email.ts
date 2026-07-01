import { Resend } from "resend";
import { PLAN_LIMITS, PLAN_FEATURES } from "@/lib/plans";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const REPLY_TO = "hello@bijeen.app";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function sanitizeUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : "#";
}
function sanitizeCssColor(color: string): string {
  return /^#[0-9A-Fa-f]{3,6}$/.test(color) ? color : "#C8522A";
}

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

function buildWelcomeTrialHtml({ firstName: _fn, orgName: _on, expiryFormatted, dashboardUrl: _du }: {
  firstName: string; orgName: string; expiryFormatted: string; dashboardUrl: string;
}) {
  const firstName    = escapeHtml(_fn);
  const orgName      = escapeHtml(_on);
  const dashboardUrl = sanitizeUrl(_du);
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
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
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

// ─── Organisatie: welkomstmail (community — altijd gratis) ────────────────────

interface WelcomeCommunityEmailProps {
  to: string;
  firstName: string;
  orgName: string;
  eventsPerYear?: string | null;
  dashboardUrl: string;
}

export async function sendWelcomeCommunityEmail(props: WelcomeCommunityEmailProps) {
  if (!resend) return;
  const { to, firstName: _fn, orgName: _on, eventsPerYear, dashboardUrl: _du } = props;
  const firstName    = escapeHtml(_fn);
  const orgName      = escapeHtml(_on);
  const dashboardUrl = sanitizeUrl(_du);

  const upgradeHint = eventsPerYear && ["11-24", "25+"].includes(eventsPerYear)
    ? `<div style="background:#FFF4EF;border:1px solid #F5D4C4;border-radius:12px;padding:14px 18px;margin:0 0 24px;">
        <p style="color:#C8522A;font-size:13px;font-weight:700;margin:0 0 4px;">Groeien? Wij ook.</p>
        <p style="color:#6B6560;font-size:12px;line-height:1.6;margin:0 0 10px;">Je gaf aan meer dan 10 events per jaar te organiseren. Het Welzijn of Netwerk-plan past beter bij jouw volume.</p>
        <a href="${dashboardUrl.replace("/dashboard", "/dashboard/instellingen")}" style="color:#C8522A;font-size:12px;font-weight:700;text-decoration:underline;">Bekijk alle plannen →</a>
      </div>`
    : "";

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Welkom bij Bijeen, ${firstName}! Je account staat klaar`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij Bijeen</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:24px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Welkom bij Bijeen!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;font-weight:500;">${orgName} · Community</p>
      </div>

      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#6B6560;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Je account is aangemaakt en je kunt direct aan de slag. Met het gratis Community-plan heb je alles wat je nodig hebt om te starten.
        </p>

        <p style="color:#1C1814;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 12px;">Wat je kunt doen</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
          ${["2 evenementen per jaar aanmaken", "Tot 75 deelnemers uitnodigen en beheren", "QR-code check-in op de dag zelf", "Deelnemerslijst exporteren naar Excel"].map(f => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #F0EBE4;vertical-align:top;">
              <span style="color:#2D5A3D;font-size:16px;margin-right:10px;">✓</span>
              <span style="color:#1C1814;font-size:14px;">${f}</span>
            </td>
          </tr>`).join("")}
        </table>

        ${upgradeHint}

        <div style="text-align:center;margin:0 0 8px;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:15px 36px;border-radius:12px;letter-spacing:-0.2px;">
            Maak je eerste evenement →
          </a>
        </div>
      </div>
    </div>

    <div style="text-align:center;padding:24px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;line-height:1.6;margin:0;">
        Vragen? Stuur een mail naar <a href="mailto:hello@bijeen.app" style="color:#9E9890;">hello@bijeen.app</a><br>
        <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
      </p>
    </div>

  </div>
</body>
</html>`,
  });
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

function buildPaymentConfirmationHtml({ firstName: _fn, orgName: _on, planLabel, features, amount, expiryFormatted, dashboardUrl: _du }: {
  firstName: string; orgName: string; planLabel: string; features: string[];
  amount: string; expiryFormatted: string; dashboardUrl: string;
}) {
  const firstName    = escapeHtml(_fn);
  const orgName      = escapeHtml(_on);
  const dashboardUrl = sanitizeUrl(_du);
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
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
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
  const { to, name: _name, eventTitle: _et, position } = props;
  const name       = escapeHtml(_name);
  const eventTitle = escapeHtml(_et);
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
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
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
  const { to, name: _name, eventTitle: _et, registerUrl: _ru } = props;
  const name        = escapeHtml(_name);
  const eventTitle  = escapeHtml(_et);
  const registerUrl = sanitizeUrl(_ru);
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
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
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
          <p style="color:#C8522A;font-size:13px;font-weight:700;margin:0 0 4px;">Je plek vervalt over 48 uur</p>
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
  const { to, name: _name, eventTitle: _et, eventDate: _ed, eventLocation: _el, qrCode, appUrl, orgName: _on, orgLogo: _ol, orgColor } = props;
  const name         = escapeHtml(_name);
  const eventTitle   = escapeHtml(_et);
  const eventDate    = escapeHtml(_ed);
  const eventLocation = _el ? escapeHtml(_el) : null;
  const orgName      = _on ? escapeHtml(_on) : null;
  const orgLogo      = _ol ? sanitizeUrl(_ol) : null;
  const ticketUrl    = sanitizeUrl(`${appUrl}/ticket/${qrCode}`);
  const brandColor   = sanitizeCssColor(orgColor ?? "#C8522A");
  const brandDark    = adjustColor(brandColor, -20);
  const brandHeader  = orgLogo
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
              <span style="color:#1C1814;font-size:14px;font-weight:600;">${eventDate}</span>
            </td></tr>
            ${eventLocation ? `<tr><td style="padding:6px 0;">
              <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Locatie</span>
              <span style="color:#1C1814;font-size:14px;font-weight:600;">${eventLocation}</span>
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
  const { to, name: _name, eventTitle: _et, eventSlug, attendeeId, appUrl } = props;
  const name       = escapeHtml(_name);
  const eventTitle = escapeHtml(_et);
  const surveyUrl  = sanitizeUrl(`${appUrl}/e/${eventSlug}/survey?a=${attendeeId}`);

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
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;">Bedankt voor je komst!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:600;margin:0 0 8px;">Hoi ${name},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Bedankt dat je aanwezig was bij <strong>${eventTitle}</strong>! We hopen dat je een mooie en inspirerende dag hebt gehad.
        </p>
        <div style="background:linear-gradient(135deg,#FFF4EF 0%,#FFEEE6 100%);border:1px solid #F5D4C4;border-radius:14px;padding:20px;margin:0 0 24px;text-align:center;">
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
  name: _name,
  eventTitle: _et,
  eventDate: _ed,
  eventLocation: _el,
  ticketUrl: _tu,
  orgName: _on,
  orgLogo: _ol,
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
  const name          = escapeHtml(_name);
  const eventTitle    = escapeHtml(_et);
  const eventDate     = escapeHtml(_ed);
  const eventLocation = _el ? escapeHtml(_el) : null;
  const ticketUrl     = sanitizeUrl(_tu);
  const orgName       = _on ? escapeHtml(_on) : null;
  const orgLogo       = _ol ? sanitizeUrl(_ol) : null;
  const appUrl        = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";
  const brandColor    = sanitizeCssColor(orgColor ?? "#C8522A");
  const brandDark     = adjustColor(brandColor, -20);
  const brandHeader   = orgLogo
    ? `<img src="${orgLogo}" alt="${orgName ?? "Organisator"}" height="40" style="height:40px;width:auto;display:inline-block;max-width:180px;" />`
    : `<span style="color:#9E9890;font-size:13px;font-weight:600;">${orgName ?? "Bijeen"}</span>`;

  const locationRow = eventLocation
    ? `<tr>
        <td style="padding: 6px 0; vertical-align: top;">
          <span style="color: #9E9890; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 2px;">Locatie</span>
          <span style="color: #1C1814; font-size: 14px; font-weight: 600;">${eventLocation}</span>
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
                <span style="color: #1C1814; font-size: 14px; font-weight: 600;">${eventDate}</span>
              </td>
            </tr>
            ${locationRow}
          </table>
        </div>

        <!-- QR Code CTA -->
        <div style="background: linear-gradient(135deg, #FFF4EF 0%, #FFEEE6 100%); border: 1px solid #F5D4C4; border-radius: 14px; padding: 20px; margin: 0 0 28px; text-align: center;">
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

// ─── Admin: nieuwe aanmelding notificatie ─────────────────────────────────────

const ADMIN_NOTIFICATION_EMAIL = "v.munster@weareimpact.nl";

export async function sendAdminNewAttendeeNotification(props: {
  attendeeName: string;
  attendeeEmail: string;
  attendeeOrg?: string | null;
  attendeeRole?: string | null;
  eventTitle: string;
  eventDate: string;
  eventId: string;
  appUrl: string;
}) {
  if (!resend) return;
  const { attendeeName: _an, attendeeEmail: _ae, attendeeOrg: _ao, attendeeRole: _ar, eventTitle: _et, eventDate: _ed, eventId, appUrl } = props;
  const attendeeName  = escapeHtml(_an);
  const attendeeEmail = escapeHtml(_ae);
  const attendeeOrg   = _ao ? escapeHtml(_ao) : null;
  const attendeeRole  = _ar ? escapeHtml(_ar) : null;
  const eventTitle    = escapeHtml(_et);
  const eventDate     = escapeHtml(_ed);
  const dashboardUrl  = sanitizeUrl(`${appUrl}/dashboard/events/${eventId}/deelnemers`);

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `Nieuwe aanmelding: ${attendeeName} → ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="32" height="32" style="height:32px;width:32px;border-radius:6px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:28px 32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:18px;font-weight:800;margin:0 0 4px;">Nieuwe aanmelding</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:28px 32px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0EBE4;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Naam</span>
            <span style="color:#1C1814;font-size:14px;font-weight:600;">${attendeeName}</span>
          </td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0EBE4;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">E-mail</span>
            <span style="color:#1C1814;font-size:14px;">${attendeeEmail}</span>
          </td></tr>
          ${attendeeOrg ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F0EBE4;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Organisatie</span>
            <span style="color:#1C1814;font-size:14px;">${attendeeOrg}</span>
          </td></tr>` : ""}
          ${attendeeRole ? `<tr><td style="padding:8px 0;border-bottom:1px solid #F0EBE4;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Functie</span>
            <span style="color:#1C1814;font-size:14px;">${attendeeRole}</span>
          </td></tr>` : ""}
          <tr><td style="padding:8px 0;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">Evenement</span>
            <span style="color:#1C1814;font-size:14px;">${eventTitle} · ${eventDate}</span>
          </td></tr>
        </table>
        <a href="${dashboardUrl}" style="display:block;text-align:center;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;">
          Bekijk deelnemerslijst →
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:11px;margin-top:20px;">
      Automatisch bericht van <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Demo-aanvraag: bevestiging naar aanvrager ───────────────────────────────

interface DemoRequestConfirmationProps {
  to: string;
  naam: string;
  organisatieNaam: string;
  sociaalTarief: boolean;
  voorkeursmoment?: string | null;
}

export async function sendDemoRequestConfirmation(props: DemoRequestConfirmationProps) {
  if (!resend) return;
  const { to, naam: _naam, organisatieNaam: _org, sociaalTarief, voorkeursmoment } = props;
  const naam = escapeHtml(_naam);
  const org  = escapeHtml(_org);
  const firstName = naam.split(" ")[0];

  const momentLabel = voorkeursmoment
    ? { ochtend: "ochtend", middag: "middag", avond: "avond" }[voorkeursmoment] ?? null
    : null;

  await resend.emails.send({
    from: "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: "Je demo-aanvraag is ontvangen — Bijeen",
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Demo-aanvraag ontvangen</title></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.3px;">Bedankt voor je aanvraag!</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;">${org}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#6B6560;font-size:14px;line-height:1.75;margin:0 0 24px;">
          We hebben je aanvraag voor een gratis demo van Bijeen ontvangen. Vincent neemt binnen
          1 werkdag persoonlijk contact met je op om een moment van 30 minuten in te plannen${momentLabel ? ` (bij voorkeur in de ${momentLabel})` : ""}.
        </p>
        <div style="background:#FAF6F0;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Wat je kunt verwachten</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            ${[
              "Persoonlijke rondleiding door de tool (~30 min)",
              "Jouw specifieke use case centraal",
              "Eerlijk antwoord of Bijeen bij jullie past",
              "Geen verkooppraatje, geen verplichtingen",
            ].map(f => `
            <tr>
              <td style="padding:6px 0;vertical-align:top;">
                <span style="color:#C8522A;font-size:15px;margin-right:8px;">✓</span>
                <span style="color:#1C1814;font-size:13px;">${f}</span>
              </td>
            </tr>`).join("")}
          </table>
        </div>
        ${sociaalTarief ? `<div style="background:#FFF4EF;border:1px solid #F5D4C4;border-radius:12px;padding:16px 20px;margin:0 0 24px;">
          <p style="color:#C8522A;font-size:13px;font-weight:700;margin:0 0 4px;">Sociaal Tarief</p>
          <p style="color:#6B6560;font-size:12px;line-height:1.6;margin:0;">Je gaf aan ANBI- of WMO-gefinancierd te zijn. Vincent neemt het Sociaal Tarief (15% korting) mee in het gesprek.</p>
        </div>` : ""}
        <p style="color:#9E9890;font-size:12px;line-height:1.6;margin:0;">
          Kan het niet wachten? Mail direct naar
          <a href="mailto:hallo@bijeen.nl" style="color:#C8522A;">hallo@bijeen.nl</a>
          of app naar
          <a href="https://wa.me/31614470977" style="color:#C8522A;">Vincent op WhatsApp</a>.
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

// ─── Demo-aanvraag: notificatie naar intern ──────────────────────────────────

export async function sendAdminDemoRequestNotification(props: {
  naam: string;
  email: string;
  telefoon?: string | null;
  organisatieNaam: string;
  organisatieType?: string | null;
  functie?: string | null;
  eventsPerJaar?: string | null;
  interesses?: string[];
  toelichting?: string | null;
  sociaalTarief: boolean;
  voorkeursmoment?: string | null;
  gewensteWeek?: string | null;
}) {
  if (!resend) return;
  const {
    naam: _naam, email, telefoon, organisatieNaam: _org, organisatieType, functie,
    eventsPerJaar, interesses, toelichting: _toelichting, sociaalTarief, voorkeursmoment, gewensteWeek: _gw,
  } = props;
  const naam         = escapeHtml(_naam);
  const org          = escapeHtml(_org);
  const toelichting  = _toelichting ? escapeHtml(_toelichting) : null;
  const gewensteWeek = _gw ? escapeHtml(_gw) : null;

  const rows: [string, string | null | undefined][] = [
    ["Naam", naam],
    ["E-mail", email],
    ["Telefoon", telefoon],
    ["Organisatie", org],
    ["Type organisatie", organisatieType],
    ["Functie", functie],
    ["Events per jaar", eventsPerJaar],
    ["Interesses", (interesses ?? []).join(", ") || null],
    ["Toelichting", toelichting],
    ["Sociaal Tarief (ANBI/WMO)", sociaalTarief ? "Ja" : "Nee"],
    ["Voorkeursmoment", voorkeursmoment],
    ["Gewenste week", gewensteWeek],
  ];

  await resend.emails.send({
    from: "Bijeen Leads <hello@bijeen.app>",
    to: ADMIN_NOTIFICATION_EMAIL,
    replyTo: email,
    subject: `Nieuwe demo-aanvraag: ${org}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="32" height="32" style="height:32px;width:32px;border-radius:6px;" />
    </div>
    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:28px 32px;text-align:center;">
        <h1 style="color:#FFFFFF;font-size:18px;font-weight:800;margin:0 0 4px;">Nieuwe demo-aanvraag</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;">${org}</p>
      </div>
      <div style="padding:28px 32px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
          ${rows.filter(([, v]) => v).map(([label, value]) => `
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0EBE4;">
            <span style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:2px;">${label}</span>
            <span style="color:#1C1814;font-size:14px;">${value}</span>
          </td></tr>`).join("")}
        </table>
        <a href="mailto:${email}" style="display:block;text-align:center;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:14px;padding:13px 28px;border-radius:10px;">
          Reageer naar ${naam} →
        </a>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:11px;margin-top:20px;">
      Automatisch bericht van <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
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
  const { to, orgName: _on, inviteUrl: _iu, invitedBy: _ib } = props;
  const orgName   = escapeHtml(_on);
  const inviteUrl = sanitizeUrl(_iu);
  const invitedBy = escapeHtml(_ib);
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
    <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="32" height="32" style="height:32px;width:32px;border-radius:6px;margin-bottom:24px;" />
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:36px 32px;text-align:center;">
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

function buildBroadcastHtml({ attendeeName: _an, eventTitle: _et, message: _msg }: {
  attendeeName: string; eventTitle: string; message: string;
}) {
  const attendeeName = escapeHtml(_an);
  const eventTitle   = escapeHtml(_et);
  const paragraphs   = escapeHtml(_msg)
    .split(/\n\n+/)
    .map(p => `<p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 16px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="30" height="30" style="height:30px;width:30px;border-radius:6px;" />
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

// ─── Vrijwilliger: aanmelding bevestiging ────────────────────────────────────

interface VacancyApplicationConfirmationProps {
  to: string;
  name: string;
  vacancyTitle: string;
  eventTitle: string;
  eventSlug: string;
}

export async function sendVacancyApplicationConfirmation(props: VacancyApplicationConfirmationProps) {
  if (!resend) return;
  const { to, name: _name, vacancyTitle: _vt, eventTitle: _et } = props;
  const firstName    = escapeHtml(_name.split(" ")[0]);
  const vacancyTitle = escapeHtml(_vt);
  const eventTitle   = escapeHtml(_et);

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Aanmelding ontvangen: ${vacancyTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Aanmelding ontvangen!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Bedankt voor je aanmelding als vrijwilliger! We hebben je aanmelding goed ontvangen en gaan er zo snel mogelijk naar kijken.
        </p>
        <div style="background:#F5F9F6;border:1px solid #D4E8DA;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#6B8F73;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Jouw aanmelding</p>
          <p style="color:#1C1814;font-size:16px;font-weight:800;margin:0 0 4px;">${vacancyTitle}</p>
          <p style="color:#5C5248;font-size:13px;margin:0;">${eventTitle}</p>
        </div>
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0 0 24px;">
          De organisatie neemt contact met je op zodra ze je aanmelding hebben beoordeeld. Houd je inbox in de gaten!
        </p>
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Vragen? Neem contact op via <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Vrijwilliger: aanmelding geaccepteerd ───────────────────────────────────

interface VacancyApplicationAcceptedProps {
  to: string;
  name: string;
  vacancyTitle: string;
  eventTitle: string;
  shiftDate?: string | null;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  location?: string | null;
  eventSlug: string;
}

export async function sendVacancyApplicationAccepted(props: VacancyApplicationAcceptedProps) {
  if (!resend) return;
  const { to, name: _name, vacancyTitle: _vt, eventTitle: _et, shiftDate: _sd, shiftStart: _ss, shiftEnd: _se, location: _loc, eventSlug } = props;
  const firstName    = escapeHtml(_name.split(" ")[0]);
  const vacancyTitle = escapeHtml(_vt);
  const eventTitle   = escapeHtml(_et);
  const shiftDate    = _sd  ? escapeHtml(_sd)  : null;
  const shiftStart   = _ss  ? escapeHtml(_ss)  : null;
  const shiftEnd     = _se  ? escapeHtml(_se)  : null;
  const location     = _loc ? escapeHtml(_loc) : null;
  const detailsBlock = [
    shiftDate  ? `<tr><td style="padding:8px 0;border-bottom:1px solid #E8F4EC;color:#6B8F73;font-size:12px;font-weight:700;width:100px;">Datum</td><td style="padding:8px 0;border-bottom:1px solid #E8F4EC;color:#1C1814;font-size:14px;">${shiftDate}</td></tr>` : "",
    (shiftStart && shiftEnd) ? `<tr><td style="padding:8px 0;border-bottom:1px solid #E8F4EC;color:#6B8F73;font-size:12px;font-weight:700;">Tijd</td><td style="padding:8px 0;border-bottom:1px solid #E8F4EC;color:#1C1814;font-size:14px;">${shiftStart} – ${shiftEnd}</td></tr>` : "",
    location   ? `<tr><td style="padding:8px 0;color:#6B8F73;font-size:12px;font-weight:700;">Locatie</td><td style="padding:8px 0;color:#1C1814;font-size:14px;">${location}</td></tr>` : "",
  ].filter(Boolean).join("");

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Geaccepteerd als vrijwilliger: ${vacancyTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Je bent aangenomen!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Geweldig nieuws — je bent geaccepteerd als vrijwilliger voor <strong>${vacancyTitle}</strong>. We kijken ernaar uit om samen dit evenement tot een succes te maken!
        </p>
        <div style="background:#F0F8F4;border:1px solid #C4E0CC;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#2D5A3D;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Jouw vrijwilligersrol</p>
          <p style="color:#1C1814;font-size:18px;font-weight:800;margin:0 0 4px;">${vacancyTitle}</p>
          <p style="color:#5C5248;font-size:13px;margin:0 0 ${detailsBlock ? "16px" : "0"};">${eventTitle}</p>
          ${detailsBlock ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;">${detailsBlock}</table>` : ""}
        </div>
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0 0 24px;">
          De organisatie neemt binnenkort contact met je op met meer details over de dag. Heb je vragen? Reageer dan op deze e-mail.
        </p>
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Vragen? Neem contact op via <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Vrijwilliger: aanmelding afgewezen ──────────────────────────────────────

interface VacancyApplicationRejectedProps {
  to: string;
  name: string;
  vacancyTitle: string;
  eventTitle: string;
}

export async function sendVacancyApplicationRejected(props: VacancyApplicationRejectedProps) {
  if (!resend) return;
  const { to, name: _name, vacancyTitle: _vt, eventTitle: _et } = props;
  const firstName    = escapeHtml(_name.split(" ")[0]);
  const vacancyTitle = escapeHtml(_vt);
  const eventTitle   = escapeHtml(_et);

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Update over je aanmelding: ${vacancyTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Bedankt voor je aanmelding</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Bedankt voor je interesse om te helpen bij <strong>${vacancyTitle}</strong>. Na zorgvuldige overweging hebben we helaas besloten om op dit moment met andere kandidaten verder te gaan.
        </p>
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0 0 24px;">
          We stellen je enthousiasme en de tijd die je hebt gestoken in je aanmelding zeer op prijs. Houd onze toekomstige evenementen in de gaten — we hopen je bij een volgende gelegenheid te mogen verwelkomen!
        </p>
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Vragen? Neem contact op via <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Organisatie: nieuwe vrijwilliger aanmelding ─────────────────────────────

interface NewVolunteerApplicationNotificationProps {
  to: string;
  volunteerName: string;
  volunteerEmail: string;
  vacancyTitle: string;
  eventTitle: string;
  dashboardUrl: string;
}

export async function sendNewVolunteerApplicationNotification(props: NewVolunteerApplicationNotificationProps) {
  if (!resend) return;
  const { to, volunteerName: _vn, volunteerEmail: _ve, vacancyTitle: _vt, eventTitle: _et, dashboardUrl: _du } = props;
  const volunteerName  = escapeHtml(_vn);
  const volunteerEmail = escapeHtml(_ve);
  const vacancyTitle   = escapeHtml(_vt);
  const eventTitle     = escapeHtml(_et);
  const dashboardUrl   = sanitizeUrl(_du);

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Nieuwe vrijwilliger: ${volunteerName} → ${vacancyTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#9E3D1A 100%);padding:32px;text-align:center;">
        <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;letter-spacing:-0.3px;">Nieuwe vrijwilliger aanmelding</h1>
      </div>
      <div style="padding:32px;">
        <div style="background:#FFF8F5;border:1px solid #F5D4C4;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Aanmelding details</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;width:90px;">Vrijwilliger</td><td style="padding:6px 0;color:#1C1814;font-size:14px;font-weight:700;">${volunteerName}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">E-mail</td><td style="padding:6px 0;color:#5C5248;font-size:14px;">${volunteerEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Vacature</td><td style="padding:6px 0;color:#1C1814;font-size:14px;font-weight:600;">${vacancyTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Evenement</td><td style="padding:6px 0;color:#5C5248;font-size:14px;">${eventTitle}</td></tr>
          </table>
        </div>
        <div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#C8522A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:12px;letter-spacing:-0.2px;">
            Bekijk aanmelding in dashboard →
          </a>
        </div>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Vrijwilliger: uitnodiging van organisatie ───────────────────────────────

interface VacancyInvitationProps {
  to: string;
  name: string;
  vacancyTitle: string;
  eventTitle: string;
  personalMessage: string | null;
  respondUrl: string;
  expiresAt: Date;
}

export async function sendVacancyInvitation(props: VacancyInvitationProps) {
  if (!resend) return;
  const { to, name: _name, vacancyTitle: _vt, eventTitle: _et, personalMessage: _pm, respondUrl: _ru, expiresAt } = props;
  const firstName    = escapeHtml(_name.split(" ")[0]);
  const vacancyTitle = escapeHtml(_vt);
  const eventTitle   = escapeHtml(_et);
  const respondUrl   = sanitizeUrl(_ru);
  const expiry = expiresAt.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const msgBlock = _pm
    ? `<div style="background:#FFF4EF;border-left:3px solid #C8522A;border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">Persoonlijk bericht</p>
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0;">${escapeHtml(_pm).replace(/\n/g, "<br>")}</p>
       </div>`
    : "";

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Uitnodiging: ${vacancyTitle} bij ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#C8522A 0%,#9E3D1A 100%);padding:40px 32px;text-align:center;">
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;letter-spacing:-0.4px;">Je bent uitgenodigd!</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 24px;">
          De organisatie heeft je persoonlijk uitgenodigd voor een vrijwilligersvacature bij <strong>${eventTitle}</strong>.
        </p>
        <div style="background:#FFF4EF;border:1px solid #F5D4C4;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#C8722A;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Vacature</p>
          <p style="color:#1C1814;font-size:18px;font-weight:800;margin:0 0 4px;">${vacancyTitle}</p>
          <p style="color:#5C5248;font-size:13px;margin:0;">${eventTitle}</p>
        </div>
        ${msgBlock}
        <div style="text-align:center;margin:0 0 20px;">
          <a href="${respondUrl}" style="display:inline-block;background:#C8522A;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 40px;border-radius:12px;letter-spacing:-0.2px;">
            Bekijk uitnodiging &amp; reageer →
          </a>
        </div>
        <p style="color:#9E9890;font-size:13px;text-align:center;margin:0;">Deze uitnodiging verloopt op ${expiry}</p>
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Vragen? Stuur een mail naar <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Vrijwilliger: bevestiging na acceptatie uitnodiging ─────────────────────

interface InvitationAcceptedConfirmationProps {
  to: string;
  name: string;
  vacancyTitle: string;
  eventTitle: string;
  shiftDate: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  location: string | null;
}

export async function sendInvitationAcceptedConfirmation(props: InvitationAcceptedConfirmationProps) {
  if (!resend) return;
  const { to, name: _name, vacancyTitle: _vt, eventTitle: _et, shiftDate, shiftStart: _ss, shiftEnd: _se, location: _loc } = props;
  const firstName    = escapeHtml(_name.split(" ")[0]);
  const vacancyTitle = escapeHtml(_vt);
  const eventTitle   = escapeHtml(_et);
  const shiftStart   = _ss  ? escapeHtml(_ss)  : null;
  const shiftEnd     = _se  ? escapeHtml(_se)  : null;
  const location     = _loc ? escapeHtml(_loc) : null;

  const shiftRow = (shiftDate || shiftStart)
    ? `<tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;width:90px;">Tijdstip</td><td style="padding:6px 0;color:#1C1814;font-size:14px;">${shiftDate ? escapeHtml(new Date(shiftDate).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })) : ""}${shiftStart ? ` · ${shiftStart}${shiftEnd ? `–${shiftEnd}` : ""}` : ""}</td></tr>`
    : "";
  const locationRow = location
    ? `<tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Locatie</td><td style="padding:6px 0;color:#1C1814;font-size:14px;">${location}</td></tr>`
    : "";

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: `Bevestigd: ${vacancyTitle} bij ${eventTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:40px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:28px;">✓</span>
        </div>
        <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.4px;">Aanmelding bevestigd!</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${eventTitle}</p>
      </div>
      <div style="padding:36px 32px;">
        <p style="color:#1C1814;font-size:16px;font-weight:700;margin:0 0 8px;">Hoi ${firstName},</p>
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Super dat je erbij bent! Je aanmelding voor <strong>${vacancyTitle}</strong> bij <strong>${eventTitle}</strong> is bevestigd.
        </p>
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#166534;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Jouw aanmelding</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;width:90px;">Vacature</td><td style="padding:6px 0;color:#1C1814;font-size:14px;font-weight:700;">${vacancyTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Evenement</td><td style="padding:6px 0;color:#5C5248;font-size:14px;">${eventTitle}</td></tr>
            ${shiftRow}
            ${locationRow}
          </table>
        </div>
        <p style="color:#5C5248;font-size:14px;line-height:1.7;margin:0 0 24px;">
          De organisatie neemt binnenkort contact met je op met verdere informatie. Heb je vragen? Stuur dan een mail naar <a href="mailto:hello@bijeen.app" style="color:#C8522A;text-decoration:none;">hello@bijeen.app</a>.
        </p>
        <p style="color:#9E9890;font-size:13px;margin:24px 0 0;padding-top:20px;border-top:1px solid #F0E8DC;">
          Bedankt dat je een bijdrage levert!
        </p>
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}

// ─── Organisator: notificatie bij reactie op uitnodiging ─────────────────────

interface InvitationResponseNotificationProps {
  to: string;
  volunteerName: string;
  volunteerEmail: string;
  vacancyTitle: string;
  eventTitle: string;
  action: "accepted" | "declined";
  dashboardUrl: string;
}

export async function sendInvitationResponseNotification(props: InvitationResponseNotificationProps) {
  if (!resend) return;
  const { to, volunteerName: _vn, volunteerEmail: _ve, vacancyTitle: _vt, eventTitle: _et, action, dashboardUrl: _du } = props;
  const volunteerName  = escapeHtml(_vn);
  const volunteerEmail = escapeHtml(_ve);
  const vacancyTitle   = escapeHtml(_vt);
  const eventTitle     = escapeHtml(_et);
  const dashboardUrl   = sanitizeUrl(_du);
  const accepted = action === "accepted";

  await resend.emails.send({
    from:    "Bijeen <hello@bijeen.app>",
    replyTo: REPLY_TO,
    to,
    subject: accepted
      ? `✓ ${volunteerName} heeft je uitnodiging geaccepteerd — ${vacancyTitle}`
      : `${volunteerName} heeft je uitnodiging afgewezen — ${vacancyTitle}`,
    html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="https://bijeen.app/bijeen-icon.png" alt="Bijeen" width="40" height="40" style="height:40px;width:40px;border-radius:8px;" />
    </div>
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:${accepted ? "linear-gradient(135deg,#16a34a 0%,#15803d 100%)" : "linear-gradient(135deg,#64748b 0%,#475569 100%)"};padding:32px;text-align:center;">
        <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;letter-spacing:-0.3px;">
          ${accepted ? "Uitnodiging geaccepteerd 🎉" : "Uitnodiging afgewezen"}
        </h1>
      </div>
      <div style="padding:32px;">
        <p style="color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 20px;">
          ${accepted
            ? `<strong>${volunteerName}</strong> heeft je uitnodiging voor <strong>${vacancyTitle}</strong> geaccepteerd en staat klaar als vrijwilliger.`
            : `<strong>${volunteerName}</strong> heeft je uitnodiging voor <strong>${vacancyTitle}</strong> afgewezen.`
          }
        </p>
        <div style="background:#FFF8F5;border:1px solid #F5D4C4;border-radius:14px;padding:20px 24px;margin:0 0 24px;">
          <p style="color:#9E9890;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Details</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;width:90px;">Vrijwilliger</td><td style="padding:6px 0;color:#1C1814;font-size:14px;font-weight:700;">${volunteerName}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">E-mail</td><td style="padding:6px 0;color:#5C5248;font-size:14px;"><a href="mailto:${volunteerEmail}" style="color:#C8522A;text-decoration:none;">${volunteerEmail}</a></td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Vacature</td><td style="padding:6px 0;color:#1C1814;font-size:14px;font-weight:600;">${vacancyTitle}</td></tr>
            <tr><td style="padding:6px 0;color:#9E9890;font-size:12px;font-weight:700;">Evenement</td><td style="padding:6px 0;color:#5C5248;font-size:14px;">${eventTitle}</td></tr>
          </table>
        </div>
        ${accepted ? `<div style="text-align:center;">
          <a href="${dashboardUrl}" style="display:inline-block;background:#C8522A;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:13px 32px;border-radius:12px;letter-spacing:-0.2px;">
            Bekijk aanmelding in dashboard →
          </a>
        </div>` : `<p style="color:#9E9890;font-size:13px;text-align:center;margin:0;">Je kunt een andere vrijwilliger uitnodigen via het dashboard.</p>`}
      </div>
    </div>
    <p style="text-align:center;color:#B8B3AC;font-size:12px;margin-top:24px;">
      Verstuurd via <strong style="color:#9E9890;">Bijeen</strong>
    </p>
  </div>
</body>
</html>`,
  });
}
