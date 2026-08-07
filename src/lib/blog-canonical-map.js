/**
 * Eén bron van waarheid voor blog-consolidatie.
 *
 * Bewust een .js-bestand met CommonJS-export: next.config.js (CJS, draait vóór
 * de TS-pipeline) genereert hier de 301-redirects uit, terwijl src/lib/seo.ts
 * dezelfde map importeert voor de sitemap-filter en de rel=canonical fallback.
 * Zo kunnen redirects, canonicals en sitemap niet uit elkaar lopen.
 *
 *   key   = slug van het duplicaat dat verdwijnt
 *   value = slug van het artikel dat blijft
 *
 * Achtergrond: de content-automation heeft meerdere keren hetzelfde artikel
 * opnieuw gepubliceerd onder een opgehoogde slug (-2, -3, -4). Die varianten
 * splitsen ranking-signalen en lezen als thin/duplicate content. We consolideren
 * op de variant met de beste GSC-historie.
 */

/** @type {Record<string, string>} */
const BLOG_CANONICAL_OVERRIDES = {
  // ── Content-merges (keyword-kannibalisatie, juli 2026) ───────────────────
  "sroi-welzijn-sociale-return-op-investering": "sroi-welzijnsevenement-maatschappelijke-waarde",
  "ai-in-het-sociale-domein-ethiek-praktijk":   "ai-in-het-sociaal-domein-wat-mag-wel-niet",
  "eventbrite-alternatief-welzijnsevenementen": "eventbrite-alternatief-welzijnsorganisaties",
  "waarom-traditionele-eventsoftware-faalt-in-het-sociaal-domein-de-noodzaak-van-ee":
    "waarom-commerciele-ticketsystemen-falen-in-het-sociaal-domein",

  // ── "Wat is Bijeen?" — 4x gepubliceerd, 2x bit-voor-bit identiek ─────────
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in-":   "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--2": "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--3": "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",

  // ── "Vrijwilligersdag organiseren" — 4x gepubliceerd ─────────────────────
  // Consolidatie op "-2": die stond in GSC het hoogst (pos 12,8 vs 34,8-41,0).
  "vrijwilligersdag-organiseren-complete-gids":                                       "vrijwilligersdag-organiseren-complete-gids-2",
  "complete-gids-van-programmering-tot-nazorg-voor-een-vrijwilligersdag-die-mensen-": "vrijwilligersdag-organiseren-complete-gids-2",
  "vrijwilligersdag-organiseren-complete-gids-van-programmering-tot-nazorg":          "vrijwilligersdag-organiseren-complete-gids-2",

  // ── Tweede duplicaat-golf (augustus 2026) ────────────────────────────────
  // Dezelfde automation-bug sloeg opnieuw toe met "-2"-slugs. Hier consolideren
  // we juist óp het origineel: dat heeft de GSC-historie.
  "organisatiebijdrage-meten-zo-doe-je-dat-met-data-seo-amp-slimme-kpis-2":
    "organisatiebijdrage-meten-zo-doe-je-dat-met-data-seo-amp-slimme-kpis",
  "sroi-berekenen-per-evenement-een-praktisch-stappenplan-met-voorbeeldberekening-2":
    "sroi-berekenen-per-evenement-een-praktisch-stappenplan-met-voorbeeldberekening",
  "welzijnsevenement-organiseren-waarom-lege-gebaren-niet-werken-en-wat-wel-2":
    "welzijnsevenement-organiseren-waarom-lege-gebaren-niet-werken-en-wat-wel",
};

/**
 * Blogartikelen die zijn opgegaan in een kennisbank-artikel.
 *
 * De blog en de kennisbank behandelden hetzelfde onderwerp met bijna dezelfde
 * indeling. Google liet consequent de kennisbank-versie zien, óók voor de query
 * waar de blogpost specifiek op mikte — die haalde zelf nul impressies. De
 * unieke stukken uit de blogpost zijn in het kennisbank-artikel opgenomen.
 *
 *   key   = blog-slug die verdwijnt
 *   value = pad van het kennisbank-artikel dat blijft (zonder domein)
 */
const BLOG_TO_KENNISBANK_REDIRECTS = {
  "invulvelden-aanmelden-bijeenkomst-zo-stel-je-het-aanmeldformulier-goed-in":
    "/kennisbank/deelnemersbeheer/aanmeldformulier-evenement-maken",
};

/**
 * Slugs van artikelen die niet op bijeen.app thuishoren: de content-automation
 * publiceerde er content van andere opdrachtgevers doorheen. Deze pagina's
 * worden gearchiveerd (404) — een redirect zou de verkeerde signalen doorgeven,
 * want er is geen inhoudelijk equivalent op dit domein.
 */
const OFF_TOPIC_BLOG_SLUGS = [
  "levensverhaal-vastleggen-voor-kleinkinderen-7-praktische-manieren-om-jouw-herinn",
  "levensverhaal-vastleggen-voor-kleinkinderen-7-praktische-manieren-om-jouw-herinn-2",
  "one-pager-optimaliseren-zo-val-je-op-als-interimmer",
  "one-pager-optimaliseren-zo-val-je-op-als-interimmer-2",
  "rapport-status-aanpassingen-templates-en-one-pager",
  "plan-directe-antwoorden-toevoegen-aan-alle-28-paginas-bijeen",
];

module.exports = {
  BLOG_CANONICAL_OVERRIDES,
  BLOG_TO_KENNISBANK_REDIRECTS,
  OFF_TOPIC_BLOG_SLUGS,
};
