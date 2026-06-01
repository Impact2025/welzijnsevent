import type { Metadata } from "next";
import Link from "next/link";
import { ConsentManager } from "./consent-manager";

export const metadata: Metadata = {
  title: "Cookiebeleid — Bijeen",
  description: "Welke cookies Bijeen gebruikt en hoe u uw voorkeur kunt beheren.",
};

export default function CookiebeleidPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-terra-500 mb-2">Juridisch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Cookiebeleid
        </h1>
        <p className="text-ink-muted text-sm">
          Versie 1.0 — van kracht per 1 juni 2026 · Bijeen is een concept van{" "}
          <strong className="text-ink">WeAreImpact B.V.</strong>
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">1. Wat zijn cookies?</h2>
          <p>
            Cookies zijn kleine tekstbestanden die bij een bezoek aan een website op uw apparaat
            worden opgeslagen. Ze worden gebruikt om de werking van de website te ondersteunen of om
            informatie te verzamelen over het bezoek.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">2. Welke cookies gebruikt Bijeen?</h2>

          <div className="space-y-4">
            {/* Functionele cookies */}
            <div className="border border-ink/8 rounded-xl overflow-hidden">
              <div className="bg-ink/[0.03] px-4 py-3 flex items-center justify-between">
                <p className="font-semibold">Functionele cookies</p>
                <span className="text-xs bg-ink/10 text-ink/60 px-2 py-0.5 rounded-full">
                  Altijd actief
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-ink-muted">
                  Noodzakelijk voor het functioneren van het platform. Hiervoor is geen toestemming
                  vereist (Telecomwet art. 11.7a lid 3).
                </p>
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="border-b border-ink/8">
                      <th className="text-left py-1.5 pr-3 font-semibold text-ink/60">Cookie</th>
                      <th className="text-left py-1.5 pr-3 font-semibold text-ink/60">Doel</th>
                      <th className="text-left py-1.5 font-semibold text-ink/60">Levensduur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    <tr>
                      <td className="py-1.5 pr-3 font-mono text-[11px]">next-auth.session-token</td>
                      <td className="py-1.5 pr-3">Inlogsessie bijhouden</td>
                      <td className="py-1.5">Sessie / 30 dagen</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-mono text-[11px]">__Secure-next-auth.*</td>
                      <td className="py-1.5 pr-3">Beveiligde sessievarianten (HTTPS)</td>
                      <td className="py-1.5">Sessie / 30 dagen</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analytische cookies */}
            <div className="border border-ink/8 rounded-xl overflow-hidden">
              <div className="bg-ink/[0.03] px-4 py-3 flex items-center justify-between">
                <p className="font-semibold">Analytische cookies</p>
                <span className="text-xs bg-terra-100 text-terra-700 px-2 py-0.5 rounded-full">
                  Toestemming vereist
                </span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <p className="text-ink-muted">
                  Wij gebruiken <strong>Google Analytics 4</strong> (GA4) om te meten hoeveel
                  bezoekers de website gebruiken en welke pagina&apos;s populair zijn. Deze informatie
                  helpt ons de website te verbeteren. Google Analytics cookies worden pas geplaatst
                  nadat u toestemming heeft gegeven via de cookiebanner. Wij maken gebruik van{" "}
                  <strong>Google Consent Mode v2</strong>: bij weigering worden geen analytische
                  cookies geplaatst.
                </p>
                <table className="w-full text-xs border-collapse mt-2">
                  <thead>
                    <tr className="border-b border-ink/8">
                      <th className="text-left py-1.5 pr-3 font-semibold text-ink/60">Cookie</th>
                      <th className="text-left py-1.5 pr-3 font-semibold text-ink/60">Doel</th>
                      <th className="text-left py-1.5 font-semibold text-ink/60">Levensduur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    <tr>
                      <td className="py-1.5 pr-3 font-mono text-[11px]">_ga</td>
                      <td className="py-1.5 pr-3">Unieke bezoeker onderscheiden</td>
                      <td className="py-1.5">2 jaar</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-mono text-[11px]">_ga_W1RTS0R3G1</td>
                      <td className="py-1.5 pr-3">Sessiedata opslaan voor GA4</td>
                      <td className="py-1.5">2 jaar</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-ink-muted mt-2 text-xs">
                  Gegevens worden doorgegeven aan Google LLC (VS). Doorgifte vindt plaats op basis
                  van Standard Contractual Clauses (SCC&apos;s). Google is gecertificeerd onder het EU-US
                  Data Privacy Framework.{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terra-600 underline"
                  >
                    Privacybeleid Google
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">3. Hoe geeft u toestemming?</h2>
          <p>
            Bij uw eerste bezoek wordt een cookiebanner getoond. U kunt analytische cookies
            accepteren of weigeren. Uw keuze wordt opgeslagen in uw browser (
            <code className="bg-ink/5 px-1 rounded text-xs">bijeen_cookie_consent</code>). U kunt uw
            voorkeur hieronder te allen tijde wijzigen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">4. Uw voorkeur beheren</h2>
          <ConsentManager />
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">5. Cookies weigeren via uw browser</h2>
          <p>
            U kunt cookies ook beheren via de instellingen van uw browser. Let op: het uitschakelen
            van functionele cookies kan de werking van het platform beïnvloeden. Meer informatie:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a
                href="https://support.mozilla.org/nl/kb/cookies-informatie-websites-computer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a
                href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a
                href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">6. Wijzigingen</h2>
          <p>
            Wij behouden ons het recht voor dit cookiebeleid aan te passen. De meest actuele versie
            staat altijd op deze pagina.
          </p>
        </section>

        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Vragen over cookies?</h2>
          <p>
            WeAreImpact B.V. — Bijeen platform
            <br />
            <a
              href="mailto:privacy@bijeen.app"
              className="text-terra-600 underline font-medium"
            >
              privacy@bijeen.app
            </a>
          </p>
          <div className="mt-3">
            <Link href="/privacyverklaring" className="text-xs text-terra-600 underline">
              Terug naar privacyverklaring
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
