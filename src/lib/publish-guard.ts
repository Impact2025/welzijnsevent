import { BLOG_CANONICAL_OVERRIDES, OFF_TOPIC_BLOG_SLUGS } from "./blog-canonical-map.js";

/**
 * Guards voor de publicatie-endpoints (POST /api/blog en /api/kennisbank).
 *
 * Achtergrond: die endpoints losten een botsende slug op door net zo lang op te
 * hogen tot hij vrij was:
 *
 *     while (usedSlugs.has(slug)) slug = `${baseSlug}-${counter++}`;
 *
 * Voor een automation die hetzelfde artikel opnieuw aanbiedt betekent dat: geen
 * update, maar een nieuw artikel onder "-2". Dat is twee keer gebeurd (juli en
 * augustus 2026) en leverde clusters van 4 bijna-identieke pagina's op die
 * elkaars ranking-signalen opaten. De duplicaten kwamen dus niet uit de
 * pipeline — ze werden hier aangemaakt.
 *
 * Nieuw gedrag: een bestaande slug betekent standaard "werk dat artikel bij".
 * Ophogen gebeurt alleen nog als de aanroeper er expliciet om vraagt.
 */

export function slugify(str: string): string {
  return str
    .replace(/&amp;/gi, " en ") // ontkoppelde HTML-entiteit eerst terug naar woord
    .replace(/&/g, " en ")      // kale & → "en" (voorkomt "amp" in slug)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Slugs die niet opnieuw aangemaakt mogen worden: artikelen die we bewust
 * hebben geconsolideerd of gearchiveerd. Zonder deze check kan de automation
 * ze zo weer tot leven wekken, waarna de 301 uit next.config naar een pagina
 * wijst die weer bestaat.
 */
export function blockedSlugReason(slug: string): string | null {
  if (OFF_TOPIC_BLOG_SLUGS.includes(slug)) {
    return `"${slug}" is gearchiveerd omdat het niet op dit domein thuishoort. ` +
      `Publiceer deze content op het juiste domein.`;
  }
  if (Object.prototype.hasOwnProperty.call(BLOG_CANONICAL_OVERRIDES, slug)) {
    return `"${slug}" is geconsolideerd naar "${BLOG_CANONICAL_OVERRIDES[slug]}" en ` +
      `redirect met een 301. Werk dat artikel bij in plaats van deze slug.`;
  }
  return null;
}

/** Herkent de automatisch opgehoogde varianten: "foo-2", "foo-3", … */
export function looksLikeDuplicateSuffix(slug: string): boolean {
  return /-\d+$/.test(slug);
}

export type SlugDecision =
  | { action: "create"; slug: string }
  | { action: "update"; slug: string }
  | { action: "reject"; reason: string };

/**
 * Bepaalt wat er met een binnenkomende publicatie moet gebeuren.
 *
 * @param requested  gewenste slug (uit body.slug of afgeleid van de titel)
 * @param slugExists lookup op exacte slug
 * @param allowDuplicate expliciete opt-in om tóch een "-N" variant te maken
 */
export async function decideSlug(
  requested: string,
  slugExists: (slug: string) => Promise<boolean>,
  allowDuplicate = false,
): Promise<SlugDecision> {
  const blocked = blockedSlugReason(requested);
  if (blocked) return { action: "reject", reason: blocked };

  if (!(await slugExists(requested))) return { action: "create", slug: requested };

  if (!allowDuplicate) return { action: "update", slug: requested };

  // Expliciete opt-in: zoek de eerstvolgende vrije variant.
  for (let n = 2; n < 100; n++) {
    const candidate = `${requested}-${n}`;
    if (blockedSlugReason(candidate)) continue;
    if (!(await slugExists(candidate))) return { action: "create", slug: candidate };
  }
  return { action: "reject", reason: `Geen vrije slug-variant gevonden voor "${requested}".` };
}
