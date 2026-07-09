// Generiek repair-script voor ALLE Bijeen-blogposts:
//  1. ```html ... ``` code-fence eraf (echte HTML blijft over)
//  2. elke interne <a href> naar een NIET-bestaande bestemming unwrappen
//     (link weg, ankertekst blijft staan) — geen dode links meer
//  3. meta_description met ``` opschonen
// Externe links en werkende interne links blijven onaangeroerd.
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

const staticRoutes = new Set(["/","/blog","/kennisbank","/functies","/prijzen","/faq","/over-ons",
  "/gratis-impactrapport","/demo","/demo-aanvragen","/ontdek","/dashboard","/onboarding","/offline",
  "/algemene-voorwaarden","/cookiebeleid","/gebruiksvoorwaarden","/privacyverklaring",
  "/verwerkersovereenkomst","/contact","/evenementen-software-welzijnsorganisaties"]);

const posts = await sql`SELECT id, slug, content, meta_description FROM blog_posts`;
const pubBlog = new Set((await sql`SELECT slug FROM blog_posts WHERE status='published'`).map(r=>r.slug));
let kbCats=[],kbArts=[];
try{kbCats=await sql`SELECT slug FROM knowledge_base_categories`;}catch{}
try{kbArts=await sql`SELECT a.slug AS aslug,c.slug AS cslug FROM knowledge_base_articles a LEFT JOIN knowledge_base_categories c ON a.category_id=c.id WHERE a.status='published'`;}catch{}
const kbCatSet=new Set(kbCats.map(c=>"/kennisbank/"+c.slug));
const kbArtSet=new Set(kbArts.filter(a=>a.cslug).map(a=>"/kennisbank/"+a.cslug+"/"+a.aslug));

function norm(h){ if(/^https?:\/\//i.test(h)){ if(!/bijeen\.(app|nl)/i.test(h)) return null; h=h.replace(/^https?:\/\/[^/]+/i,""); } return h.split("#")[0].split("?")[0].replace(/\/$/,"")||"/"; }
function isLive(hRaw){
  if(!hRaw||hRaw.startsWith("#")||hRaw.startsWith("mailto:")||hRaw.startsWith("tel:")) return true; // niet-nav: laat staan
  if(/^https?:\/\//i.test(hRaw) && !/bijeen\.(app|nl)/i.test(hRaw)) return true; // externe link: laat staan
  const h=norm(hRaw); if(h===null) return true;
  if(staticRoutes.has(h)) return true;
  if(h.startsWith("/blog/")) return pubBlog.has(h.slice(6));
  if(kbCatSet.has(h)||kbArtSet.has(h)) return true;
  if(h.startsWith("/e/")||h.startsWith("/dashboard/")||h.startsWith("/admin/")) return true;
  return false;
}

let totalPosts=0, totalStripped=0;
for(const p of posts){
  let c=p.content||""; const orig=c; let stripped=0;
  // 1) code-fence eraf (alleen de wrapper aan begin+eind; inline codeblocks blijven)
  c=c.replace(/^```[a-z]*\s*\n/i,"").replace(/\n```\s*$/,"").trim();
  // 2) dode interne links unwrappen (link weg, tekst blijft)
  c=c.replace(/<a\b([^>]*?)href=["']([^"']*)["']([^>]*)>([\s\S]*?)<\/a>/gi,(m,pre,href,post,txt)=>{
    if(isLive(href)) return m;
    stripped++; return txt;
  });
  // 3) meta_desc fence
  let md=p.meta_description||""; const mdOrig=md;
  if(md.includes("```")) md=md.replace(/```[a-z]*/gi,"").trim();

  if(c!==orig || md!==mdOrig){
    totalPosts++; totalStripped+=stripped;
    console.log(`${DRY?"[DRY] ":""}${p.slug}  (links weg: ${stripped}${md!==mdOrig?", meta_desc opgeschoond":""})`);
    if(!DRY) await sql`UPDATE blog_posts SET content=${c}, meta_description=${md} WHERE id=${p.id}`;
  }
}
console.log(`\n${DRY?"[DRY] ":""}Posts aangepast: ${totalPosts} | dode links verwijderd: ${totalStripped}`);
