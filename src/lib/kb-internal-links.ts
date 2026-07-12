/**
 * Contextuele interne links voor de kennisbank.
 *
 * SEO: links in de lópende tekst (binnen <p>) geven Google veel sterkere
 * relevantie- en autoriteitssignalen dan een "gerelateerd"-voetblok.
 *
 * Aanpak: een gecureerde anker-map. Voor elk bron-artikel staat expliciet welke
 * ankertekst (een zin die al in dat artikel voorkomt) naar welk doel-artikel
 * linkt. Elk anker is geverifieerd tegen de echte content, langs de
 * pillar/cluster-structuur van de kennisbank. Zowel de seeds (bij insert) als het
 * backfill-script gebruiken deze ene bron van waarheid, zodat de linkstructuur
 * DRY, reviewbaar en reproduceerbaar blijft.
 *
 * De injector is idempotent: een anker dat al binnen een <a> staat wordt
 * overgeslagen, dus meermaals draaien voegt niets dubbel toe.
 */

export type KbLink = {
  /** Slug van het doel-artikel. */
  target: string;
  /** Categorie-slug van het doel (voor de href). */
  categorySlug: string;
  /** Exacte ankertekst zoals die in het bron-artikel voorkomt (case-insensitief). */
  anchor: string;
};

// bron-slug → contextuele links die in dat artikel geïnjecteerd worden.
// Volgorde = prioriteit; eerste passende ankerpositie wint.
export const KB_ANCHORS: Record<string, KbLink[]> = {
  "checklist-welzijnsevenement": [
    { target: "impact-meten-welzijnsevenement", categorySlug: "impact-en-rapportage", anchor: "De impact" },
    { target: "vrijwilligers-werven-evenementen", categorySlug: "vrijwilligers", anchor: "vrijwilligers" },
  ],
  "evenementenprogramma-maken": [
    { target: "live-polls-evenementen", categorySlug: "evenementen-organiseren", anchor: "live polls" },
    { target: "live-qa-evenementen", categorySlug: "evenementen-organiseren", anchor: "live Q&A" },
  ],
  "deelnemersbeheer-grote-evenementen": [
    { target: "aanmeldformulier-evenement-maken", categorySlug: "deelnemersbeheer", anchor: "aanmeldformulier" },
    { target: "qr-code-check-in-evenement", categorySlug: "deelnemersbeheer", anchor: "QR code" },
    { target: "automatische-bevestigingen-herinneringen", categorySlug: "deelnemersbeheer", anchor: "bevestigingsmail" },
  ],
  "aanmeldformulier-evenement-maken": [
    { target: "automatische-bevestigingen-herinneringen", categorySlug: "deelnemersbeheer", anchor: "bevestigingsmail" },
  ],
  "digitaal-inchecken-vs-papieren-lijst": [
    { target: "qr-code-check-in-evenement", categorySlug: "deelnemersbeheer", anchor: "QR code" },
  ],
  "impact-meten-welzijnsevenement": [
    { target: "impactrapport-evenement", categorySlug: "impact-en-rapportage", anchor: "impactrapport" },
  ],
  "subsidieverantwoording-evenementdata": [
    { target: "impactrapport-evenement", categorySlug: "impact-en-rapportage", anchor: "impactrapport" },
  ],
  "event-software-nonprofits": [
    { target: "bijeen-vs-eventbrite-nonprofits", categorySlug: "digitale-tools", anchor: "Eventbrite" },
  ],
  "gdpr-evenementen-welzijnsorganisatie": [
    { target: "toestemming-fotografie-evenementen", categorySlug: "gdpr-en-privacy", anchor: "fotografie" },
  ],
  "ai-en-avg-welzijnsorganisaties": [
    { target: "gdpr-evenementen-welzijnsorganisatie", categorySlug: "gdpr-en-privacy", anchor: "AVG" },
  ],
  "avg-inschrijfformulier-checklist": [
    { target: "gdpr-evenementen-welzijnsorganisatie", categorySlug: "gdpr-en-privacy", anchor: "AVG" },
    { target: "aanmeldformulier-evenement-maken", categorySlug: "deelnemersbeheer", anchor: "aanmeldformulier" },
  ],
  "toestemming-fotografie-evenementen": [
    { target: "gdpr-evenementen-welzijnsorganisatie", categorySlug: "gdpr-en-privacy", anchor: "AVG" },
  ],
  "vrijwilligers-werven-evenementen": [
    { target: "vrijwilligersbeheer-aanmelding-tot-bedankje", categorySlug: "vrijwilligers", anchor: "vrijwilligersbeheer" },
  ],
  "vrijwilligersbeheer-aanmelding-tot-bedankje": [
    { target: "vrijwilligers-werven-evenementen", categorySlug: "vrijwilligers", anchor: "vrijwilligers" },
  ],
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Staat `idx` binnen een geopende, nog niet gesloten <a> ... </a>? */
function isInsideAnchor(html: string, idx: number): boolean {
  const before = html.slice(0, idx);
  return before.lastIndexOf("<a") > before.lastIndexOf("</a>");
}

/** Staat `idx` binnen een <p> ... </p> (dus lopende tekst, geen kop of lijst)? */
function isInsideParagraph(html: string, idx: number): boolean {
  const before = html.slice(0, idx);
  const lastOpen = Math.max(before.lastIndexOf("<p>"), before.lastIndexOf("<p "));
  const lastClose = before.lastIndexOf("</p>");
  return lastOpen > lastClose;
}

const WORD_CHAR = /[0-9A-Za-zÀ-ÿ]/;

/**
 * Staat het gevonden anker op woordgrenzen? Voorkomt dat een anker binnen een
 * samengesteld woord matcht (bv. "fotografie" in "fotografietoestemming").
 */
function hasWordBoundaries(html: string, start: number, end: number): boolean {
  const prev = start > 0 ? html[start - 1] : "";
  const next = end < html.length ? html[end] : "";
  return !WORD_CHAR.test(prev) && !WORD_CHAR.test(next);
}

/**
 * Injecteert de gecureerde contextuele interne links in de HTML van een
 * kennisbank-artikel.
 * - Alleen binnen <p> (lopende tekst), nooit in koppen, lijsten of bestaande links.
 * - Eerste passende positie van elk anker wint; per link max één keer.
 * - Idempotent: al gelinkte ankers worden overgeslagen.
 *
 * @returns { html, added, targets } — de aangepaste HTML, aantal toegevoegde links,
 *   en de doel-slugs die gelinkt zijn.
 */
export function injectKbInternalLinks(
  html: string,
  currentSlug: string,
): { html: string; added: number; targets: string[] } {
  let out = html;
  const targets: string[] = [];

  for (const link of KB_ANCHORS[currentSlug] ?? []) {
    if (link.target === currentSlug) continue;

    const href = `/kennisbank/${link.categorySlug}/${link.target}`;
    // Idempotent: staat er al een link naar dit doel, dan niet nog een tweede
    // voorkomen aanlinken.
    if (out.includes(`href="${href}"`)) continue;

    // Loop álle voorkomens langs en pak de eerste geldige positie: in lopende
    // tekst (<p>), niet in een bestaande link, en op woordgrenzen.
    const re = new RegExp(escapeRegExp(link.anchor), "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(out)) !== null) {
      const idx = m.index;
      const end = idx + m[0].length;
      if (!isInsideParagraph(out, idx) || isInsideAnchor(out, idx) || !hasWordBoundaries(out, idx, end)) continue;

      const matched = out.slice(idx, end);
      out = out.slice(0, idx) + `<a href="${href}">${matched}</a>` + out.slice(end);
      targets.push(link.target);
      break;
    }
  }

  return { html: out, added: targets.length, targets };
}
