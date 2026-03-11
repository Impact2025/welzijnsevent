import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacyverklaring — Bijeen",
  description: "Hoe Bijeen omgaat met jouw persoonsgegevens.",
};

export default function PrivacyverklaringPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-terra-500 mb-2">Juridisch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Privacyverklaring
        </h1>
        <p className="text-ink-muted text-sm">
          Versie 1.0 — van kracht per 1 januari 2026 · Bijeen is een concept van{" "}
          <strong className="text-ink">WeAreImpact B.V.</strong>
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">1. Wie zijn wij?</h2>
          <p>
            Bijeen is een evenementenplatform voor de Nederlandse welzijnssector, ontwikkeld door
            <strong> WeAreImpact B.V.</strong> Wij bieden organisaties een platform om evenementen
            te organiseren, deelnemers te registreren en verbindingen te faciliteren.
          </p>
          <div className="bg-sand/40 rounded-xl p-4 mt-3 text-sm">
            <p><strong>WeAreImpact B.V.</strong></p>
            <p>KvK: [KVK-nummer]</p>
            <p>E-mail: <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">privacy@bijeen.app</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">2. Welke gegevens verwerken wij?</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Organisaties (gebruikers van het platform)</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Naam en e-mailadres (voor inloggen via magic link)</li>
                <li>Organisatienaam en logo</li>
                <li>Abonnementsgegevens en betaalinformatie (via MultiSafepay)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Evenementdeelnemers</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Naam en e-mailadres</li>
                <li>Organisatie en functietitel (optioneel)</li>
                <li>Interessegebieden (optioneel, voor netwerkkoppelingen)</li>
                <li>Aanwezigheidsstatus en check-in tijdstip</li>
                <li>Enquêteresultaten (optioneel)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">3. Waarvoor gebruiken wij uw gegevens?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Toegang verlenen tot het platform (authenticatie)</li>
            <li>Registratie en beheer van evenementdeelnemers</li>
            <li>Versturen van bevestiging-, herinneringse- en bedankmails</li>
            <li>QR-codes genereren voor check-in</li>
            <li>AI-gestuurde netwerkkoppelingen (alleen met expliciete toestemming)</li>
            <li>Verbetering van het platform (geanonimiseerde statistieken)</li>
            <li>Financiële administratie en facturatie</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">4. Rechtsgrondslagen</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Uitvoering overeenkomst</strong> (art. 6 lid 1 sub b AVG): voor het leveren van de platformdiensten.</li>
            <li><strong>Toestemming</strong> (art. 6 lid 1 sub a AVG): voor AI-netwerkkoppelingen en optionele profielvelden.</li>
            <li><strong>Gerechtvaardigd belang</strong> (art. 6 lid 1 sub f AVG): voor beveiliging en fraudepreventie.</li>
            <li><strong>Wettelijke verplichting</strong> (art. 6 lid 1 sub c AVG): voor belasting- en boekhoudverplichtingen.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">5. Hoe lang bewaren wij uw gegevens?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accountgegevens: zolang het account actief is, plus 30 dagen na opzegging.</li>
            <li>Deelnemersgegevens: tot 1 jaar na het evenement, tenzij de organisatie eerder verwijdering verzoekt.</li>
            <li>Financiële gegevens: 7 jaar (wettelijke bewaarplicht).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">6. Derden en subverwerkers</h2>
          <p>
            Wij delen gegevens alleen met derden wanneer dit noodzakelijk is voor de dienstverlening.
            Een volledig overzicht van onze subverwerkers is opgenomen in de{" "}
            <Link href="/verwerkersovereenkomst" className="text-terra-600 underline font-medium">
              Verwerkersovereenkomst
            </Link>
            . Wij verkopen uw gegevens nooit aan derden.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">7. Beveiliging</h2>
          <p>
            Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen,
            waaronder versleutelde verbindingen (HTTPS), toegangsbeveiliging en opslag in
            EU-datacenters.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">8. Uw rechten</h2>
          <p>Op grond van de AVG heeft u de volgende rechten:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Inzage</strong>: opvragen welke gegevens wij van u hebben.</li>
            <li><strong>Rectificatie</strong>: onjuiste gegevens laten corrigeren.</li>
            <li><strong>Verwijdering</strong>: uw gegevens laten wissen ("recht op vergetelheid").</li>
            <li><strong>Beperking</strong>: de verwerking laten beperken.</li>
            <li><strong>Bezwaar</strong>: bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</li>
            <li><strong>Overdraagbaarheid</strong>: uw gegevens in een gangbaar formaat ontvangen.</li>
            <li><strong>Intrekking toestemming</strong>: eerder gegeven toestemming intrekken.</li>
          </ul>
          <p className="mt-3">
            Verzoeken kunt u richten aan{" "}
            <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">privacy@bijeen.app</a>.
            Wij reageren binnen 30 dagen. U heeft ook het recht een klacht in te dienen bij de{" "}
            <a href="https://www.autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-terra-600 underline">
              Autoriteit Persoonsgegevens
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">9. Cookies</h2>
          <p>
            Bijeen gebruikt uitsluitend functionele cookies die noodzakelijk zijn voor het functioneren
            van het platform (sessiebeheer). Wij gebruiken geen tracking- of advertentiecookies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-ink mb-3">10. Wijzigingen</h2>
          <p>
            Wij behouden ons het recht voor deze verklaring aan te passen. Wezenlijke wijzigingen
            worden via e-mail gecommuniceerd aan geregistreerde gebruikers.
          </p>
        </section>

        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Contact</h2>
          <p>
            WeAreImpact B.V. — Bijeen platform<br />
            <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline font-medium">privacy@bijeen.app</a>
          </p>
        </section>

      </div>
    </div>
  );
}
