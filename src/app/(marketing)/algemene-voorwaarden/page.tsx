import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden — Bijeen",
  description:
    "Algemene voorwaarden voor organisaties die gebruikmaken van het Bijeen evenementenplatform.",
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-terra-500 mb-2">Juridisch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Algemene Voorwaarden
        </h1>
        <p className="text-ink-muted text-sm">
          Versie 1.0 — van kracht per 1 juni 2026
        </p>
        <div className="bg-sand/40 rounded-xl p-4 mt-4 text-sm">
          <p><strong>WeAreImpact B.V.</strong> — handelend onder de naam Bijeen</p>
          <p>KvK Amsterdam: 70285888</p>
          <p>BTW-nummer: NL858236369B01</p>
          <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
          <p>
            E-mail:{" "}
            <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline">
              hallo@bijeen.nl
            </a>
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-ink leading-relaxed">

        {/* Art 1 — Definities */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 1 — Definities</h2>
          <p className="mb-2">In deze Algemene Voorwaarden wordt verstaan onder:</p>
          <ul className="space-y-2">
            <li>
              <strong>Bijeen:</strong> WeAreImpact B.V., gevestigd te Amsterdam, handelend onder de
              naam Bijeen, ingeschreven bij de KvK onder nummer 70285888.
            </li>
            <li>
              <strong>Klant:</strong> De rechtspersoon of natuurlijke persoon die handelt in de
              uitoefening van een beroep of bedrijf, dan wel als vertegenwoordiger van een organisatie,
              en die met Bijeen een Overeenkomst aangaat of heeft aangegaan.
            </li>
            <li>
              <strong>Overeenkomst:</strong> De overeenkomst tussen Bijeen en de Klant op grond
              waarvan Bijeen toegang verleent tot het Platform, inclusief eventueel overeengekomen
              diensten.
            </li>
            <li>
              <strong>Platform:</strong> De SaaS-softwareoplossing van Bijeen, bereikbaar via{" "}
              <span className="font-medium">bijeen.app</span> en eventuele subdomeinen, waarmee
              organisaties evenementen kunnen aanmaken, beheren en deelnemers kunnen registreren.
            </li>
            <li>
              <strong>Abonnement:</strong> De door de Klant gekozen betaalvorm voor het gebruik van
              het Platform (Community, Welzijn, Netwerk, Organisatie of Platform).
            </li>
            <li>
              <strong>Abonnementsperiode:</strong> De overeengekomen periode waarvoor een Abonnement
              wordt afgenomen (per evenement of jaarlijks).
            </li>
            <li>
              <strong>Gratis proef:</strong> Een periode van veertien (14) kalenderdagen waarin de
              Klant kosteloos gebruik kan maken van betaalde functionaliteiten van het Platform.
            </li>
            <li>
              <strong>Gebruiker:</strong> Een natuurlijke persoon die namens de Klant gebruik maakt
              van het Platform.
            </li>
            <li>
              <strong>Deelnemer:</strong> Een natuurlijke persoon die zich via het Platform inschrijft
              voor een evenement van de Klant.
            </li>
            <li>
              <strong>Klantgegevens:</strong> Alle gegevens en inhoud die de Klant of Deelnemers via
              het Platform uploaden of invoeren.
            </li>
            <li>
              <strong>AVG:</strong> Verordening (EU) 2016/679 (Algemene Verordening
              Gegevensbescherming).
            </li>
          </ul>
        </section>

        {/* Art 2 — Toepasselijkheid */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 2 — Toepasselijkheid</h2>
          <div className="space-y-2">
            <p>
              2.1 Deze Algemene Voorwaarden zijn van toepassing op alle aanbiedingen, offertes en
              Overeenkomsten tussen Bijeen en de Klant waarbij Bijeen het Platform beschikbaar stelt.
            </p>
            <p>
              2.2 Afwijkingen van deze Voorwaarden zijn slechts geldig indien schriftelijk overeengekomen
              en door een bevoegd vertegenwoordiger van Bijeen ondertekend.
            </p>
            <p>
              2.3 Bijeen wijst de toepasselijkheid van algemene voorwaarden van de Klant uitdrukkelijk
              van de hand.
            </p>
            <p>
              2.4 Door het aanmaken van een account op het Platform aanvaardt de Klant onverkort
              deze Voorwaarden. Bij gebruik door een medewerker namens een organisatie garandeert de
              medewerker bevoegd te zijn de organisatie te binden.
            </p>
          </div>
        </section>

        {/* Art 3 — Account en toegang */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 3 — Account en toegang</h2>
          <div className="space-y-2">
            <p>
              3.1 De Klant maakt een account aan via het Platform. De Klant is verantwoordelijk voor
              de juistheid van de opgegeven gegevens en voor het bijhouden ervan.
            </p>
            <p>
              3.2 De Klant is verantwoordelijk voor het gebruik van zijn account door Gebruikers. De
              Klant ziet erop toe dat Gebruikers deze Voorwaarden naleven.
            </p>
            <p>
              3.3 Inloggen op het Platform geschiedt via een tijdelijke verificatielink (magic link) of
              via door Bijeen toegestane alternatieve methoden. De Klant is gehouden de toegangsgegevens
              vertrouwelijk te houden.
            </p>
            <p>
              3.4 Bijeen is gerechtigd een account op te schorten of te beëindigen bij misbruik,
              schending van deze Voorwaarden of niet-betaling, na een redelijke waarschuwingstermijn.
            </p>
          </div>
        </section>

        {/* Art 4 — Abonnementen en beschikbaarheid */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 4 — Abonnementen</h2>
          <div className="space-y-2">
            <p>
              4.1 Bijeen biedt de volgende abonnementsvarianten aan. Alle vermelde bedragen zijn
              exclusief btw (21%), tenzij uitdrukkelijk anders vermeld:
            </p>
            <div className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-ink/10">
                    <th className="text-left py-2 pr-4 font-semibold">Abonnement</th>
                    <th className="text-left py-2 pr-4 font-semibold">Per evenement</th>
                    <th className="text-left py-2 font-semibold">Jaarlijks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <tr>
                    <td className="py-2 pr-4">Community</td>
                    <td className="py-2 pr-4">Gratis (max 75 deelnemers, max 2 events/jaar)</td>
                    <td className="py-2">Gratis</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Welzijn</td>
                    <td className="py-2 pr-4">€ 89,00</td>
                    <td className="py-2">€ 490,00</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Netwerk</td>
                    <td className="py-2 pr-4">€ 249,00</td>
                    <td className="py-2">€ 1.290,00</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Organisatie</td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2">€ 2.890,00</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Platform</td>
                    <td className="py-2 pr-4" colSpan={2}>Op aanvraag (maatwerk offerte)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              4.2 De exacte functionaliteiten per abonnement staan beschreven op{" "}
              <Link href="/prijzen" className="text-terra-600 underline">
                bijeen.app/prijzen
              </Link>
              . Bijeen behoudt het recht de functies per abonnement te wijzigen, met inachtneming van
              artikel 16.
            </p>
            <p>
              4.3 <strong>Sociaal tarief:</strong> ANBI-geregistreerde stichtingen en organisaties die
              uitsluitend worden gefinancierd uit WMO- of gemeentelijke subsidies komen in aanmerking
              voor een korting van <strong>15%</strong> op alle betaalde abonnementen. Het tarief is
              niet cumulatief met andere kortingen. Aanvraag via{" "}
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline">
                hallo@bijeen.nl
              </a>{" "}
              met overlegging van het RSIN-nummer of subsidiebeschikking.
            </p>
            <p>
              4.4 <strong>Gratis proef:</strong> Nieuwe Klanten kunnen betaalde abonnementen gedurende
              veertien (14) kalenderdagen kosteloos uitproberen. Na afloop van de proefperiode wordt het
              Abonnement automatisch gecontinueerd indien de Klant niet voor afloop heeft opgezegd. De
              Klant ontvangt uiterlijk drie (3) dagen voor het verstrijken van de proefperiode een
              herinnering.
            </p>
            <p>
              4.5 <strong>Pay-per-event:</strong> Bij betaling per evenement is de vergoeding verschuldigd
              voorafgaand aan activering van het desbetreffende evenement.
            </p>
          </div>
        </section>

        {/* Art 5 — Betaling */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 5 — Betaling en facturatie</h2>
          <div className="space-y-2">
            <p>
              5.1 Betaling geschiedt via de door Bijeen aangeboden betaalmethoden (via Stripe). De
              Klant machtigt Bijeen, c.q. de betalingsprovider, tot het periodiek afschrijven van de
              overeengekomen vergoeding.
            </p>
            <p>
              5.2 Jaarabonnementen worden standaard jaarlijks vooruit gefactureerd. Op verzoek kan
              kwartaalfacturatie worden overeengekomen. Kwartaalfacturatie is beschikbaar voor alle
              betaalde jaarabonnementen en sluit aan bij subsidiecycli.
            </p>
            <p>
              5.3 Facturen zijn betaalbaar binnen <strong>14 dagen</strong> na factuurdatum, tenzij
              schriftelijk anders overeengekomen.
            </p>
            <p>
              5.4 Bij niet-tijdige betaling is de Klant van rechtswege in verzuim. Bijeen is in dat
              geval gerechtigd de toegang tot het Platform op te schorten tot volledige betaling heeft
              plaatsgevonden, en is gerechtigd de wettelijke handelsrente (art. 6:119a BW) en
              buitengerechtelijke incassokosten in rekening te brengen.
            </p>
            <p>
              5.5 Alle prijzen zijn exclusief omzetbelasting (btw). Toepasselijk btw-tarief is 21%,
              tenzij de Klant een geldig btw-identificatienummer overlegt of op basis van de
              toepasselijke btw-regelgeving een afwijkend tarief geldt.
            </p>
            <p>
              5.6 Op verzoek verstrekt Bijeen een factuur met projectcode en WMO-dossiercode, geschikt
              voor subsidie­verantwoording.
            </p>
          </div>
        </section>

        {/* Art 6 — Dienstverlening en beschikbaarheid */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 6 — Dienstverlening en beschikbaarheid</h2>
          <div className="space-y-2">
            <p>
              6.1 Bijeen spant zich in het Platform beschikbaar te houden met een streefbeschikbaarheid
              van <strong>99,5%</strong> per kalendermaand, gemeten exclusief gepland onderhoud. Voor
              Platform-abonnementen geldt een afzonderlijke SLA, vast te leggen in de maatwerk offerte.
            </p>
            <p>
              6.2 Bijeen is gerechtigd het Platform (tijdelijk) buiten gebruik te stellen voor onderhoud,
              updates of verbeteringen. Bijeen streeft ernaar onderhoud buiten kantooruren (werkdagen
              09:00–17:00 CET) uit te voeren en de Klant minimaal <strong>24 uur</strong> van tevoren
              te informeren, tenzij sprake is van een noodsituatie.
            </p>
            <p>
              6.3 Bijeen levert geen garantie dat het Platform foutloos is of ononderbroken
              beschikbaar is. Bijeen is niet aansprakelijk voor schade als gevolg van tijdelijke
              onbeschikbaarheid, tenzij sprake is van grove nalatigheid of opzet.
            </p>
            <p>
              6.4 Bijeen is gerechtigd het Platform te wijzigen of functionaliteiten toe te voegen,
              te wijzigen of te verwijderen. Bijeen informeert de Klant over wezenlijke wijzigingen
              conform artikel 16.
            </p>
          </div>
        </section>

        {/* Art 7 — Verplichtingen Klant */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 7 — Verplichtingen en gedragsregels van de Klant</h2>
          <div className="space-y-2">
            <p>7.1 De Klant verbindt zich ertoe het Platform uitsluitend te gebruiken voor wettelijk
              toegestane doeleinden en in overeenstemming met deze Voorwaarden.
            </p>
            <p>7.2 Het is de Klant niet toegestaan:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>het Platform te gebruiken voor het verspreiden van onrechtmatige, misleidende,
                discriminerende of aanstootgevende inhoud;</li>
              <li>de technische beschermingsmaatregelen van het Platform te omzeilen of te kraken;</li>
              <li>het Platform te gebruiken op een wijze die de infrastructuur van Bijeen of
                andere gebruikers belast of schaadt;</li>
              <li>derden toegang te verschaffen tot het Platform buiten de door Bijeen
                uitdrukkelijk toegestane gebruiksrechten;</li>
              <li>persoonsgegevens van Deelnemers te verwerken voor andere doeleinden dan het
                organiseren en beheren van evenementen via het Platform;</li>
              <li>de broncode van het Platform te decompileren, reverse-engineeren of
                anderszins te analyseren.</li>
            </ul>
            <p>
              7.3 De Klant is verantwoordelijk voor de juistheid en rechtmatigheid van de Klantgegevens
              die via het Platform worden verwerkt. Bijeen controleert de inhoud van Klantgegevens niet.
            </p>
            <p>
              7.4 De Klant draagt zorg voor naleving van de AVG in zijn hoedanigheid als
              verwerkingsverantwoordelijke voor persoonsgegevens van Deelnemers. De Klant informeert
              Deelnemers afdoende over de verwerking van hun persoonsgegevens.
            </p>
            <p>
              7.5 De Klant vrijwaart Bijeen tegen alle aanspraken van derden, inclusief Deelnemers, die
              voortvloeien uit een tekortkoming van de Klant in de nakoming van zijn verplichtingen.
            </p>
          </div>
        </section>

        {/* Art 8 — Intellectueel eigendom */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 8 — Intellectueel eigendom</h2>
          <div className="space-y-2">
            <p>
              8.1 Alle intellectuele eigendomsrechten op het Platform, inclusief software, ontwerp,
              teksten en databases, berusten bij Bijeen of haar licentiegevers. Bijeen verleent de
              Klant uitsluitend een niet-exclusief, niet-overdraagbaar gebruiksrecht gedurende de looptijd
              van de Overeenkomst.
            </p>
            <p>
              8.2 Intellectuele eigendomsrechten op Klantgegevens — zoals door de Klant ingevoerde
              evenementinformatie, teksten en afbeeldingen — berusten bij de Klant of haar
              licentiegevers. De Klant verleent Bijeen een beperkt gebruiksrecht op Klantgegevens
              voor zover noodzakelijk voor de uitvoering van de Overeenkomst.
            </p>
            <p>
              8.3 De Klant is niet gerechtigd handelsmerken, logo&apos;s of andere onderscheidingstekens
              van Bijeen te gebruiken zonder voorafgaande schriftelijke toestemming.
            </p>
            <p>
              8.4 Bijeen is gerechtigd de naam en het logo van de Klant te gebruiken als referentie op
              haar website en in marketingmateriaal, tenzij de Klant hier schriftelijk bezwaar tegen
              maakt.
            </p>
          </div>
        </section>

        {/* Art 9 — Geheimhouding */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 9 — Vertrouwelijkheid</h2>
          <div className="space-y-2">
            <p>
              9.1 Partijen verbinden zich ertoe vertrouwelijke informatie van de andere partij
              geheim te houden en uitsluitend te gebruiken voor de uitvoering van de Overeenkomst.
            </p>
            <p>
              9.2 Onder vertrouwelijke informatie wordt verstaan alle informatie die als zodanig is
              aangeduid of waarvan de vertrouwelijkheid redelijkerwijs uit de aard volgt, waaronder
              commerciële en technische bedrijfsinformatie.
            </p>
            <p>
              9.3 De geheimhoudingsplicht geldt niet voor informatie die reeds openbaar was, door
              een derde rechtmatig openbaar is gemaakt, of waarvan openbaarmaking wettelijk is
              vereist.
            </p>
          </div>
        </section>

        {/* Art 10 — Persoonsgegevens */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 10 — Persoonsgegevens</h2>
          <div className="space-y-2">
            <p>
              10.1 De Klant treedt op als <strong>verwerkingsverantwoordelijke</strong> voor de
              persoonsgegevens van zijn Deelnemers. Bijeen treedt op als <strong>verwerker</strong>.
            </p>
            <p>
              10.2 De rechten en verplichtingen van partijen bij de verwerking van persoonsgegevens
              zijn vastgelegd in de{" "}
              <Link href="/verwerkersovereenkomst" className="text-terra-600 underline">
                Verwerkersovereenkomst
              </Link>
              , die als onlosmakelijk onderdeel van deze Voorwaarden geldt. De Klant aanvaardt de
              Verwerkersovereenkomst door het aanmaken van een account.
            </p>
            <p>
              10.3 De Klant garandeert dat hij beschikt over een geldige rechtsgrondslag voor de
              verwerking van persoonsgegevens van Deelnemers via het Platform.
            </p>
          </div>
        </section>

        {/* Art 11 — Aansprakelijkheid */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 11 — Aansprakelijkheid</h2>
          <div className="space-y-2">
            <p>
              11.1 De aansprakelijkheid van Bijeen voor directe schade is per schadeveroorzakend
              voorval gemaximeerd op het door de Klant betaalde bedrag in de <strong>twaalf (12)
              maanden</strong> voorafgaand aan het voorval, met een absoluut maximum van{" "}
              <strong>€ 5.000,00</strong>.
            </p>
            <p>
              11.2 Bijeen is nimmer aansprakelijk voor:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>indirecte schade, gevolgschade, gederfde winst of gemiste besparingen;</li>
              <li>schade door verlies van gegevens, tenzij veroorzaakt door grove nalatigheid
                of opzet van Bijeen;</li>
              <li>schade voortvloeiend uit het gebruik van het Platform door Deelnemers;</li>
              <li>schade veroorzaakt door derden, waaronder subverwerkers, voor zover Bijeen
                niet in verzuim is geweest bij de selectie of het toezicht;</li>
              <li>schade als gevolg van overmacht (zie artikel 12).</li>
            </ul>
            <p>
              11.3 Bijeen is niet aansprakelijk voor de juistheid, volledigheid of rechtmatigheid
              van Klantgegevens of de inhoud van evenementen georganiseerd door de Klant.
            </p>
            <p>
              11.4 De beperkingen in dit artikel vervallen indien en voor zover de schade het
              gevolg is van opzet of bewuste roekeloosheid van Bijeen of haar leidinggevenden.
            </p>
            <p>
              11.5 De Klant is gehouden schade zo spoedig mogelijk — en uiterlijk binnen drie (3)
              maanden na ontdekking — schriftelijk te melden bij Bijeen op straffe van verval van
              het recht op schadevergoeding.
            </p>
          </div>
        </section>

        {/* Art 12 — Overmacht */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 12 — Overmacht</h2>
          <div className="space-y-2">
            <p>
              12.1 Bijeen is niet gehouden tot nakoming van enige verplichting indien zij daartoe
              verhinderd wordt door een omstandigheid die niet aan haar schuld is toe te rekenen en
              noch krachtens wet, rechtshandeling of in het verkeer geldende opvatting voor haar
              rekening komt.
            </p>
            <p>
              12.2 Onder overmacht wordt in ieder geval begrepen: storingen bij internetproviders,
              telecomnetwerken of (cloud)leveranciers, DDoS-aanvallen, natuurrampen, brand, pandemieën,
              overheidsmaatregelen en gebreken in door derden geleverde software.
            </p>
            <p>
              12.3 Indien de overmachtsituatie langer duurt dan <strong>dertig (30) dagen</strong>,
              zijn beide partijen gerechtigd de Overeenkomst schriftelijk te ontbinden zonder
              verplichting tot schadevergoeding.
            </p>
          </div>
        </section>

        {/* Art 13 — Looptijd en opzegging */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 13 — Looptijd en opzegging</h2>
          <div className="space-y-2">
            <p>
              13.1 De Overeenkomst voor een jaarabonnement wordt gesloten voor een periode van
              twaalf (12) maanden en wordt stilzwijgend verlengd met telkens twaalf (12) maanden,
              tenzij de Klant uiterlijk <strong>dertig (30) dagen</strong> voor het einde van de
              lopende periode opzegt.
            </p>
            <p>
              13.2 Na de initiële abonnementsperiode van twaalf (12) maanden is het abonnement
              maandelijks opzegbaar met een opzegtermijn van één (1) kalendermaand.
            </p>
            <p>
              13.3 Pay-per-event abonnementen hebben geen vaste looptijd. De Overeenkomst voor een
              afzonderlijk evenement eindigt van rechtswege na het verstrijken van de door de Klant
              ingestelde evenementdatum of na handmatige beëindiging door de Klant.
            </p>
            <p>
              13.4 Opzegging geschiedt via het dashboard of schriftelijk via{" "}
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline">
                hallo@bijeen.nl
              </a>
              .
            </p>
            <p>
              13.5 Bij opzegging behoudt de Klant tot het einde van de betaalde periode toegang
              tot het Platform. Reeds betaalde vergoedingen worden niet gerestitueerd, tenzij
              uitdrukkelijk anders overeengekomen.
            </p>
            <p>
              13.6 Bijeen is gerechtigd de Overeenkomst met onmiddellijke ingang te ontbinden indien
              de Klant in staat van faillissement wordt verklaard, surseance van betaling aanvraagt
              of anderszins niet langer in staat is aan zijn betalingsverplichtingen te voldoen.
            </p>
            <p>
              13.7 Na beëindiging van de Overeenkomst exporteert Bijeen de Klantgegevens op verzoek
              van de Klant. Bijeen verwijdert alle Klantgegevens uiterlijk <strong>30 dagen</strong>{" "}
              na beëindiging, tenzij een langere bewaarplicht geldt op grond van de wet (zie ook{" "}
              <Link href="/verwerkersovereenkomst" className="text-terra-600 underline">
                Verwerkersovereenkomst art. 4.7
              </Link>
              ).
            </p>
          </div>
        </section>

        {/* Art 14 — Beëindiging door Bijeen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 14 — Beëindiging door Bijeen</h2>
          <div className="space-y-2">
            <p>
              14.1 Bijeen kan de Overeenkomst met onmiddellijke ingang schriftelijk beëindigen indien
              de Klant:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>herhaaldelijk of ernstig deze Voorwaarden schendt en na schriftelijke
                ingebrekestelling nalatig blijft de schending te herstellen;</li>
              <li>onrechtmatige inhoud verspreidt via het Platform;</li>
              <li>misbruik maakt van het Platform of de infrastructuur van Bijeen schaadt.</li>
            </ul>
            <p>
              14.2 Bijeen vergoedt de Klant het naar rato niet-geconsumeerde gedeelte van reeds
              betaalde abonnementsgelden, tenzij de beëindiging het gevolg is van handelen of
              nalaten van de Klant.
            </p>
          </div>
        </section>

        {/* Art 15 — Klachten */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 15 — Klachten</h2>
          <div className="space-y-2">
            <p>
              15.1 Klachten over de dienstverlening dienen schriftelijk te worden gemeld via{" "}
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline">
                hallo@bijeen.nl
              </a>{" "}
              met een duidelijke omschrijving van de klacht.
            </p>
            <p>
              15.2 Bijeen bevestigt ontvangst van de klacht binnen <strong>vijf (5) werkdagen</strong>{" "}
              en streeft naar een inhoudelijke reactie binnen <strong>dertig (30) dagen</strong>.
            </p>
            <p>
              15.3 Klachten schorten de betalingsverplichting van de Klant niet op, tenzij
              schriftelijk anders overeengekomen.
            </p>
          </div>
        </section>

        {/* Art 16 — Wijzigingen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 16 — Wijzigingen in de Voorwaarden of het Platform</h2>
          <div className="space-y-2">
            <p>
              16.1 Bijeen behoudt het recht deze Voorwaarden te wijzigen. Wezenlijke wijzigingen
              worden minimaal <strong>30 dagen</strong> voor inwerkingtreding aangekondigd per
              e-mail en/of in het dashboard.
            </p>
            <p>
              16.2 Indien de Klant niet instemt met een wezenlijke wijziging, is de Klant gerechtigd
              de Overeenkomst kosteloos te beëindigen per de datum waarop de wijziging van kracht
              wordt, mits schriftelijk opgezegd binnen 14 dagen na aankondiging.
            </p>
            <p>
              16.3 Voortgezet gebruik van het Platform na de ingangsdatum van gewijzigde Voorwaarden
              geldt als aanvaarding.
            </p>
            <p>
              16.4 Bijeen behoudt het recht de tarieven jaarlijks aan te passen, met inachtneming
              van lid 1. Tariefaanpassingen gaan in op de eerstvolgende verlengingsdatum van het
              Abonnement.
            </p>
          </div>
        </section>

        {/* Art 17 — Toepasselijk recht */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 17 — Toepasselijk recht en geschillenbeslechting</h2>
          <div className="space-y-2">
            <p>
              17.1 Op deze Voorwaarden en op alle Overeenkomsten tussen Bijeen en de Klant is
              uitsluitend <strong>Nederlands recht</strong> van toepassing.
            </p>
            <p>
              17.2 Geschillen die voortvloeien uit of samenhangen met deze Voorwaarden of de
              Overeenkomst worden, indien niet in onderling overleg opgelost, uitsluitend voorgelegd
              aan de <strong>bevoegde rechter in het arrondissement Amsterdam</strong>.
            </p>
            <p>
              17.3 In afwijking van lid 2 kunnen partijen schriftelijk overeenkomen het geschil voor
              te leggen aan een mediator of arbitrage-instantie.
            </p>
          </div>
        </section>

        {/* Art 18 — Overige bepalingen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 18 — Overige bepalingen</h2>
          <div className="space-y-2">
            <p>
              18.1 Indien een bepaling van deze Voorwaarden geheel of gedeeltelijk nietig of
              vernietigbaar is, blijven de overige bepalingen onverminderd van kracht. Partijen
              vervangen de nietige bepaling door een geldige bepaling die de bedoeling van de
              oorspronkelijke bepaling zo nauwkeurig mogelijk benadert.
            </p>
            <p>
              18.2 Bijeen is gerechtigd haar rechten en verplichtingen uit de Overeenkomst over te
              dragen aan een gelieerde onderneming of een rechtsopvolger als gevolg van een fusie,
              overname of reorganisatie, na voorafgaande schriftelijke kennisgeving aan de Klant.
            </p>
            <p>
              18.3 Het niet uitoefenen van een recht door Bijeen houdt geen afstand van dat recht in.
            </p>
            <p>
              18.4 Schriftelijke kennisgevingen in het kader van deze Voorwaarden worden gedaan per
              e-mail aan de door de Klant opgegeven contactpersoon, of per aangetekende post aan het
              geregistreerde adres van de Klant.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Contact</h2>
          <p className="text-sm text-ink-muted mb-3">
            Voor vragen over deze Algemene Voorwaarden kunt u contact opnemen met:
          </p>
          <div className="text-sm space-y-0.5">
            <p><strong>WeAreImpact B.V.</strong> — Bijeen</p>
            <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
            <p>KvK: 70285888 · BTW: NL858236369B01</p>
            <p>
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline font-medium">
                hallo@bijeen.nl
              </a>
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link href="/privacyverklaring" className="text-terra-600 underline">
              Privacyverklaring
            </Link>
            <Link href="/verwerkersovereenkomst" className="text-terra-600 underline">
              Verwerkersovereenkomst
            </Link>
            <Link href="/gebruiksvoorwaarden" className="text-terra-600 underline">
              Gebruiksvoorwaarden deelnemers
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
