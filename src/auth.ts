import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db, authUsers, authAccounts, authSessions, verificationTokens } from "@/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app";

function buildMagicLinkHtml(url: string) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inloggen bij Bijeen</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">

    <div style="text-align:center;margin-bottom:24px;">
      <img src="${BASE_URL}/Bijeen-logo.png" alt="Bijeen" width="130" height="40" style="height:40px;width:auto;display:inline-block;" />
    </div>

    <div style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <div style="background:linear-gradient(135deg,#C8522A 0%,#A8421F 100%);padding:36px 32px;text-align:center;">
        <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:26px;line-height:1;">🔑</div>
        <h1 style="color:#FFFFFF;font-size:22px;font-weight:800;margin:0 0 6px;letter-spacing:-0.3px;">Jouw inloglink</h1>
        <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;font-weight:500;">Bijeen — Evenementenplatform</p>
      </div>

      <div style="padding:32px;">
        <p style="color:#1C1814;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Klik op de knop hieronder om in te loggen bij Bijeen. Deze link is <strong>15 minuten</strong> geldig en kan maar één keer worden gebruikt.
        </p>

        <div style="text-align:center;margin:0 0 24px;">
          <a href="${url}"
             style="display:inline-block;background:#C8522A;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:15px;padding:15px 36px;border-radius:12px;letter-spacing:-0.2px;">
            Inloggen bij Bijeen →
          </a>
        </div>

        <div style="background:#FAF6F0;border-radius:12px;padding:14px 16px;">
          <p style="color:#9E9890;font-size:12px;margin:0;line-height:1.6;">
            Heb jij dit niet aangevraagd? Dan kun je deze e-mail gewoon negeren. Je account blijft veilig.
          </p>
        </div>
      </div>
    </div>

    <div style="text-align:center;padding:20px 0 0;">
      <p style="color:#B8B3AC;font-size:12px;line-height:1.6;margin:0;">
        <strong style="color:#9E9890;">Bijeen</strong> — het evenementenplatform voor de welzijnssector<br>
        Vragen? <a href="mailto:hello@bijeen.app" style="color:#9E9890;">hello@bijeen.app</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers as any,
    accountsTable: authAccounts as any,
    sessionsTable: authSessions as any,
    verificationTokensTable: verificationTokens as any,
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "Bijeen <hello@bijeen.app>",
      sendVerificationRequest: async ({ identifier, url }) => {
        const { Resend: ResendClient } = await import("resend");
        const resend = new ResendClient(process.env.RESEND_API_KEY!);
        await resend.emails.send({
          from: "Bijeen <hello@bijeen.app>",
          to: identifier,
          subject: "Jouw inloglink voor Bijeen",
          html: buildMagicLinkHtml(url),
        });
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in/verify",
    error: "/sign-in",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: { ...session.user, id: user.id },
    }),
  },
});
