// Pro-afhandeling backlog:
//  A) Archiveer het misgeplaatste interim-artikel 'rapport-status...' (hoort op
//     WeAreImpact, niet op Bijeen — eventplatform welzijn).
//  B) Herstel interne links naar BESTAANDE pagina's waar de AI eerder naar een
//     niet-bestaande URL wees. We matchen ankertekst-intentie -> echte URL uit
//     de live sitemap, en leggen de link opnieuw (in de platte tekst die na de
//     eerdere repair is overgebleven).
// Draai met --dry om alleen te tonen wat er zou gebeuren.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p){try{const t=readFileSync(p,"utf8");for(const l of t.split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");}}catch{}}
loadEnv(join(root,".env.local")); loadEnv(join(root,".env"));
const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const DRY = process.argv.includes("--dry");

// ── A) Archiveer misgeplaatst artikel ──────────────────────────────────
const misplaced = "rapport-status-aanpassingen-templates-en-one-pager";
if(DRY){
  console.log(`[DRY] Zou archiveren: ${misplaced} (interim-content, hoort niet op Bijeen)`);
} else {
  const res = await sql`UPDATE blog_posts SET status='archived' WHERE slug=${misplaced} AND status='published' RETURNING slug`;
  console.log(res.length ? `Gearchiveerd: ${misplaced}` : `(al niet-published: ${misplaced})`);
}

// ── B) Relink naar bestaande pagina's ──────────────────────────────────
// Mapping: (bron-post-slug) -> [{ anchorRegex, url, label }]
// url = ECHTE bestaande pagina uit de sitemap. anchorRegex zoekt de zin/woord
// in de platte tekst om er een <a> omheen te zetten (eerste vrije match).
const relinks = {
  "levensverhaal-vastleggen-voor-kleinkinderen-7-praktische-manieren-om-jouw-herinn": [
    // 'hoe het werkt' -> functies-pagina; ouderen/vrijwilligers -> bestaande KB
    { re:/\bhoe (?:het|bijeen) werkt\b/i, url:"/functies", label:"functies" },
  ],
  "sroi-berekenen-per-evenement-een-praktisch-stappenplan-met-voorbeeldberekening": [
    { re:/\bimpactmeting (?:voor )?anbi[- ]?stichtingen?\b/i, url:"/kennisbank/impact-en-rapportage/impact-meten-welzijnsevenement", label:"impact-meten KB" },
    { re:/\bvrijwilligersbeheer en sociale waarde\b/i, url:"/kennisbank/vrijwilligers/vrijwilligersbeheer-aanmelding-tot-bedankje", label:"vrijwilligersbeheer KB" },
    { re:/\bsroi[- ]?sjablonen\b/i, url:"/blog/sroi-welzijn-sociale-return-op-investering", label:"sroi-welzijn blog" },
  ],
};

for(const [slug, rules] of Object.entries(relinks)){
  const rows = await sql`SELECT id, content FROM blog_posts WHERE slug=${slug}`;
  if(!rows.length){ console.log("  (post niet gevonden:",slug,")"); continue; }
  let c = rows[0].content || ""; let added=0; const done=[];
  const spans = [];
  for(const m of c.matchAll(/<a\b[\s\S]*?<\/a>|<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi)) spans.push([m.index, m.index+m[0].length]);
  for(const rule of rules){
    const m = rule.re.exec(c);
    if(!m) { done.push(`  - GEEN match voor ${rule.label} (anker niet in tekst)`); continue; }
    // niet binnen bestaande <a>/<h> plaatsen
    if(spans.some(([s,e])=> s<=m.index && m.index<e)) { done.push(`  - anker ${rule.label} zit in tag/heading, overslaan`); continue; }
    const anchor = m[0];
    c = c.slice(0,m.index) + `<a href="${rule.url}">${anchor}</a>` + c.slice(m.index+anchor.length);
    added++; done.push(`  + link gelegd: "${anchor}" -> ${rule.url}`);
  }
  console.log(`\n${DRY?"[DRY] ":""}${slug}  (links toegevoegd: ${added})`);
  done.forEach(d=>console.log(d));
  if(!DRY && added) await sql`UPDATE blog_posts SET content=${c} WHERE id=${rows[0].id}`;
}
console.log(`\n${DRY?"[DRY] klaar (niets gewijzigd)":"Klaar."}`);
