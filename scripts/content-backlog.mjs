// Content-backlog: welke interne link-bestemmingen probeerde de AI te leggen
// die (nog) niet bestaan? We reconstrueren uit de audit-bevindingen en
// classificeren per type (blog / kennisbank / statische pagina).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p){try{const t=readFileSync(p,"utf8");for(const l of t.split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");}}catch{}}
loadEnv(join(root,".env.local")); loadEnv(join(root,".env"));
const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// De dode bestemmingen die tijdens de repair zijn verwijderd (uit audit-output),
// met de bron-post + de ankertekst-intentie die de AI had.
const deadLinks = [
  { href:"/hoe-het-werkt", from:"levensverhaal-vastleggen...", intent:"uitleg hoe Bijeen/dienst werkt" },
  { href:"/blog/ouderen-ondersteunen-levensverhaal", from:"levensverhaal-vastleggen...", intent:"blog: ouderen begeleiden bij levensverhaal (voor professionals)" },
  { href:"/blog/herinneringen-bewaren-voor-je-kinderen", from:"levensverhaal-vastleggen...", intent:"blog: herinneringen bewaren voor kinderen" },
  { href:"/blog/gespreksvragen-ouderen", from:"levensverhaal-vastleggen...", intent:"blog: gespreksvragen voor ouderen" },
  { href:"/digitale-transformatie", from:"rapport-status-aanpassingen...", intent:"pijlerpagina digitale transformatie sociaal domein" },
  { href:"/templates", from:"rapport-status-aanpassingen...", intent:"templates voor interimmers/opdrachtgevers" },
  { href:"/kennisbank/sroi-sjablonen", from:"sroi-berekenen...", intent:"kennisbank: SROI-sjablonen" },
  { href:"/kennisbank/impactmeting-anbi", from:"sroi-berekenen...", intent:"kennisbank: impactmeting voor ANBI-stichtingen" },
  { href:"/blog/vrijwilligersbeheer-en-sociale-waarde", from:"sroi-berekenen...", intent:"blog: vrijwilligersbeheer en sociale waarde" },
];

// Check kennisbank-categorieën (zodat we weten onder welke categorie een KB-artikel zou vallen)
let kbCats=[];
try{kbCats=await sql`SELECT slug, name FROM knowledge_base_categories ORDER BY name`;}catch{}

const byType = { blog:[], kennisbank:[], pagina:[] };
for(const d of deadLinks){
  if(d.href.startsWith("/blog/")) byType.blog.push(d);
  else if(d.href.startsWith("/kennisbank/")) byType.kennisbank.push(d);
  else byType.pagina.push(d);
}

console.log("═══ CONTENT-BACKLOG: gewenste maar ontbrekende pagina's ═══\n");
console.log("De AI probeerde naar deze interne bestemmingen te linken. Ze bestaan (nog) niet;");
console.log("de links zijn nu als platte tekst behouden (geen 404). Maak je de pagina aan,");
console.log("dan kun je de link opnieuw leggen.\n");

console.log("── BLOGARTIKELEN ("+byType.blog.length+") ──");
for(const d of byType.blog) console.log(`  • ${d.href}\n      → ${d.intent}\n      (gewenst vanuit: ${d.from})`);
console.log("\n── KENNISBANK-ARTIKELEN ("+byType.kennisbank.length+") ──");
for(const d of byType.kennisbank) console.log(`  • ${d.href}\n      → ${d.intent}\n      (gewenst vanuit: ${d.from})`);
console.log("\n── STATISCHE PAGINA'S ("+byType.pagina.length+") ──");
for(const d of byType.pagina) console.log(`  • ${d.href}\n      → ${d.intent}\n      (gewenst vanuit: ${d.from})`);

console.log("\n── Bestaande kennisbank-categorieën (voor plaatsing KB-artikelen) ──");
for(const c of kbCats) console.log(`  /kennisbank/${c.slug}  (${c.name})`);
