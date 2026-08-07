/**
 * Gerichte on-page optimalisatie op basis van Search Console-data (aug 2026).
 *
 * Aanleiding: drie kennisbank-artikelen krijgen samen ~130 impressies per
 * kwartaal op posities 39-64 voor zoektermen die letterlijk nul keer in de
 * pagina voorkomen. Het gaat steeds om een gangbaar Nederlands synoniem:
 *
 *   netwerkevenement-organiseren      "netwerkbijeenkomst"       0x  (29 impr, pos 48-60)
 *   aanmeldformulier-evenement-maken  "invulvelden"              0x  (34 impr, pos 45,6)
 *   vrijwilligersbeheer-…-bedankje    "vrijwilligers beheren"    0x  (33 impr, pos 39-64)
 *
 * Elke patch voegt een sectie toe die de vraag achter die zoekterm echt
 * beantwoordt, plus bijgewerkte meta-velden. Geen verzonnen cijfers of
 * ik-anekdotes: die staan al in de bestaande tekst en horen bij de auteur.
 *
 * Idempotent via een marker-string per patch.
 *   npx tsx src/db/seo-content-update.ts --dry
 *   npx tsx src/db/seo-content-update.ts
 */
import { loadEnv } from "./load-env.js";

loadEnv();

const DRY = process.argv.includes("--dry");

type Patch = {
  slug: string;
  bron: "kennisbank" | "blog";
  /** Als deze string al in de content staat, is de patch al toegepast. */
  marker: string;
  metaTitle?: string;
  metaDescription?: string;
  /** Sectie die vóór de FAQ-kop wordt ingevoegd (of achteraan als die er niet is). */
  insertBeforeFaq?: string;
  /** Extra FAQ-items, ingevoegd aan het eind van de FAQ-sectie. */
  faqItems?: string;
};

const PATCHES: Patch[] = [
  // ── 1. Netwerkevenement ───────────────────────────────────────────────────
  // "netwerkbijeenkomst" en "netwerkbijeenkomst organiseren" leveren samen 29
  // impressies op pos 48-60, terwijl het woord nergens op de pagina staat.
  // "netwerkevenement" rankt al op 8,9 — dat blijft dus vooraan in de titel.
  {
    slug: "netwerkevenement-organiseren",
    bron: "kennisbank",
    marker: "netwerkbijeenkomst",
    metaTitle: "Netwerkevenement of netwerkbijeenkomst organiseren",
    metaDescription:
      "Hoe organiseer je een netwerkbijeenkomst waar echte verbindingen ontstaan? Structuur, geleide matching en een concrete vervolgstap.",
    insertBeforeFaq: `
<h2>Netwerkevenement, netwerkbijeenkomst of netwerkborrel?</h2>
<p>Deze termen worden door elkaar gebruikt en betekenen in de praktijk hetzelfde: een samenkomst waar het leggen van contacten het doel is, niet het bijproduct. Het onderscheid dat er wél toe doet zit niet in de naam maar in de opzet.</p>
<p>Een <strong>netwerkborrel</strong> is de losse variant: een tijdstip, een locatie, drankjes, verder geen structuur. Een <strong>netwerkbijeenkomst</strong> of <strong>netwerkevenement</strong> heeft een programma — een inhoudelijke aanleiding, afgebakende gespreksrondes en een moment waarop deelnemers vastleggen wat ze afspreken. Dat verschil in structuur bepaalt of mensen met een bruikbaar contact naar huis gaan.</p>
<p>Organiseer je vooral netwerkbijeenkomsten binnen het sociaal domein, dan speelt nog iets mee: je deelnemers komen uit verschillende organisaties met verschillende belangen. Juist dan is een gedeelde inhoudelijke aanleiding belangrijker dan de gelegenheid zelf.</p>
`,
    faqItems: `
<h3>Wat is het verschil tussen een netwerkbijeenkomst en een netwerkevenement?</h3>
<p>Inhoudelijk niets. Beide termen beschrijven een samenkomst waar contact leggen het hoofddoel is. "Netwerkbijeenkomst" is in het Nederlands taalgebruik iets gangbaarder voor kleinere, zakelijke of sectorale samenkomsten; "netwerkevenement" klinkt grootschaliger. Voor de opzet maakt het geen verschil: in beide gevallen bepaalt de structuur van het programma het resultaat.</p>
<h3>Hoeveel deelnemers heeft een netwerkbijeenkomst minimaal nodig?</h3>
<p>Vanaf ongeveer twintig deelnemers ontstaat er genoeg variatie om zinvolle koppelingen te maken. Onder dat aantal kun je beter met één gezamenlijke gespreksronde werken dan met matching, omdat vrijwel iedereen elkaar dan toch spreekt.</p>
`,
  },

  // ── 2. Aanmeldformulier ───────────────────────────────────────────────────
  // "invulvelden aanmelden bijeenkomst" geeft 34 impressies op pos 45,6 terwijl
  // "invulveld" 0x voorkomt. De blogpost die er wél op mikte haalde nul
  // impressies en is naar dit artikel geconsolideerd (zie blog-canonical-map).
  {
    slug: "aanmeldformulier-evenement-maken",
    bron: "kennisbank",
    marker: "Welke invulvelden",
    // Max ~51 tekens: de root layout hangt er nog " — Bijeen" achter.
    metaTitle: "Aanmeldformulier maken: welke invulvelden?",
    metaDescription:
      "Welke invulvelden heeft een aanmeldformulier voor een bijeenkomst echt nodig? Complete gids met veldenlijst, AVG-regels en veelgemaakte fouten.",
    insertBeforeFaq: `
<h2>Welke invulvelden heeft je aanmeldformulier echt nodig?</h2>
<p>De snelste manier om een formulier te ontwerpen is beginnen bij nul velden en er alleen iets bij zetten als je kunt uitleggen wat je met het antwoord gaat dóén. Kun je dat niet, dan is het veld ruis — voor de bezoeker én voor je eigen verwerking.</p>
<p>In de praktijk komt het neer op drie categorieën invulvelden:</p>
<ul>
  <li><strong>Onmisbaar:</strong> naam en e-mailadres. Zonder die twee kun je geen bevestiging sturen en geen deelnemerslijst maken. Meer heb je niet nodig om een aanmelding vast te leggen.</li>
  <li><strong>Vaak zinvol:</strong> organisatie, keuze van sessie of tijdslot, en dieetwensen of toegankelijkheidsbehoeften. Zet deze alleen op het formulier als je er ook echt iets mee organiseert.</li>
  <li><strong>Zelden nodig:</strong> telefoonnummer, adres, functietitel, geboortedatum. Deze velden verlagen de conversie en leveren gegevens op die je onder de AVG moet kunnen verantwoorden en bewaren.</li>
</ul>
<p>Werk je met keuzevelden in plaats van open tekstvelden, dan bespaar je jezelf achteraf veel opschoonwerk. Een dropdown met vijf sessies levert direct bruikbare aantallen op; een open veld waarin mensen "de ochtendsessie denk ik" typen niet.</p>
<h3>Vergeet niet wat er ná het formulier gebeurt</h3>
<p>Drie dingen die net zo bepalend zijn voor het resultaat als de velden zelf:</p>
<ul>
  <li><strong>Een bevestigingspagina die iets zegt.</strong> "Bedankt" is te weinig. Vertel wanneer de bevestigingsmail komt en wat de volgende stap is.</li>
  <li><strong>Een herinnering vóór de bijeenkomst.</strong> Het gat tussen aanmelding en datum is waar de meeste no-shows ontstaan.</li>
  <li><strong>Een wachtlijst als je vol zit.</strong> Zonder wachtlijst verlies je precies de mensen die het meest gemotiveerd waren, en bij afmeldingen blijven stoelen leeg.</li>
</ul>
`,
    faqItems: `
<h3>Is het aanmeldformulier of aanmeldingsformulier?</h3>
<p>Beide vormen zijn correct Nederlands. "Aanmeldformulier" is in het dagelijks gebruik veruit het gangbaarst; "aanmeldingsformulier" is de formelere variant en kom je vaker tegen in officiële stukken. "Inschrijfformulier" betekent hetzelfde en wordt vooral gebruikt bij cursussen en opleidingen. Kies één term en gebruik die consequent in je communicatie, zodat deelnemers niet gaan twijfelen of ze op de goede plek zijn.</p>
<h3>Hoeveel invulvelden zijn te veel?</h3>
<p>Er is geen hard maximum, maar elk extra veld kost aanmeldingen. Een praktische toets: als je formulier op een telefoon meer dan één keer scrollen kost voordat iemand op verzenden kan drukken, is het te lang. Zet dan de optionele velden achter een tweede stap of vraag ze pas na de bevestiging uit.</p>
`,
  },

  // ── 3. Vrijwilligersbeheer ────────────────────────────────────────────────
  // "vrijwilligers beheren" (pos 63,7) en "vrijwilligers beheer systeem"
  // (pos 38,9) zijn tool-intentie; het artikel noemt "software" of "systeem
  // voor vrijwilligersbeheer" nergens. De toolvergelijking staat in een aparte
  // blogpost — daar linken we naartoe in plaats van ermee te concurreren.
  {
    slug: "vrijwilligersbeheer-aanmelding-tot-bedankje",
    bron: "kennisbank",
    marker: "Vrijwilligers beheren: met welk systeem?",
    metaTitle: "Vrijwilligers beheren: de complete gids",
    metaDescription:
      "Vrijwilligers beheren zonder chaos: werving, onboarding, planning en waardering in één systeem. Praktische gids voor welzijnsorganisaties.",
    insertBeforeFaq: `
<h2>Vrijwilligers beheren: met welk systeem?</h2>
<p>De zes fases hierboven kun je met pen en papier doorlopen. Tot ongeveer vijftien vrijwilligers werkt dat prima. Daarboven loopt het vast op drie punten: je weet niet meer wie waarvoor beschikbaar is, je communicatie verspreidt zich over losse WhatsApp-groepen en mailtjes, en je kunt niet meer laten zien wat je vrijwilligers hebben opgeleverd.</p>
<p>Een systeem voor vrijwilligersbeheer lost precies die drie dingen op. Waar je op let bij de keuze:</p>
<ul>
  <li><strong>Beschikbaarheid en planning in één overzicht.</strong> Als je nog steeds in een los rooster moet kijken wie kan, heb je er niets aan.</li>
  <li><strong>Communicatie vanuit hetzelfde systeem.</strong> Een uitnodiging versturen naar iedereen die zich voor een taak heeft opgegeven, zonder eerst een lijst te exporteren.</li>
  <li><strong>Registratie van gewerkte uren en taken.</strong> Niet om te controleren, maar omdat je die cijfers nodig hebt voor je jaarverslag en subsidieverantwoording.</li>
  <li><strong>Wat je vrijwilligers ervan merken.</strong> Een systeem dat alleen jou werk bespaart maar hun aanmelding omslachtiger maakt, kost je uiteindelijk vrijwilligers.</li>
</ul>
<p>Een overzicht van de tools die welzijnsorganisaties hiervoor gebruiken staat in <a href="/blog/digitale-tools-vrijwilligersbeheer-2026">digitale tools voor vrijwilligersbeheer</a>. Organiseer je vooral rond evenementen, dan is het praktisch als het vrijwilligersbeheer in dezelfde tool zit als je deelnemersbeheer — dan hoef je de twee lijsten niet handmatig naast elkaar te leggen.</p>
`,
    faqItems: `
<h3>Vanaf hoeveel vrijwilligers heb je een systeem nodig?</h3>
<p>Rond de vijftien à twintig actieve vrijwilligers wordt handmatig beheer merkbaar duurder dan een tool. Niet vanwege de aantallen zelf, maar omdat het aantal combinaties van taken, tijdstippen en beschikbaarheid vanaf dat punt sneller groeit dan je overzicht.</p>
<h3>Kan ik vrijwilligers beheren in Excel?</h3>
<p>Voor een namenlijst met contactgegevens werkt Excel prima. Het gaat mis zodra meerdere mensen tegelijk moeten bijwerken, zodra je wilt communiceren vanuit de lijst, of zodra je moet aantonen hoeveel uren er zijn gedraaid. Dan ben je meer tijd kwijt aan het bestand dan aan de vrijwilligers.</p>
`,
  },
];

/** Voegt een sectie in vóór de FAQ-kop, of plakt hem achteraan als die ontbreekt. */
function insertBeforeFaq(html: string, section: string): string {
  const faq = html.search(/<h2[^>]*>[^<]*(?:veelgestelde|faq)[^<]*<\/h2>/i);
  if (faq === -1) return `${html.trimEnd()}\n${section}`;
  return `${html.slice(0, faq).trimEnd()}\n${section}\n${html.slice(faq)}`;
}

/** Plakt extra FAQ-items achter het laatste item van de FAQ-sectie. */
function appendFaqItems(html: string, items: string): string {
  const faq = html.search(/<h2[^>]*>[^<]*(?:veelgestelde|faq)[^<]*<\/h2>/i);
  if (faq === -1) return `${html.trimEnd()}\n${items}`;
  return `${html.trimEnd()}\n${items}`;
}

async function main() {
  const { db } = await import("./index.js");
  const { blogPosts, knowledgeBaseArticles } = await import("./schema.js");
  const { eq } = await import("drizzle-orm");

  console.log(DRY ? "🔍 DRY-RUN — er wordt niets weggeschreven\n" : "✍️  On-page optimalisatie\n");

  let applied = 0;
  for (const p of PATCHES) {
    const table = p.bron === "kennisbank" ? knowledgeBaseArticles : blogPosts;
    const [row] = await db.select().from(table).where(eq(table.slug, p.slug));

    if (!row) { console.log(`  ⚠️  niet gevonden: ${p.slug}`); continue; }

    if ((row.content ?? "").includes(p.marker)) {
      console.log(`  = al toegepast: ${p.slug}`);
      continue;
    }

    let content = row.content ?? "";
    if (p.insertBeforeFaq) content = insertBeforeFaq(content, p.insertBeforeFaq.trim());
    if (p.faqItems)        content = appendFaqItems(content, p.faqItems.trim());

    const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
    const patch: Record<string, unknown> = {
      content,
      readingTime: Math.max(1, Math.round(words / 200)),
      updatedAt: new Date(),
    };
    if (p.metaTitle)       patch.metaTitle = p.metaTitle;
    if (p.metaDescription) patch.metaDescription = p.metaDescription;

    console.log(`  ✎ ${p.slug}`);
    console.log(`      woorden : ${(row.content ?? "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length} → ${words}`);
    if (p.metaTitle)       console.log(`      mTitle  : ${p.metaTitle} (${p.metaTitle.length})`);
    if (p.metaDescription) console.log(`      mDesc   : ${p.metaDescription.length} tekens`);

    if (!DRY) await db.update(table).set(patch).where(eq(table.slug, p.slug));
    applied++;
  }

  console.log(`\n${DRY ? "Zou" : "Heeft"} ${applied} artikel(en) bijgewerkt.`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
