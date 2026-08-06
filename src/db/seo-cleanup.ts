/**
 * SEO-opschoning van de blog-content in de database.
 *
 * Drie ingrepen, allemaal idempotent — nogmaals draaien verandert niets:
 *
 *  1. Off-topic posts archiveren. De content-automation publiceerde artikelen
 *     van andere opdrachtgevers op bijeen.app. Die krijgen status "archived",
 *     waardoor de route notFound() geeft. Bewust een 404 en geen redirect: er is
 *     geen inhoudelijk equivalent op dit domein om naartoe te wijzen.
 *
 *  2. HTML-entities decoderen in de zichtbare velden. Titels als
 *     "SEO &amp; slimme KPI's" komen letterlijk zo in de <h1> en de SERP terecht,
 *     omdat React de string nog eens escapet.
 *
 *  3. Meta-velden normaliseren: de merk-suffix eruit (de root layout hangt die
 *     er via title.template al achter), lekgeslagen AI-instructies als
 *     "(152 tekens)" eruit, en een gecureerde herschrijving voor de titels die
 *     midden in een woord waren afgekapt.
 *
 * Gebruik:
 *   npx tsx src/scripts/seo-cleanup.ts --dry   # preview, schrijft niets
 *   npx tsx src/scripts/seo-cleanup.ts         # voert de updates uit
 */
import { loadEnv } from "./load-env.js";

loadEnv();

const DRY = process.argv.includes("--dry");

/**
 * Handmatig geredigeerde meta-velden. Deze titels waren door de automation op
 * exact 60 tekens afgekapt ("...voor evenementenbeheer en"), waardoor
 * truncateMetaTitle er in de SERP een halve zin van maakte. De descriptions
 * bevatten byline-ruis die uit de pagina-body was meegeschraapt.
 */
const CURATED: Record<string, { metaTitle?: string; metaDescription?: string }> = {
  "sroi-berekenen-per-evenement-een-praktisch-stappenplan-met-voorbeeldberekening": {
    metaTitle: "SROI berekenen per evenement: stappenplan",
    metaDescription:
      "Bereken de sociale waarde van je evenement met SROI. Stappenplan met rekenvoorbeeld voor welzijnsorganisaties en ANBI's.",
  },
  "welzijnsevenement-organiseren-waarom-lege-gebaren-niet-werken-en-wat-wel": {
    // Origineel was 73 tekens en werd afgekapt tot "...: 5 psychologische".
    // Deze variant houdt de hook (het getal) én past binnen het titelbudget.
    metaTitle: "Welzijnsevenement: 5 principes die écht werken",
  },
  "wat-is-bijeen-het-slimme-platform-voor-evenementenbeheer-en-impactrapportage-in--4": {
    metaTitle: "Wat is Bijeen? Platform voor evenementenbeheer",
  },
  "vrijwilligersdag-organiseren-complete-gids-2": {
    metaTitle: "Vrijwilligersdag organiseren: complete gids",
  },
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&euro;": "€", "&hellip;": "…",
};

function decodeEntities(s: string): string {
  // Herhaald toepassen vangt dubbel-geëncodeerde invoer af (&amp;amp;).
  let out = s;
  for (let i = 0; i < 3; i++) {
    const next = out.replace(/&(amp|lt|gt|quot|#39|apos|nbsp|euro|hellip);/g, m => ENTITIES[m] ?? m);
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Haalt de merk-suffix en lekgeslagen lengte-instructies uit een meta-veld. */
function normalizeMeta(s: string): string {
  return s
    // "(152 tekens)" of een afgekapte variant "(54 tek" aan het eind
    .replace(/\s*\(\s*\d+\s*tek(?:e(?:n(?:s)?)?)?\s*\)?\s*$/i, "")
    // merk-suffix: "| Bijeen", "— Bijeen", "| Bijeen Kennisbank"
    .replace(/\s*[|—–-]\s*Bijeen(\s+Kennisbank)?\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

type Row = {
  id: string;
  slug: string;
  status: string | null;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  excerpt: string | null;
};

function planFor(p: Row) {
  const changes: Record<string, string> = {};

  const title = decodeEntities(p.title);
  if (title !== p.title) changes.title = title;

  const curated = CURATED[p.slug];

  const rawMetaTitle = curated?.metaTitle ?? p.metaTitle;
  if (rawMetaTitle) {
    const metaTitle = normalizeMeta(decodeEntities(rawMetaTitle));
    if (metaTitle !== p.metaTitle) changes.metaTitle = metaTitle;
  }

  const rawMetaDesc = curated?.metaDescription ?? p.metaDescription;
  if (rawMetaDesc) {
    const metaDescription = normalizeMeta(decodeEntities(rawMetaDesc));
    if (metaDescription !== p.metaDescription) changes.metaDescription = metaDescription;
  }

  if (p.excerpt) {
    const excerpt = decodeEntities(p.excerpt);
    if (excerpt !== p.excerpt) changes.excerpt = excerpt;
  }

  return changes;
}

async function main() {
  const { db } = await import("./index.js");
  const { blogPosts } = await import("./schema.js");
  const { eq, inArray } = await import("drizzle-orm");
  const { OFF_TOPIC_BLOG_SLUGS } = await import("../lib/blog-canonical-map.js");

  console.log(DRY ? "🔍 DRY-RUN — er wordt niets weggeschreven\n" : "✍️  SEO-opschoning blog\n");

  const posts: Row[] = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      status: blogPosts.status,
      title: blogPosts.title,
      metaTitle: blogPosts.metaTitle,
      metaDescription: blogPosts.metaDescription,
      excerpt: blogPosts.excerpt,
    })
    .from(blogPosts);

  const bySlug = new Map(posts.map(p => [p.slug, p]));

  // ── 1. Off-topic posts archiveren ─────────────────────────────────────────
  const toArchive = OFF_TOPIC_BLOG_SLUGS.filter(s => {
    const p = bySlug.get(s);
    return p && p.status !== "archived";
  });

  console.log(`── Off-topic archiveren (${toArchive.length}) ──`);
  for (const slug of toArchive) {
    console.log(`  ${bySlug.get(slug)!.status} → archived   ${slug}`);
  }
  const missing = OFF_TOPIC_BLOG_SLUGS.filter(s => !bySlug.has(s));
  if (missing.length) console.log(`  (niet in db, overgeslagen: ${missing.join(", ")})`);
  if (!toArchive.length) console.log("  niets te doen");

  if (!DRY && toArchive.length) {
    await db.update(blogPosts)
      .set({ status: "archived", updatedAt: new Date() })
      .where(inArray(blogPosts.slug, toArchive));
  }

  // ── 2 + 3. Velden opschonen ───────────────────────────────────────────────
  console.log(`\n── Velden opschonen ──`);
  let touched = 0;
  for (const p of posts) {
    const changes = planFor(p);
    if (!Object.keys(changes).length) continue;
    touched++;
    console.log(`\n  ${p.slug}`);
    for (const [k, v] of Object.entries(changes)) {
      const before = (p as unknown as Record<string, string | null>)[k] ?? "";
      console.log(`    ${k}`);
      console.log(`      voor : ${before}`);
      console.log(`      na   : ${v}`);
    }
    if (!DRY) {
      await db.update(blogPosts)
        .set({ ...changes, updatedAt: new Date() })
        .where(eq(blogPosts.id, p.id));
    }
  }
  if (!touched) console.log("  niets te doen");

  console.log(`\n${DRY ? "Zou" : "Heeft"} ${toArchive.length} posts gearchiveerd en ${touched} posts opgeschoond.`);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
