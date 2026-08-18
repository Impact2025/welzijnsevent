/**
 * Backfill: geef alle blog_posts zonder echte cover een auto-cover marker.
 *
 * Voorheen kregen Agent OS-geposte artikelen een "color:<hex>" waarde of
 * helemaal geen coverImage → die toonden een leeg ✍️-blok. Dit script zet ze
 * op "autocover:auto" zodat de UI een gebrand-merkte, op titel+tags gebaseerde
 * SVG-cover toont (en /api/og/blog/[slug] een OG-image levert).
 *
 * Gebruik:
 *   npx tsx src/db/backfill-blog-covers.ts          # echt uitvoeren
 *   npx tsx src/db/backfill-blog-covers.ts --dry    # alleen tellen
 */
import { db, blogPosts } from "@/db";
import { eq, or, isNull, sql } from "drizzle-orm";

async function main() {
  const dry = process.argv.includes("--dry");

  // Alles dat geen echte URL is: color:, autocover:, of NULL/leeg.
  // Een echte cover is een waarde die niet met "color:"/"autocover:" begint
  // én niet leeg is. We selecteren dus de "niet-echte" set.
  const rows = await db
    .select({ id: blogPosts.id, slug: blogPosts.slug, coverImage: blogPosts.coverImage })
    .from(blogPosts);

  const needsUpdate = rows.filter(r => {
    const c = (r.coverImage ?? "").trim();
    if (c === "") return true;
    if (c.startsWith("color:")) return true;
    if (c.startsWith("autocover:")) return false; // al goed
    return false; // echte URL
  });

  console.log(`Totaal posts: ${rows.length}`);
  console.log(`Posts die een auto-cover krijgen: ${needsUpdate.length}`);

  if (dry) {
    for (const r of needsUpdate) console.log(`  - ${r.slug}  (was: ${r.coverImage ?? "NULL"})`);
    console.log("[dry-run] Geen wijzigingen geschreven.");
    return;
  }

  let updated = 0;
  for (const r of needsUpdate) {
    await db
      .update(blogPosts)
      .set({ coverImage: "autocover:auto", updatedAt: new Date() })
      .where(eq(blogPosts.id, r.id));
    updated++;
  }
  console.log(`✓ ${updated} posts bijgewerkt naar autocover:auto`);

  // Her-ping IndexNow zodat zoekmachines de (visueel) verbeterde cards opnieuw ophalen.
  try {
    const { pingIndexNow } = await import("@/lib/indexing");
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const urls = rows.map(r => `${base}/blog/${r.slug}`);
    await pingIndexNow(urls);
    console.log(`✓ IndexNow gepingd voor ${urls.length} URLs`);
  } catch (e) {
    console.warn("IndexNow ping overgeslagen:", (e as Error).message);
  }
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("Backfill mislukt:", e);
  process.exit(1);
});
