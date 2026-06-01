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
          Versie 2.0 — van kracht per 1 juni 2026 · Bijeen is een concept van{" "}
          <strong className="text-ink">WeAreImpact B.V.</strong>
        </p>
      </div>

      <div className="space-y-8 text-sm text-ink leading-relaxed">

        {/* 1. Wie zijn wij */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">1. Wie zijn wij?</h2>
          <p>
            Bijeen is een evenementenplatform voor de Nederlandse welzijnssector, ontwikkeld door{" "}
            <strong>WeAreImpact B.V.</strong> Wij bieden organisaties een platform om evenementen te
            organiseren, deelnemers te registreren en verbindingen te faciliteren.
          </p>
          <div className="bg-sand/40 rounded-xl p-4 mt-3 text-sm">
            <p><strong>WeAreImpact B.V.</strong> — verwerkingsverantwoordelijke</p>
            <p>KvK: 70285888</p>
            <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
            <p>
              E-mail:{" "}
              <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">
                privacy@bijeen.app
              </a>
            </p>
          </div>
          <p className="mt-3">
            Wanneer een organisatie het Bijeen-platform inzet om haar eigen evenementen te beheren,
            treedt die organisatie op als <strong>verwerkingsverantwoordelijke</strong> voor de
            persoonsgegevens van haar deelnemers. WeAreImpact B.V. is in dat geval{" "}
            <strong>verwerker</strong>. De rechten en verplichtingen in die relatie zijn vastgelegd in
            onze{" "}
            <Link href="/verwerkersovereenkomst" className="text-terra-600 underline font-medium">
              Verwerkersovereenkomst
            </Link>
            .
          </p>
        </section>

        {/* 2. Welke gegevens */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">2. Welke persoonsgegevens verwerken wij?</h2>

          <div className="space-y-5">
            <div>
              <p className="font-semibold mb-2">2.1 Organisaties (platformgebruikers)</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Naam en e-mailadres van de accounthouder (voor inloggen via magic link)</li>
                <li>Naam, logo en contactgegevens van de organisatie</li>
                <li>Abonnementsgegevens en betaalinformatie (via Stripe — kaartgegevens worden niet door ons opgeslagen)</li>
                <li>IP-adres en sessie-informatie (beveiligings- en fraudepreventiedoeleinden)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">2.2 Evenementdeelnemers</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Naam en e-mailadres (verplicht voor registratie)</li>
                <li>Organisatienaam en functietitel (optioneel)</li>
                <li>Interessegebieden (optioneel, voor netwerkkoppelingen)</li>
                <li>Aanwezigheidsstatus, check-in tijdstip en QR-code</li>
                <li>Enquêteresultaten, waaronder cijfers, NPS-score en open antwoorden</li>
                <li>Vragen en berichten in de live Q&amp;A en social wall</li>
                <li>Door de organisator aangemaakte aangepaste velden (inhoud bepaald per evenement)</li>
                <li>Gamification-punten en badges (bij deelname aan interactieve onderdelen)</li>
              </ul>
              <p className="mt-2 text-ink-muted">
                <strong>Let op:</strong> enquêteresultaten zijn in de database gekoppeld aan uw
                deelnemersprofiel. Wanneer een organisator u laat weten dat de enquête{" "}
                &ldquo;anoniem&rdquo; is, betekent dat dat de resultaten niet persoonlijk zichtbaar zijn
                voor andere deelnemers, maar de koppeling met uw profiel blijft intern bestaan.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-2">2.3 Vrijwilligersprofielen en vacatureaanmeldingen</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Naam, e-mailadres en telefoonnummer</li>
                <li>Vaardigheden, beschikbaarheid en biografie</li>
                <li>Motivatiebrief bij een vacatureaanmelding</li>
                <li>Aanmeldingsstatus</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">2.4 CRM-contactpersonen</p>
              <p>
                Organisaties kunnen contactpersonen beheren in de ingebouwde CRM-module. Bijeen slaat
                daarvoor op: e-mailadres, naam, organisatie, functie, telefoonnummer, notities, tags
                en een betrokkenheidsscore op basis van evenementdeelname.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-2">2.5 Leads via de gratis impactrapportgenerator</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>E-mailadres en naam</li>
                <li>Organisatienaam, gemeente en evenementgegevens (voor rapportgeneratie)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Doeleinden */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">3. Waarvoor gebruiken wij uw gegevens?</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Toegang verlenen tot het platform (authenticatie via magic link)</li>
            <li>Registratie en beheer van evenementdeelnemers</li>
            <li>Versturen van transactionele e-mails: aanmeldingsbevestiging, herinneringen, bedankmail</li>
            <li>QR-codes genereren voor check-in bij evenementen</li>
            <li>
              AI-gestuurde netwerkkoppelingen — <strong>uitsluitend</strong> op basis van expliciete
              toestemming (zie paragraaf 5)
            </li>
            <li>Subsidie- en WMO-rapportages opstellen voor de organisatie</li>
            <li>Beheer van vrijwilligers en vacatures</li>
            <li>Versturen van bulk-e-mails door de organisator aan CRM-contacten</li>
            <li>Financiële administratie, facturatie en abonnementsbeheer</li>
            <li>Beveiliging, fraudepreventie en het oplossen van technische storingen</li>
            <li>
              Analytisch inzicht in websitegebruik — <strong>uitsluitend</strong> na uw toestemming
              (Google Analytics, zie paragraaf 8)
            </li>
          </ul>
        </section>

        {/* 4. Rechtsgrondslagen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">4. Rechtsgrondslagen</h2>
          <div className="space-y-2">
            <p>
              <strong>Uitvoering van een overeenkomst</strong> (art. 6 lid 1 sub b AVG): voor het
              leveren van platformdiensten aan organisaties en het verwerken van deelnemersregistraties
              namens de organisator.
            </p>
            <p>
              <strong>Toestemming</strong> (art. 6 lid 1 sub a AVG): voor AI-netwerkkoppelingen,
              web-push-meldingen, analytische cookies (Google Analytics) en e-mailmarketing door de
              organisator.
            </p>
            <p>
              <strong>Gerechtvaardigd belang</strong> (art. 6 lid 1 sub f AVG): voor beveiliging,
              fraudepreventie en het verbeteren van platformstabiliteit.
            </p>
            <p>
              <strong>Wettelijke verplichting</strong> (art. 6 lid 1 sub c AVG): voor belasting- en
              boekhoudverplichtingen (factuurgegevens).
            </p>
          </div>
        </section>

        {/* 5. AI-netwerkkoppelingen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">
            5. AI-netwerkkoppelingen (geautomatiseerde verwerking)
          </h2>
          <p>
            Bijeen biedt een AI-gestuurde netwerkfunctie waarbij deelnemers aan elkaar worden
            gekoppeld op basis van gedeelde interesses, organisatie en vakgebied. Deze functie wordt{" "}
            <strong>uitsluitend</strong> geactiveerd voor deelnemers die tijdens de registratie
            expliciet toestemming hebben gegeven via de checkbox &ldquo;Ik doe mee aan het AI-netwerk&rdquo;.
          </p>
          <p className="mt-2">
            <strong>Welke gegevens worden verwerkt:</strong> naam, organisatienaam, functietitel en
            interessegebieden worden via de OpenRouter API (model: Google Gemini Flash) verwerkt. Er
            worden maximaal 40 deelnemers per verwerking meegestuurd. De verwerking vindt plaats op
            servers buiten de EU (Verenigde Staten) — zie paragraaf 7 voor de transfergrondslag.
          </p>
          <p className="mt-2">
            <strong>Geen volledig geautomatiseerde besluitvorming:</strong> de door AI gegenereerde
            koppelingen zijn suggesties die de organisator beoordeelt. Er worden geen rechtsgevolgen
            verbonden aan de uitkomsten.
          </p>
          <p className="mt-2">
            U kunt uw toestemming voor AI-netwerkkoppelingen te allen tijde intrekken door contact op
            te nemen met{" "}
            <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">
              privacy@bijeen.app
            </a>{" "}
            of door rechtstreeks contact op te nemen met de organisator van het evenement.
          </p>
        </section>

        {/* 6. Bewaartermijnen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">6. Bewaartermijnen</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink/10">
                  <th className="text-left py-2 pr-4 font-semibold">Gegevenstype</th>
                  <th className="text-left py-2 font-semibold">Bewaartermijn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <tr>
                  <td className="py-2 pr-4">Accountgegevens organisaties</td>
                  <td className="py-2">Actief + 30 dagen na opzegging</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Deelnemersgegevens</td>
                  <td className="py-2">Tot 1 jaar na het evenement</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Financiële / factuurgegevens</td>
                  <td className="py-2">7 jaar (fiscale bewaarplicht)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Magic link tokens</td>
                  <td className="py-2">15 minuten</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Wachtlijst-tokens</td>
                  <td className="py-2">48 uur</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Push-notificatieabonnementen</td>
                  <td className="py-2">Tot uitschrijving of browsermelding</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">CRM-contactprofielen</td>
                  <td className="py-2">Zolang de organisatie actief is op het platform</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. Derden en subverwerkers */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">7. Derden, subverwerkers en internationale doorgifte</h2>
          <p className="mb-3">
            Wij delen gegevens alleen met derden wanneer dit noodzakelijk is voor de dienstverlening.
            Wij verkopen uw gegevens nooit aan derden. Onderstaande subverwerkers verwerken
            persoonsgegevens namens ons:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink/10">
                  <th className="text-left py-2 pr-3 font-semibold">Subverwerker</th>
                  <th className="text-left py-2 pr-3 font-semibold">Doel</th>
                  <th className="text-left py-2 font-semibold">Locatie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <tr>
                  <td className="py-2 pr-3">Neon (Postgres)</td>
                  <td className="py-2 pr-3">Databaseopslag</td>
                  <td className="py-2">EU (eu-central-1)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Resend</td>
                  <td className="py-2 pr-3">E-mailbezorging</td>
                  <td className="py-2">VS*</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Stripe</td>
                  <td className="py-2 pr-3">Betalingsverwerking</td>
                  <td className="py-2">VS*</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">OpenRouter / Google Gemini</td>
                  <td className="py-2 pr-3">AI-netwerkkoppelingen (alleen met toestemming)</td>
                  <td className="py-2">VS*</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Pusher</td>
                  <td className="py-2 pr-3">Realtime communicatie</td>
                  <td className="py-2">EU</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Vercel Blob</td>
                  <td className="py-2 pr-3">Bestandsopslag (afbeeldingen, logo&apos;s)</td>
                  <td className="py-2">VS*</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Google Analytics</td>
                  <td className="py-2 pr-3">Websiteanalyse (alleen na toestemming)</td>
                  <td className="py-2">VS*</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-ink-muted text-xs">
            * Doorgifte naar de Verenigde Staten vindt plaats op basis van door de Europese Commissie
            goedgekeurde Standard Contractual Clauses (SCC&apos;s, art. 46 lid 2 sub c AVG). De
            betrokken subverwerkers zijn gecertificeerd onder het EU-US Data Privacy Framework of
            hebben SCC&apos;s ondertekend.
          </p>
          <p className="mt-2">
            Een uitgebreid overzicht van de rechten en verplichtingen tussen Bijeen en organisaties
            die het platform gebruiken staat in de{" "}
            <Link href="/verwerkersovereenkomst" className="text-terra-600 underline font-medium">
              Verwerkersovereenkomst
            </Link>
            .
          </p>
        </section>

        {/* 8. Cookies en analytics */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">8. Cookies en analytische tracering</h2>
          <p className="mb-3">
            Bijeen gebruikt twee categorieën cookies:
          </p>
          <div className="space-y-3">
            <div className="bg-sand/40 rounded-xl p-4">
              <p className="font-semibold mb-1">Functionele cookies (altijd actief)</p>
              <p className="text-ink-muted">
                Noodzakelijk voor het functioneren van het platform: sessiebeheer (
                <code className="bg-ink/5 px-1 rounded text-xs">next-auth.session-token</code>),
                inlogstatus en beveiligingsinstellingen. Hiervoor is geen toestemming vereist.
              </p>
            </div>
            <div className="bg-sand/40 rounded-xl p-4">
              <p className="font-semibold mb-1">Analytische cookies (alleen na toestemming)</p>
              <p className="text-ink-muted">
                Wij gebruiken Google Analytics 4 (tracking-ID{" "}
                <code className="bg-ink/5 px-1 rounded text-xs">G-W1RTS0R3G1</code>) om inzicht te
                krijgen in het websitegebruik. Google Analytics cookies worden pas geladen nadat u
                toestemming heeft gegeven via de cookiebanner. Wij maken gebruik van Google Consent
                Mode v2, wat betekent dat bij weigering geen analytische cookies worden geplaatst.
              </p>
            </div>
          </div>
          <p className="mt-3">
            Meer informatie en de mogelijkheid om uw voorkeur te wijzigen vindt u op onze{" "}
            <Link href="/cookiebeleid" className="text-terra-600 underline font-medium">
              cookiebeleid-pagina
            </Link>
            .
          </p>
        </section>

        {/* 9. Beveiliging */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">9. Beveiliging</h2>
          <p>
            Wij treffen de volgende technische en organisatorische beveiligingsmaatregelen:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Versleutelde verbindingen (HTTPS/TLS) voor alle datadoorgifte</li>
            <li>HSTS (HTTP Strict Transport Security) met preloading</li>
            <li>Sessiebeheer via kortlevende JWT-tokens en magic links (15 minuten geldig)</li>
            <li>Wachtwoordopslag met bcrypt-hashing (voor admin-accounts)</li>
            <li>Toegangscontrole per organisatie: medewerkers zien alleen hun eigen evenementdata</li>
            <li>Rate limiting op publieke API-eindpunten</li>
            <li>Primaire dataopslag in EU-datacenters (Neon eu-central-1)</li>
          </ul>
          <p className="mt-2">
            Bij een datalek dat risico oplevert voor uw rechten en vrijheden, informeren wij de
            Autoriteit Persoonsgegevens binnen 72 uur. Betrokkenen worden zonder onredelijke vertraging
            op de hoogte gesteld als de inbreuk waarschijnlijk een hoog risico inhoudt.
          </p>
        </section>

        {/* 10. Uw rechten */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">10. Uw rechten als betrokkene</h2>
          <p>Op grond van de AVG heeft u de volgende rechten:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Inzage (art. 15 AVG):</strong> opvragen welke gegevens wij van u verwerken en
              een kopie ontvangen.
            </li>
            <li>
              <strong>Rectificatie (art. 16 AVG):</strong> onjuiste of onvolledige gegevens laten
              corrigeren.
            </li>
            <li>
              <strong>Verwijdering (art. 17 AVG):</strong> uw gegevens laten wissen
              (&ldquo;recht op vergetelheid&rdquo;), voor zover geen wettelijke bewaarplicht geldt.
            </li>
            <li>
              <strong>Beperking van verwerking (art. 18 AVG):</strong> de verwerking (tijdelijk)
              laten beperken.
            </li>
            <li>
              <strong>Bezwaar (art. 21 AVG):</strong> bezwaar maken tegen verwerking op basis van
              gerechtvaardigd belang.
            </li>
            <li>
              <strong>Overdraagbaarheid (art. 20 AVG):</strong> uw gegevens in een gangbaar
              machine-leesbaar formaat ontvangen.
            </li>
            <li>
              <strong>Intrekking toestemming (art. 7 lid 3 AVG):</strong> eerder gegeven toestemming
              (voor AI-koppelingen, analytische cookies of push-meldingen) te allen tijde intrekken,
              zonder dat dit terugwerkende kracht heeft.
            </li>
          </ul>
          <p className="mt-3">
            Verzoeken kunt u richten aan{" "}
            <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">
              privacy@bijeen.app
            </a>
            . Wij reageren binnen <strong>30 dagen</strong>. In complexe gevallen kan dit worden
            verlengd met twee maanden; u wordt hiervan op de hoogte gesteld.
          </p>
          <p className="mt-2">
            U heeft ook het recht een klacht in te dienen bij de{" "}
            <a
              href="https://www.autoriteitpersoonsgegevens.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-terra-600 underline"
            >
              Autoriteit Persoonsgegevens
            </a>{" "}
            (Bezuidenhoutseweg 30, 2594 AV Den Haag, tel. 088 1805 250).
          </p>
        </section>

        {/* 11. Wijzigingen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">11. Wijzigingen in deze verklaring</h2>
          <p>
            Wij behouden ons het recht voor deze privacyverklaring aan te passen, bijvoorbeeld bij
            gewijzigde wetgeving of nieuwe verwerkingen. De meest actuele versie staat altijd op deze
            pagina met datum van inwerkingtreding. Wezenlijke wijzigingen worden via e-mail
            gecommuniceerd aan geregistreerde platformgebruikers.
          </p>
          <p className="mt-2 text-ink-muted text-xs">
            Eerdere versie: v1.0 (1 januari 2026)
          </p>
        </section>

        {/* Contact */}
        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Contact voor privacyvragen</h2>
          <p>
            WeAreImpact B.V. — Bijeen platform<br />
            Heintje Hoeksteeg 11a, 1012 GR Amsterdam<br />
            <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline font-medium">
              privacy@bijeen.app
            </a>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/cookiebeleid" className="text-xs text-terra-600 underline">
              Cookiebeleid
            </Link>
            <Link href="/verwerkersovereenkomst" className="text-xs text-terra-600 underline">
              Verwerkersovereenkomst
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
