/**
 * Meldt de actuele URL-set aan bij IndexNow (Bing, Yandex, Seznam e.a.).
 *
 * De URL-lijst komt uit de live sitemap in plaats van uit de database: de
 * sitemap filtert de geconsolideerde duplicaten al weg, dus we pingen nooit een
 * URL die inmiddels redirect.
 *
 * Daarbovenop melden we juist wél de URL's die zijn wéggeconsolideerd of
 * gearchiveerd. Die geven nu een 301 respectievelijk 404, en een ping is de
 * snelste manier om zoekmachines dat te laten ophalen — anders blijven de oude
 * varianten nog weken in de index staan.
 *
 * Gebruik (ná een deploy, anders ping je de oude situatie):
 *   npx tsx src/db/ping-indexnow.ts --dry   # toont de lijst, verstuurt niets
 *   npx tsx src/db/ping-indexnow.ts
 */
import { loadEnv } from "./load-env.js";

loadEnv();

const DRY = process.argv.includes("--dry");
const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bijeen.app").replace(/\/$/, "");

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`${BASE}/sitemap.xml`, { cache: "no-store" });
  if (!res.ok) throw new Error(`sitemap.xml gaf ${res.status}`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), m => m[1].trim());
}

async function main() {
  const { BLOG_CANONICAL_OVERRIDES, OFF_TOPIC_BLOG_SLUGS } =
    await import("../lib/blog-canonical-map.js");

  const live = await sitemapUrls();
  const retired = [
    ...Object.keys(BLOG_CANONICAL_OVERRIDES),
    ...OFF_TOPIC_BLOG_SLUGS,
  ].map(slug => `${BASE}/blog/${slug}`);

  const urls = Array.from(new Set(live.concat(retired)));

  console.log(`Sitemap-URL's      : ${live.length}`);
  console.log(`Uitgefaseerde URL's: ${retired.length}`);
  console.log(`Totaal te pingen   : ${urls.length}`);

  if (DRY) {
    console.log("\n🔍 DRY-RUN — er wordt niets verstuurd\n");
    for (const u of urls) console.log(`  ${u}`);
    return;
  }

  const { pingIndexNow } = await import("../lib/indexing.js");
  await pingIndexNow(urls);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
