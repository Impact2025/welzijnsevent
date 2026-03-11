import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verwerkersovereenkomst — Bijeen",
  description: "AVG-conforme verwerkersovereenkomst voor gebruik van het Bijeen evenementenplatform.",
};

export default function VerwerkersovereenkomstPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-terra-500 mb-2">Juridisch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Verwerkersovereenkomst
        </h1>
        <p className="text-ink-muted text-sm">
          Versie 1.0 — van kracht per 1 januari 2026 · Bijeen is een concept van{" "}
          <strong className="text-ink">WeAreImpact B.V.</strong>
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-ink leading-relaxed space-y-8">

        {/* Partijen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Partijen</h2>
          <p>
            Deze verwerkersovereenkomst (hierna: "Overeenkomst") wordt gesloten tussen:
          </p>
          <div className="bg-sand/40 rounded-xl p-4 mt-3 space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">Verwerkingsverantwoordelijke</p>
              <p className="text-sm">
                De organisatie die een account heeft aangemaakt op het Bijeen-platform en daarmee
                persoonsgegevens van haar deelnemers verwerkt (hierna: <strong>"Verwerkingsverantwoordelijke"</strong>).
              </p>
            </div>
            <div className="border-t border-sand pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-1">Verwerker</p>
              <p className="text-sm">
                <strong>WeAreImpact B.V.</strong><br />
                KvK: [KVK-nummer invullen]<br />
                Adres: [Adres invullen]<br />
                E-mail: <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">privacy@bijeen.app</a><br />
                hierna: <strong>"Bijeen"</strong> of <strong>"Verwerker"</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Artikel 1 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 1 — Definities</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>AVG:</strong> Verordening (EU) 2016/679 (Algemene Verordening Gegevensbescherming).</li>
            <li><strong>Persoonsgegevens:</strong> Alle informatie over een geïdentificeerde of identificeerbare natuurlijke persoon.</li>
            <li><strong>Verwerking:</strong> Elke bewerking op persoonsgegevens, zoals verzamelen, opslaan, raadplegen, versturen of verwijderen.</li>
            <li><strong>Betrokkene:</strong> De natuurlijke persoon op wie persoonsgegevens betrekking hebben (deelnemers, bezoekers van evenementen).</li>
            <li><strong>Subverwerker:</strong> Een derde partij die door Bijeen wordt ingeschakeld voor verwerking namens de Verwerkingsverantwoordelijke.</li>
            <li><strong>Platform:</strong> Het Bijeen evenementenplatform, bereikbaar via bijeen.app.</li>
          </ul>
        </section>

        {/* Artikel 2 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 2 — Onderwerp en duur</h2>
          <p className="text-sm">
            Deze Overeenkomst regelt de verwerking van persoonsgegevens door Bijeen ten behoeve van de
            Verwerkingsverantwoordelijke bij het gebruik van het Platform. De Overeenkomst is van kracht
            zolang de Verwerkingsverantwoordelijke gebruik maakt van het Platform en eindigt automatisch
            bij beëindiging van de dienstverleningsovereenkomst.
          </p>
        </section>

        {/* Artikel 3 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 3 — Aard, doel en soort verwerking</h2>
          <div className="text-sm space-y-3">
            <p>
              Bijeen verwerkt persoonsgegevens uitsluitend ten behoeve van de volgende doeleinden:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registratie en beheer van deelnemers aan evenementen van de Verwerkingsverantwoordelijke;</li>
              <li>Versturen van bevestigings-, herinneringse- en bedankmails namens de Verwerkingsverantwoordelijke;</li>
              <li>Genereren van QR-codes en check-in functionaliteit;</li>
              <li>AI-gestuurde netwerkkoppelingen op basis van opgegeven interesses (na expliciete toestemming betrokkene);</li>
              <li>Weergave van evenementpagina's en registratieformulieren;</li>
              <li>Verwerking van enquêteresultaten en feedback.</li>
            </ul>
            <div className="bg-sand/40 rounded-xl p-4 mt-2">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">Verwerkte persoonsgegevens</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Voor- en achternaam</li>
                <li>E-mailadres</li>
                <li>Organisatie en functietitel</li>
                <li>Interessegebieden (optioneel)</li>
                <li>Antwoorden op evenement-specifieke vragen (optioneel)</li>
                <li>Check-in tijdstip en aanwezigheidsstatus</li>
                <li>Enquêteresultaten en beoordelingen</li>
              </ul>
            </div>
            <p>
              <strong>Categorieën betrokkenen:</strong> Deelnemers, bezoekers en medewerkers van organisaties
              die evenementen organiseren via het Platform.
            </p>
          </div>
        </section>

        {/* Artikel 4 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 4 — Verplichtingen van de Verwerker</h2>
          <div className="text-sm space-y-3">
            <p>Bijeen verplicht zich jegens de Verwerkingsverantwoordelijke tot het volgende:</p>

            <div>
              <p className="font-semibold mb-1">4.1 Instructies</p>
              <p>
                Bijeen verwerkt persoonsgegevens uitsluitend op basis van gedocumenteerde instructies van
                de Verwerkingsverantwoordelijke, tenzij een wettelijke verplichting anders vereist.
                In dat geval stelt Bijeen de Verwerkingsverantwoordelijke hiervan op de hoogte, tenzij
                de wet dit verbiedt.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.2 Vertrouwelijkheid</p>
              <p>
                Bijeen zorgt ervoor dat personen die gemachtigd zijn persoonsgegevens te verwerken,
                zich hebben verbonden aan vertrouwelijkheid of onderworpen zijn aan een passende
                wettelijke geheimhoudingsplicht.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.3 Beveiliging (art. 32 AVG)</p>
              <p>
                Bijeen treft passende technische en organisatorische maatregelen ter beveiliging van
                persoonsgegevens, waaronder:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Versleutelde verbindingen (TLS/HTTPS)</li>
                <li>Toegangsbeveiliging met authenticatie (magic link via Resend)</li>
                <li>Data-isolatie per organisatie op databaseniveau</li>
                <li>Opslag in EU-datacenters (Neon Postgres, eu-central-1)</li>
                <li>Regelmatige beveiligingsupdates en dependency patching</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-1">4.4 Subverwerkers</p>
              <p>
                Bijeen maakt gebruik van de volgende subverwerkers. De Verwerkingsverantwoordelijke
                verleent hiervoor bij aanvang van de Overeenkomst algemene toestemming:
              </p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border border-sand rounded-xl overflow-hidden">
                  <thead className="bg-sand/60">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold">Subverwerker</th>
                      <th className="text-left px-3 py-2 font-semibold">Doel</th>
                      <th className="text-left px-3 py-2 font-semibold">Locatie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand">
                    <tr><td className="px-3 py-2">Neon (Neon Inc.)</td><td className="px-3 py-2">Databaseopslag</td><td className="px-3 py-2">EU (Frankfurt)</td></tr>
                    <tr><td className="px-3 py-2">Vercel Inc.</td><td className="px-3 py-2">Hosting, opslag</td><td className="px-3 py-2">EU / VS*</td></tr>
                    <tr><td className="px-3 py-2">Resend Inc.</td><td className="px-3 py-2">Transactionele e-mail</td><td className="px-3 py-2">VS*</td></tr>
                    <tr><td className="px-3 py-2">Pusher Ltd.</td><td className="px-3 py-2">Realtime communicatie</td><td className="px-3 py-2">EU</td></tr>
                    <tr><td className="px-3 py-2">OpenRouter (via Anthropic / Google)</td><td className="px-3 py-2">AI-netwerkkoppelingen</td><td className="px-3 py-2">VS*</td></tr>
                    <tr><td className="px-3 py-2">MultiSafepay B.V.</td><td className="px-3 py-2">Betalingsverwerking</td><td className="px-3 py-2">NL (EU)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-ink-muted mt-2">
                * Doorgifte naar derde landen vindt plaats op basis van adequaatheidsbesluiten of
                Standard Contractual Clauses (SCC's) conform art. 46 AVG.
              </p>
              <p className="mt-2">
                Bijeen informeert de Verwerkingsverantwoordelijke vooraf over wijzigingen in de lijst
                van subverwerkers. De Verwerkingsverantwoordelijke heeft het recht bezwaar te maken.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.5 Ondersteuning betrokkenenrechten</p>
              <p>
                Bijeen assisteert de Verwerkingsverantwoordelijke bij het nakomen van verzoeken
                van betrokkenen (inzage, rectificatie, verwijdering, beperking, overdraagbaarheid)
                voor zover dit technisch mogelijk is binnen het Platform.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.6 Meldplicht datalekken</p>
              <p>
                Bijeen meldt een inbreuk op de beveiliging die leidt tot vernietiging, verlies,
                wijziging of ongeoorloofde verstrekking van persoonsgegevens, zonder onredelijke
                vertraging en uiterlijk binnen <strong>72 uur</strong> na ontdekking, aan de
                Verwerkingsverantwoordelijke via{" "}
                <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">privacy@bijeen.app</a>.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.7 Verwijdering na einde dienstverlening</p>
              <p>
                Na beëindiging van de Overeenkomst verwijdert Bijeen alle persoonsgegevens van de
                Verwerkingsverantwoordelijke uiterlijk binnen <strong>30 dagen</strong>, tenzij de wet
                langere bewaring verplicht. Op verzoek verstrekt Bijeen een exportbestand van de
                gegevens vóór verwijdering.
              </p>
            </div>

            <div>
              <p className="font-semibold mb-1">4.8 Audit en verantwoording</p>
              <p>
                Bijeen stelt alle informatie beschikbaar die nodig is om de nakoming van de verplichtingen
                uit art. 28 AVG aan te tonen. Bijeen werkt mee aan audits of inspecties uitgevoerd door
                de Verwerkingsverantwoordelijke of een door haar aangestelde auditor, na minimaal
                4 weken voorafgaande kennisgeving.
              </p>
            </div>
          </div>
        </section>

        {/* Artikel 5 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 5 — Verplichtingen van de Verwerkingsverantwoordelijke</h2>
          <div className="text-sm space-y-2">
            <p>De Verwerkingsverantwoordelijke garandeert dat:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>zij beschikt over een geldige rechtsgrondslag voor de verwerking van persoonsgegevens via het Platform;</li>
              <li>de deelnemers afdoende zijn geïnformeerd over de verwerking van hun gegevens (privacyverklaring);</li>
              <li>zij Bijeen tijdig en volledig informeert over wijzigingen die van invloed zijn op de verwerking;</li>
              <li>zij de verplichtingen uit de AVG naleeft in haar hoedanigheid als Verwerkingsverantwoordelijke.</li>
            </ul>
          </div>
        </section>

        {/* Artikel 6 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 6 — Aansprakelijkheid</h2>
          <p className="text-sm">
            De aansprakelijkheid van Bijeen voor schade als gevolg van een schending van deze
            Overeenkomst is beperkt tot directe schade en gemaximeerd op het bedrag dat de
            Verwerkingsverantwoordelijke in de twaalf (12) maanden voorafgaand aan het schadeveroorzakende
            event aan Bijeen heeft betaald. Bijeen is niet aansprakelijk voor indirecte schade,
            gevolgschade of winstderving.
          </p>
        </section>

        {/* Artikel 7 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 7 — Toepasselijk recht en geschillen</h2>
          <p className="text-sm">
            Op deze Overeenkomst is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de
            bevoegde rechter in het arrondissement Amsterdam, tenzij partijen een alternatieve
            geschillenbeslechtingsprocedure overeenkomen.
          </p>
        </section>

        {/* Artikel 8 */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 8 — Wijzigingen</h2>
          <p className="text-sm">
            Bijeen behoudt zich het recht voor deze Overeenkomst te wijzigen. Wezenlijke wijzigingen
            worden minimaal <strong>30 dagen</strong> van tevoren aangekondigd via e-mail en/of het
            dashboard. Voortgezet gebruik van het Platform na de ingangsdatum geldt als aanvaarding
            van de gewijzigde Overeenkomst.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Contact &amp; Functionaris Gegevensbescherming</h2>
          <p className="text-sm text-ink-muted">
            Voor vragen over deze Overeenkomst of de verwerking van persoonsgegevens:
          </p>
          <div className="mt-3 text-sm space-y-1">
            <p><strong>WeAreImpact B.V.</strong> — Bijeen platform</p>
            <p>E-mail: <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline font-medium">privacy@bijeen.app</a></p>
            <p>Website: <a href="https://www.bijeen.app" className="text-terra-600 underline">www.bijeen.app</a></p>
          </div>
        </section>

      </div>
    </div>
  );
}
