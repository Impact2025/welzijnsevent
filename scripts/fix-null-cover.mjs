// Eenmalig: geef bestaande blog_posts met cover_image IS NULL een huisstijl-kleur
// (warm Bijeen-palet), zodat ze geen lege ✍️-placeholder tonen maar een
// gekleurd blok — net als de handmatig aangemaakte kleur-posts.
// Draai: node scripts/fix-null-cover.mjs  (laadt .env.local automatisch)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Laadt .env.local (DATABASE_URL) — eenvoudige parser, geen dotenv-dep nodig.
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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL niet gevonden in .env.local/.env");
  process.exit(1);
}

const COLORS = ["#C8522A", "#E08A3C", "#B5651D", "#A23E48", "#C2410C"];
const sql = neon(DATABASE_URL);

// 1) Tel hoeveel null-rijen er zijn
const before = await sql`SELECT count(*)::int AS n FROM blog_posts WHERE cover_image IS NULL`;
const count = before[0]?.n ?? 0;
console.log(`Blog_posts met cover_image IS NULL: ${count}`);

if (count === 0) {
  console.log("Niets te doen. Klaar.");
  process.exit(0);
}

// 2) Haal ze op (id + slug) om deterministisch een kleur te kiezen (slug-lengte,
//    zelfde logica als de route zodat ze consistent blijven met nieuwe posts).
const rows = await sql`SELECT id, slug FROM blog_posts WHERE cover_image IS NULL ORDER BY created_at ASC`;
let updated = 0;
for (const r of rows) {
  const slug = r.slug || "";
  const color = `color:${COLORS[slug.length % COLORS.length]}`;
  await sql`UPDATE blog_posts SET cover_image = ${color} WHERE id = ${r.id}`;
  updated++;
}
console.log(`Geupdatet: ${updated} rij(en).`);
console.log("Klaar.");
