import { readFileSync } from "fs";
import { join } from "path";
import { injectKbInternalLinks } from "../lib/kb-internal-links.js";

/**
 * Backfill: injecteert de gecureerde contextuele interne links (zie
 * ../lib/kb-internal-links) in de reeds gepubliceerde kennisbank-artikelen in de
 * database. Deelt exact dezelfde anker-map als de seeds, dus het resultaat is
 * identiek en idempotent — nogmaals draaien verandert niets.
 *
 * Gebruik:
 *   npx tsx src/db/backfill-kb-internal-links.ts --dry   # preview, schrijft niets
 *   npx tsx src/db/backfill-kb-internal-links.ts         # voert de update uit
 */

// Laad .env en .env.local vóór db-import (static imports worden gehoist)
for (const f of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(join(process.cwd(), f), "utf8").split("\n")) {
      const m = line.match(/^\s*([^#\s=][^=]*)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const DRY = process.argv.includes("--dry");

async function backfill() {
  const { db } = await import("../db/index.js");
  const { knowledgeBaseArticles } = await import("../db/schema.js");
  const { eq } = await import("drizzle-orm");

  console.log(DRY ? "🔍 DRY-RUN — er wordt niets weggeschreven\n" : "✍️  Backfill contextuele interne links\n");

  const articles = await db
    .select({ id: knowledgeBaseArticles.id, slug: knowledgeBaseArticles.slug, content: knowledgeBaseArticles.content })
    .from(knowledgeBaseArticles);

  let changed = 0;
  let totalLinks = 0;

  for (const a of articles) {
    const { html, added, targets } = injectKbInternalLinks(a.content ?? "", a.slug);
    if (added === 0 || html === a.content) continue;

    changed++;
    totalLinks += added;
    console.log(`${added} link(s)  ${a.slug}  →  ${targets.join(", ")}`);

    if (!DRY) {
      await db.update(knowledgeBaseArticles)
        .set({ content: html, updatedAt: new Date() })
        .where(eq(knowledgeBaseArticles.id, a.id));
    }
  }

  console.log(`\n${DRY ? "Zou aanpassen" : "Aangepast"}: ${changed} artikelen, ${totalLinks} interne links.`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error("❌ Backfill mislukt:", err);
  process.exit(1);
});
