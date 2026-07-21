/**
 * De root layout (src/app/layout.tsx) hangt via `title.template` automatisch
 * " — Bijeen" achter elke pagina-title. Reken dat mee in Google's ~60-tekens
 * budget en voeg zelf GEEN merk-suffix meer toe — dat leidde eerder tot dubbele
 * branding in de rendered <title>, bijvoorbeeld "X | Bijeen — Bijeen".
 */
const TEMPLATE_SUFFIX_LENGTH = " — Bijeen".length;

export function truncateMetaTitle(title: string, maxLength = 60): string {
  // Strip een eventuele handmatige merk-suffix uit bestaande content/AI-output.
  const base = title.replace(/\s*[|—-]\s*Bijeen(\s+Kennisbank)?\s*$/i, "").trim();
  const budget = maxLength - TEMPLATE_SUFFIX_LENGTH;
  if (base.length <= budget) return base;
  return base.slice(0, budget).replace(/\s+\S*$/, "").replace(/[:,;.\-—]+$/, "").trim();
}

/**
 * Google knipt meta descriptions af rond ~155-160 tekens.
 */
export function truncateMetaDescription(description: string, maxLength = 155): string {
  if (description.length <= maxLength) return description;
  const cut = description.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim();
  return `${cut}…`;
}

/**
 * Keyword-kannibalisatie: twee blogartikelen die op dezelfde zoekintentie
 * mikken splitsen hun ranking-signalen. We houden beide artikelen live (geen
 * content weggooien), maar laten het zwakkere exemplaar via rel=canonical naar
 * het sterkere wijzen. Zo consolideert Google de signalen op één URL.
 *
 * key = slug van het zwakkere (te consolideren) artikel
 * value = slug van het canonieke doel (het sterkere, diepere artikel)
 */
export const BLOG_CANONICAL_OVERRIDES: Record<string, string> = {
  "sroi-welzijn-sociale-return-op-investering": "sroi-welzijnsevenement-maatschappelijke-waarde",
  "ai-in-het-sociale-domein-ethiek-praktijk":   "ai-in-het-sociaal-domein-wat-mag-wel-niet",
  "eventbrite-alternatief-welzijnsevenementen": "eventbrite-alternatief-welzijnsorganisaties",

  // "Wat is Bijeen?" werd 4x gepubliceerd (automation-bug, 2x zelfs bit-voor-bit
  // identiek). Consolideer op de laatste/volledigste versie.
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in-":   "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--2": "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--3": "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4",

  // "Vrijwilligersdag organiseren" 4x gepubliceerd. Consolideer op de "-2"
  // versie: die rankt in GSC al op positie 8,7 (de rest 9,3-33,5 of nog geen data).
  "vrijwilligersdag-organiseren-complete-gids":                                     "vrijwilligersdag-organiseren-complete-gids-2",
  "complete-gids-van-programmering-tot-nazorg-voor-een-vrijwilligersdag-die-mensen-": "vrijwilligersdag-organiseren-complete-gids-2",
  "vrijwilligersdag-organiseren-complete-gids-van-programmering-tot-nazorg":         "vrijwilligersdag-organiseren-complete-gids-2",
};

/** Slugs die naar een ander artikel canonicaliseren; niet zelfstandig in de sitemap opnemen. */
export const canonicalizedAwayBlogSlugs = new Set(Object.keys(BLOG_CANONICAL_OVERRIDES));
