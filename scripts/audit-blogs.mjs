// Accurate audit v2: check interne links tegen ECHTE routes + blog-slugs + kennisbank-DB.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
function loadEnv(p){try{const t=readFileSync(p,"utf8");for(const l of t.split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");}}catch{}}
loadEnv(join(root,".env.local")); loadEnv(join(root,".env"));
const { neon } = await import("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

// Echte statische routes (marketing + publieke top-level)
const staticRoutes = new Set(["/","/blog","/kennisbank","/functies","/prijzen","/faq","/over-ons",
  "/gratis-impactrapport","/demo","/demo-aanvragen","/ontdek","/dashboard","/onboarding","/offline",
  "/algemene-voorwaarden","/cookiebeleid","/gebruiksvoorwaarden","/privacyverklaring",
  "/verwerkersovereenkomst","/contact","/evenementen-software-welzijnsorganisaties"]);

const posts = await sql`SELECT id, slug, title, content, meta_title, meta_description, cover_image, status FROM blog_posts ORDER BY created_at DESC NULLS LAST`;
const pubBlog = new Set(posts.filter(p=>p.status==="published").map(p=>p.slug));

let kbCats=[], kbArts=[];
try { kbCats = await sql`SELECT slug FROM knowledge_base_categories`; } catch(e){ console.log("(geen kb cats)"); }
try { kbArts = await sql`SELECT a.slug AS aslug, c.slug AS cslug FROM knowledge_base_articles a LEFT JOIN knowledge_base_categories c ON a.category_id=c.id WHERE a.status='published'`; } catch(e){ console.log("(geen kb arts)"); }
const kbCatSet = new Set(kbCats.map(c=>"/kennisbank/"+c.slug));
const kbArtSet = new Set(kbArts.filter(a=>a.cslug).map(a=>"/kennisbank/"+a.cslug+"/"+a.aslug));

function internalHrefs(html){
  const out=[]; const re=/<a\b[^>]*?href=["']([^"']+)["'][^>]*>/gi; let m;
  while((m=re.exec(html))){
    let h=m[1].trim();
    if(!h||h.startsWith("#")||h.startsWith("mailto:")||h.startsWith("tel:")) continue;
    if(/^https?:\/\//i.test(h)){ if(!/bijeen\.(app|nl)/i.test(h)) continue; h=h.replace(/^https?:\/\/[^/]+/i,""); }
    h=h.split("#")[0].split("?")[0].replace(/\/$/,"")||"/";
    out.push(h);
  }
  return out;
}
function isLive(h){
  if(staticRoutes.has(h)) return true;
  if(h.startsWith("/blog/")) return pubBlog.has(h.slice(6));
  if(kbCatSet.has(h)||kbArtSet.has(h)) return true;
  if(h.startsWith("/e/")||h.startsWith("/dashboard/")||h.startsWith("/admin/")) return true; // dynamische/app
  return false;
}

const report=[];
for(const p of posts){
  const c=p.content||""; const issues=[];
  if(/```/.test(c)) issues.push("code-fence");
  if(/\*\*\s*meta[- ]?(titel|description|beschrijving)/i.test(c)||/<strong>\s*meta[- ]?titel/i.test(c)) issues.push("zichtbaar-meta-blok");
  const bad=[...new Set(internalHrefs(c).filter(h=>!isLive(h)))];
  if(bad.length) issues.push("DODE-LINKS: "+bad.join(", "));
  const mt=p.meta_title||""; if(mt.includes("&amp;")) issues.push("meta_title-&amp;");
  const md=p.meta_description||""; if(md.includes("```")) issues.push("meta_desc-fence");
  if(issues.length) report.push({slug:p.slug,status:p.status,issues});
}
console.log("TOTAAL:",posts.length,"| kb-cats:",kbCatSet.size,"| kb-arts:",kbArtSet.size,"| met issues:",report.length,"\n");
for(const r of report){ console.log(`[${r.status}] ${r.slug}`); for(const i of r.issues) console.log("     - "+i); }
