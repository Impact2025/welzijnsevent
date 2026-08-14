import { loadEnv } from "../src/db/load-env.js";
loadEnv();

const DRY = process.argv.includes("--dry");

(async () => {
  const { db } = await import("../src/db/index.js");
  const { blogPosts } = await import("../src/db/schema.js");
  const { eq, and, ne, sql } = await import("drizzle-orm");

  const slug = "sociale-cohesie-versterken-met-een-evenement-6-aanpakken-die-werken";

  // 1) Haal de post + alle gepubliceerde blog-slugs (voor echte interne links).
  const rows = await db
    .select({ id: blogPosts.id, slug: blogPosts.slug, title: blogPosts.title, content: blogPosts.content })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug));
  if (!rows.length) { console.log("POST NOT FOUND"); return; }
  const post = rows[0];
  const all = await db
    .select({ slug: blogPosts.slug, title: blogPosts.title })
    .from(blogPosts)
    .where(and(eq(blogPosts.status, "published"), ne(blogPosts.slug, slug)));

  // Interne link-kandidaten: de 3 meest relevante posts t.o.v. het focus-keyword,
  // zodat we niet off-topic linken (dat schaadt SEO). Relevance = overlap in
  // woorden tussen focus-keyword en (titel + slug).
  const focus = "sociale cohesie versterken evenement";
  const fwords = Array.from(new Set(focus.split(/\s+/).filter((w) => w.length > 3)));
  const scored = all.map((b) => {
    const text = `${b.title} ${b.slug.replace(/-/g, " ")}`.toLowerCase();
    const score = fwords.filter((w) => text.includes(w)).length;
    return { ...b, score };
  }).sort((a, b) => b.score - a.score);
  const candidates = scored.slice(0, 3).map((b) => ({
    url: `https://bijeen.app/blog/${b.slug}`,
    title: b.title,
  }));

  let content = post.content || "";

  // 2) Metadata-blok strippen (markdown-variant: **Metadata** + bullet-list).
  const META_BLOCK = /<p>\s*\*\*\s*Metadata\s*\*\*\s*<\/p>\s*(?:<p>\s*[-*]\s*(?:focus\s+keyword|url-slug|meta[- ]?titel|meta[- ]?title|meta[- ]?beschrijving|meta[- ]?description)[^<]*<\/p>\s*)+/gi;
  const before = content;
  content = content.replace(META_BLOCK, "");
  const metaRemoved = content !== before;

  // 3) FAQ toevoegen als die ontbreekt.
  const hasFaq = /veelgestelde vragen/i.test(content);
  let faqAdded = false;
  if (!hasFaq) {
    const faq = `
<h2>Veelgestelde vragen</h2>
<h3>Waarom versterkt een evenement de sociale cohesie beter dan een campagne?</h3>
<p>Omdat mensen elkaar ontmoeten in plaats van een boodschap te lezen. Een buurt die samen iets organiseert, bouwt aan vertrouwen en onderlinge hulp — precies de ingredienten van sociale cohesie. De ontmoeting zélf is het instrument, niet de flyer.</p>
<h3>Hoe voorkom ik dat het bij één leuke middag blijft?</h3>
<p>Geef bezoekers een rol, stel een urgente vraag centraal en spreek een concrete vervolgafspraak af. Die drie elementen zorgen ervoor dat het contact na het evenement doorwerkt in de wijk.</p>
<h3>Kan Bijeen helpen bij de organisatie en opvolging?</h3>
<p>Ja. Bijeen neemt het aanmelden, de check-in en de vervolgcommunicatie uit handen, zodat jij je richt op de ontmoeting. Je kunt een eerste evenement gratis proberen voor tot 50 deelnemers.</p>`;
    const idx = content.lastIndexOf("</p>");
    if (idx !== -1) {
      content = content.slice(0, idx + 4) + faq + content.slice(idx + 4);
      faqAdded = true;
    }
  }

  // 4) In-body interne links toevoegen (deterministisch: langste substring-match
  //    op titel ÉN slug-phrase, zodat we een anker vinden dat écht in de body staat).
  let linksAdded = 0;
  for (const c of candidates) {
    const plain = content.replace(/<[^>]+>/g, " ").toLowerCase();
    const opts: string[] = [];
    if (c.title) opts.push(c.title);
    const slugPhrase = c.url.split("/blog/")[1]?.replace(/-/g, " ") || "";
    if (slugPhrase.length > 6) opts.push(slugPhrase);
    let anchor: string | null = null;
    for (const opt of opts) {
      const words = opt.split(/\s+/).filter((w) => w.length > 3);
      for (let n = Math.min(words.length, 8); n >= 3; n--) {
        for (let i = 0; i + n <= words.length; i++) {
          const sub = words.slice(i, i + n).join(" ");
          if (sub.length > 6 && plain.includes(sub.toLowerCase())) { anchor = sub; break; }
        }
        if (anchor) break;
      }
      if (anchor) break;
    }
    if (!anchor) continue;
    const re = new RegExp(`(?<!<a[^>]*>)(${anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![^<]*</a>)`, "i");
    if (re.test(content)) {
      content = content.replace(re, `<a href="${c.url}">$1</a>`);
      linksAdded++;
    }
  }

  console.log(`DRY=${DRY}`);
  console.log("metaRemoved :", metaRemoved);
  console.log("faqAdded    :", faqAdded);
  console.log("linksAdded  :", linksAdded, "->", candidates.map((c) => c.url));
  console.log("new content length:", content.length);

  if (!DRY && (metaRemoved || faqAdded || linksAdded)) {
    await db.update(blogPosts)
      .set({ content, updatedAt: new Date() })
      .where(eq(blogPosts.id, post.id));
    console.log("✅ UPDATED post", post.id);
  } else {
    console.log("ℹ️  nothing to write (or dry-run)");
  }
})().catch((e) => { console.error(e); process.exit(1); });
