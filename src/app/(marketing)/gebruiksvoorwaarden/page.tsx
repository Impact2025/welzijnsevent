import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden Deelnemers — Bijeen",
  description:
    "Gebruiksvoorwaarden voor deelnemers aan evenementen die worden georganiseerd via het Bijeen-platform.",
};

export default function GebruiksvoorwaardenPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-terra-500 mb-2">Juridisch</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Gebruiksvoorwaarden Deelnemers
        </h1>
        <p className="text-ink-muted text-sm">
          Versie 1.0 — van kracht per 1 juni 2026 · Bijeen is een concept van{" "}
          <strong className="text-ink">WeAreImpact B.V.</strong>
        </p>
        <div className="bg-sand/40 rounded-xl p-4 mt-4 text-sm">
          <p>
            Deze gebruiksvoorwaarden zijn van toepassing op deelnemers die zich registreren voor
            evenementen via het Bijeen-platform. Het evenement zelf wordt georganiseerd door de
            betreffende <strong>organisatie (de organisator)</strong>, niet door Bijeen.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-ink leading-relaxed">

        {/* Art 1 — Partijen en toepasselijkheid */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 1 — Partijen en toepasselijkheid</h2>
          <div className="space-y-2">
            <p>
              1.1 Deze gebruiksvoorwaarden zijn van toepassing op iedere deelnemer die zich via het
              Bijeen-platform inschrijft voor een evenement, een wachtlijst of een andere activiteit
              die via het Platform wordt aangeboden.
            </p>
            <p>
              1.2 <strong>Bijeen</strong> is WeAreImpact B.V., KvK Amsterdam 70285888, BTW-nummer
              NL858236369B01, Heintje Hoeksteeg 11a, 1012 GR Amsterdam. Bijeen stelt het Platform
              beschikbaar waarop organisatoren evenementen kunnen aanbieden.
            </p>
            <p>
              1.3 De <strong>organisator</strong> is de organisatie die het evenement via het Platform
              aanbiedt en die eindverantwoordelijk is voor de inhoud, uitvoering en naleving van het
              programma.
            </p>
            <p>
              1.4 Door te klikken op &ldquo;Inschrijven&rdquo; of een vergelijkbare bevestigingsknop
              aanvaardt de deelnemer deze gebruiksvoorwaarden en de{" "}
              <Link href="/privacyverklaring" className="text-terra-600 underline">
                privacyverklaring
              </Link>{" "}
              van Bijeen.
            </p>
          </div>
        </section>

        {/* Art 2 — Inschrijving en toegang */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 2 — Inschrijving en toegang</h2>
          <div className="space-y-2">
            <p>
              2.1 Inschrijving geschiedt uitsluitend via het registratieformulier op het Platform.
              De deelnemer ontvangt na succesvolle inschrijving een bevestigingsmail op het opgegeven
              e-mailadres.
            </p>
            <p>
              2.2 De deelnemer verstrekt bij inschrijving juiste en volledige gegevens. Het
              opgeven van onjuiste gegevens kan leiden tot weigering van deelname.
            </p>
            <p>
              2.3 Bij evenementen met beperkte capaciteit geldt inschrijving op volgorde van
              aanmelding. Wanneer de capaciteit is bereikt, kan de deelnemer op een wachtlijst
              worden geplaatst. Plaatsing op de wachtlijst geeft geen recht op deelname.
            </p>
            <p>
              2.4 Toegang tot het evenement wordt bewezen door middel van de digitale QR-code die
              de deelnemer per e-mail ontvangt. De deelnemer is zelf verantwoordelijk voor het
              beschikbaar hebben van de QR-code bij het evenement.
            </p>
            <p>
              2.5 De organisator heeft het recht deelname te weigeren of de deelnemer de toegang
              te ontzeggen indien de deelnemer zich niet houdt aan de gedragsregels of overige
              instructies van de organisator.
            </p>
          </div>
        </section>

        {/* Art 3 — Betaalde tickets */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 3 — Betaalde tickets en restitutiebeleid</h2>
          <div className="space-y-2">
            <p>
              3.1 Voor evenementen waarbij de organisator betaalde tickets aanbiedt, geschiedt
              betaling via het Platform (Stripe). Betaling dient te zijn voldaan om de inschrijving
              te bevestigen.
            </p>
            <p>
              3.2 Na succesvolle betaling ontvangt de deelnemer een bevestiging per e-mail. De
              organisator kan aanvullende voorwaarden stellen aan het ticket, waaronder een eigen
              annuleringsbeleid.
            </p>
            <p>
              3.3 Het restitutiebeleid wordt bepaald door de <strong>organisator</strong>. Bijeen
              is niet verantwoordelijk voor de inhoud van het restitutiebeleid van de organisator.
              De deelnemer dient voor aankoop kennis te nemen van het door de organisator gestelde
              beleid.
            </p>
            <p>
              3.4 Indien de organisator een evenement annuleert, heeft de deelnemer recht op
              restitutie van de ticketprijs, tenzij uitdrukkelijk anders overeengekomen met de
              organisator. Bijeen faciliteert de restitutie technisch via Stripe, maar is daarvoor
              niet financieel verantwoordelijk jegens de deelnemer.
            </p>
            <p>
              3.5 De deelnemer is een consument in de zin van de wet. Artikel 6:230m e.v. BW
              (informatieplicht bij overeenkomsten op afstand) is van toepassing. Voor tickets voor
              specifiek geplande evenementen geldt het herroepingsrecht <strong>niet</strong>, op
              grond van art. 6:230p sub e BW (ontspanning, vrije tijdsbesteding op een bepaalde
              datum).
            </p>
          </div>
        </section>

        {/* Art 4 — Gedragsregels */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 4 — Gedragsregels</h2>
          <div className="space-y-2">
            <p>
              4.1 De deelnemer gedraagt zich respectvol jegens andere deelnemers, sprekers,
              vrijwilligers en medewerkers tijdens het evenement en in alle door het Platform
              gefaciliteerde communicatiekanalen (live Q&amp;A, social wall, netwerk-chat).
            </p>
            <p>4.2 Het is de deelnemer niet toegestaan tijdens het evenement of via het Platform:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>discriminerende, beledigende, bedreigende of anderszins onrechtmatige
                uitlatingen te doen;</li>
              <li>spam, commerciële aanbiedingen of ongewenste reclame te verspreiden;</li>
              <li>intellectuele eigendomsrechten van derden of de organisator te schenden;</li>
              <li>persoonlijke gegevens van andere deelnemers te verwerken buiten de context
                van het evenement;</li>
              <li>het Platform of de technische infrastructuur te verstoren of te misbruiken.</li>
            </ul>
            <p>
              4.3 De organisator kan aanvullende gedragsregels stellen. Bij schending hiervan kan
              de organisator de deelnemer de (verdere) toegang tot het evenement ontzeggen.
            </p>
          </div>
        </section>

        {/* Art 5 — Netwerkkoppelingen (AI) */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 5 — AI-netwerkkoppelingen</h2>
          <div className="space-y-2">
            <p>
              5.1 Indien de deelnemer bij inschrijving toestemming heeft gegeven voor
              AI-netwerkkoppelingen, kunnen naam, organisatie, functietitel en interessegebieden
              worden verwerkt door een AI-model om koppelingen voor te stellen.
            </p>
            <p>
              5.2 Gegenereerde koppelingen zijn suggesties. Er worden geen beslissingen genomen
              die rechtsgevolgen hebben voor de deelnemer.
            </p>
            <p>
              5.3 De deelnemer kan zijn toestemming te allen tijde intrekken door contact op te
              nemen met de organisator of met Bijeen via{" "}
              <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">
                privacy@bijeen.app
              </a>
              .
            </p>
          </div>
        </section>

        {/* Art 6 — Beeld- en geluidsopnames */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 6 — Beeld- en geluidsopnames</h2>
          <div className="space-y-2">
            <p>
              6.1 De organisator kan tijdens evenementen beeld- en geluidsopnames maken voor
              documentatie, communicatie of publicatiedoeleinden. De organisator informeert
              deelnemers hierover in de evenementbeschrijving of bij aanvang van het evenement.
            </p>
            <p>
              6.2 Bijeen maakt zelf geen opnames van deelnemers.
            </p>
            <p>
              6.3 Indien een deelnemer bezwaar heeft tegen publicatie van opnames waarbij hij
              herkenbaar in beeld is, dient de deelnemer dit kenbaar te maken aan de organisator.
            </p>
          </div>
        </section>

        {/* Art 7 — Persoonsgegevens en privacy */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 7 — Persoonsgegevens en privacy</h2>
          <div className="space-y-2">
            <p>
              7.1 Bijeen verwerkt persoonsgegevens van deelnemers als verwerker in opdracht van de
              organisator. De organisator is de verwerkingsverantwoordelijke.
            </p>
            <p>
              7.2 De wijze waarop Bijeen met persoonsgegevens omgaat is beschreven in de{" "}
              <Link href="/privacyverklaring" className="text-terra-600 underline">
                privacyverklaring van Bijeen
              </Link>
              .
            </p>
            <p>
              7.3 De deelnemer heeft het recht zijn persoonsgegevens in te zien, te corrigeren,
              te verwijderen of te ontvangen. Verzoeken kunnen worden gericht aan de organisator
              of rechtstreeks aan Bijeen via{" "}
              <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline">
                privacy@bijeen.app
              </a>
              .
            </p>
          </div>
        </section>

        {/* Art 8 — Aansprakelijkheid Bijeen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 8 — Aansprakelijkheid</h2>
          <div className="space-y-2">
            <p>
              8.1 Bijeen stelt uitsluitend het technische Platform beschikbaar. Bijeen is niet
              aansprakelijk voor:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>de inhoud, kwaliteit of uitvoering van het evenement door de organisator;</li>
              <li>schade geleden door de deelnemer als gevolg van handelen of nalaten van de
                organisator;</li>
              <li>tijdelijke onbeschikbaarheid van het Platform als gevolg van onderhoud of
                storingen buiten de macht van Bijeen;</li>
              <li>schade door verlies van persoonlijke eigendommen van de deelnemer tijdens
                het evenement.</li>
            </ul>
            <p>
              8.2 Voor zover Bijeen aansprakelijk is voor directe schade van de deelnemer, is deze
              aansprakelijkheid beperkt tot het eventueel door de deelnemer voor deelname betaalde
              bedrag.
            </p>
            <p>
              8.3 De beperkingen in dit artikel gelden niet voor schade veroorzaakt door opzet of
              bewuste roekeloosheid van Bijeen.
            </p>
          </div>
        </section>

        {/* Art 9 — Klachten */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 9 — Klachten</h2>
          <div className="space-y-2">
            <p>
              9.1 Klachten over het evenement zelf dienen te worden gericht aan de{" "}
              <strong>organisator</strong>.
            </p>
            <p>
              9.2 Klachten over het Platform of de door Bijeen geleverde technische diensten kunnen
              worden ingediend via{" "}
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline">
                hallo@bijeen.nl
              </a>
              . Bijeen streeft naar een reactie binnen vijf (5) werkdagen.
            </p>
          </div>
        </section>

        {/* Art 10 — Toepasselijk recht */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 10 — Toepasselijk recht</h2>
          <div className="space-y-2">
            <p>
              10.1 Op deze gebruiksvoorwaarden is Nederlands recht van toepassing.
            </p>
            <p>
              10.2 Geschillen tussen de deelnemer en Bijeen over de toepassing van het Platform
              worden, voor zover wettelijk toegestaan, voorgelegd aan de bevoegde rechter in het
              arrondissement Amsterdam.
            </p>
            <p>
              10.3 Als consument heeft de deelnemer het recht een geschil voor te leggen aan de
              bevoegde rechter van zijn woonplaats, of gebruik te maken van online
              geschillenbeslechting via het{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-600 underline"
              >
                ODR-platform van de Europese Commissie
              </a>
              .
            </p>
          </div>
        </section>

        {/* Art 11 — Wijzigingen */}
        <section>
          <h2 className="text-lg font-bold text-ink mb-3">Artikel 11 — Wijzigingen</h2>
          <p>
            Bijeen behoudt het recht deze gebruiksvoorwaarden te wijzigen. De actuele versie staat
            altijd op deze pagina. Wezenlijke wijzigingen worden, voor zover mogelijk, via e-mail
            gecommuniceerd.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-terra-50 border border-terra-100 rounded-2xl p-5">
          <h2 className="text-base font-bold text-ink mb-2">Contact</h2>
          <p className="text-sm text-ink-muted mb-3">
            Vragen over deelname of deze voorwaarden? Neem contact op via:
          </p>
          <div className="text-sm space-y-0.5">
            <p><strong>WeAreImpact B.V.</strong> — Bijeen</p>
            <p>Heintje Hoeksteeg 11a, 1012 GR Amsterdam</p>
            <p>
              <a href="mailto:hallo@bijeen.nl" className="text-terra-600 underline font-medium">
                hallo@bijeen.nl
              </a>
              {" · "}
              <a href="mailto:privacy@bijeen.app" className="text-terra-600 underline font-medium">
                privacy@bijeen.app
              </a>{" "}
              (privacyzaken)
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link href="/privacyverklaring" className="text-terra-600 underline">
              Privacyverklaring
            </Link>
            <Link href="/algemene-voorwaarden" className="text-terra-600 underline">
              Algemene voorwaarden organisaties
            </Link>
            <Link href="/cookiebeleid" className="text-terra-600 underline">
              Cookiebeleid
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
