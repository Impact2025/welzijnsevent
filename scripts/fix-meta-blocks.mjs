// Eenmalig repair-script: verwijder de zichtbare "Meta-titel / Meta-description /
// Interne link suggesties"-blokken (Markdown-formaat, ingeleid door '---' of '***',
// altijd helemaal onderaan de content) uit blog_posts.content, en zet de
// meta-titel + description in de juiste kolommen (meta_title / meta_description).
// Idempotent: veilig meerdere keren te draaien.
//
// Het blok ziet er zo uit (platte Markdown in de HTML-content):
//   ---
//   **Meta-titel:** ...
//   **Meta-description:** ...
//   **Interne link suggesties:** ...
//   - "..." -> ...
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p) {
  try {
    const txt = readFileSync(p, "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}
loadEnv(join(root, ".env.local"));
loadEnv(join(root, ".env"));

const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

const before = await sql`
  SELECT count(*)::int AS n FROM blog_posts
  WHERE content ILIKE '%meta-titel%' OR content ILIKE '%meta-title%'
     OR content ILIKE '%**meta%' OR content ILIKE '%**Meta%'
`;
const total = before[0]?.n ?? 0;
console.log(`Verdachte rijen (content bevat meta-blok): ${total}`);
if (total === 0) { console.log("Niets te doen."); process.exit(0); }

const TITEL_RE = /\bmeta[- ]?titel\b[*:]?\s*(.+?)\s*(?=\n|\*?meta|\*?interne|$)/is;
const DESC_RE  = /\bmeta[- ]?(?:beschrijving|description)\b[*:]?\s*(.+?)\s*(?=\n|\*?meta|\*?interne|$)/is;

const rows = await sql`
  SELECT id, slug, content, meta_title, meta_description
  FROM blog_posts
  WHERE content ILIKE '%meta-titel%' OR content ILIKE '%meta-title%'
     OR content ILIKE '%**meta%' OR content ILIKE '%**Meta%'
  ORDER BY created_at ASC
`;

let touched = 0;
for (const r of rows) {
  const c = r.content || "";
  // Vind de '---' / '***' lijn die het meta-blok inleidt (onderaan).
  const cut1 = c.lastIndexOf("\n---");
  const cut2 = c.lastIndexOf("\n***");
  const cut = Math.max(cut1, cut2);
  if (cut < 0) {
    console.log(`  - ${r.slug}: geeen '---'/'***' scheiding gevonden, overgeslagen`);
    continue;
  }
  const block = c.slice(cut);
  const tb = block.match(TITEL_RE);
  const db = block.match(DESC_RE);
  const newTitle = tb ? tb[1].replace(/\*+/g, "").trim() : (r.meta_title || null);
  const newDesc  = db ? db[1].replace(/\*+/g, "").trim() : (r.meta_description || null);

  let cleaned = c.slice(0, cut).replace(/\s+$/, "").trim();
  // Verwijder een achtergebleven losse '<hr' of lege afsluit-tag aan het eind
  cleaned = cleaned.replace(/\s*(?:<hr\s*\/?>|<\/?(?:p|div|section)[^>]*>\s*)+$/, "").trim();

  await sql`
    UPDATE blog_posts
    SET content = ${cleaned},
        meta_title = COALESCE(NULLIF(TRIM(${newTitle ?? null}), ''), meta_title),
        meta_description = COALESCE(NULLIF(TRIM(${newDesc ?? null}), ''), meta_description)
    WHERE id = ${r.id}
  `;
  touched++;
  console.log(`  - ${r.slug}: blok verwijderd (titel="${newTitle}", desc="${newDesc ? newDesc.slice(0,40)+'…' : '—'}")`);
}
console.log(`Klaar. ${touched} rij(en) gerepareerd.`);
