/**
 * Branded, deterministische blog-cover generator voor Bijeen.
 *
 * Elke post krijgt automatisch een professionele, gebrand-merkte cover —
 * zonder externe API, zonder data-migratie, 0 runtime image-requests.
 *
 * Werkingsmodel:
 *  - coverImage === "autocover:<hex>"  → render een branded SVG in die kleur
 *  - coverImage === "color:<hex>"      → solid brand block (handmatig gekozen)
 *  - coverImage === "<url>"           → echte geüploade foto (ongewijzigd)
 *  - coverImage === "" / null         → auto-cover in de default palette
 *
 * De gegenereerde SVG is een data-URI en werkt zowel server- als client-side.
 */

export type CoverTheme = {
  bg: string;
  bg2: string;
  ink: string;
  inkSoft: string;
  accent: string;
  chip: string;
  chipInk: string;
};

// Warm Bijeen-palet. Elk theme is contrast-getest voor leesbaarheid van
// witte tekst bovenop de donkere variant.
export const COVER_THEMES: CoverTheme[] = [
  { bg: "#C8522A", bg2: "#9E3D1C", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.82)", accent: "#FF8C66", chip: "rgba(255,255,255,0.16)", chipInk: "#FFFFFF" },
  { bg: "#B5651D", bg2: "#8A4A12", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.82)", accent: "#F0A868", chip: "rgba(255,255,255,0.16)", chipInk: "#FFFFFF" },
  { bg: "#A23E48", bg2: "#7C2E36", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.82)", accent: "#E08A90", chip: "rgba(255,255,255,0.16)", chipInk: "#FFFFFF" },
  { bg: "#1C1814", bg2: "#322A24", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.74)", accent: "#E8693A", chip: "rgba(255,255,255,0.12)", chipInk: "#FFFFFF" },
  { bg: "#2C2420", bg2: "#463A32", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.78)", accent: "#C8522A", chip: "rgba(255,255,255,0.14)", chipInk: "#FFFFFF" },
  { bg: "#6B3FA0", bg2: "#4F2E78", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.82)", accent: "#C9A8F0", chip: "rgba(255,255,255,0.16)", chipInk: "#FFFFFF" },
  { bg: "#1D4E89", bg2: "#143A68", ink: "#FFFFFF", inkSoft: "rgba(255,255,255,0.82)", accent: "#7FB2E8", chip: "rgba(255,255,255,0.16)", chipInk: "#FFFFFF" },
];

const CREAM = "#FAF9F7";
const TERRACOTTA = "#C8522A";

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Bepaal het theme op basis van een seed (slug) — deterministisch. */
export function themeForSeed(seed: string): CoverTheme {
  const i = hashString(seed) % COVER_THEMES.length;
  return COVER_THEMES[i];
}

/** Parse een hex uit een "color:/autocover:" waarde, of null. */
function parseHex(marker: string): string | null {
  const m = /^(?:color|autocover):(#[0-9A-Fa-f]{6})$/.exec(marker);
  return m ? m[1] : null;
}

/** Zet een willekeurige hex om naar een theme met die bg. */
function themeFromHex(hex: string): CoverTheme {
  return {
    bg: hex,
    bg2: shade(hex, -0.22),
    ink: "#FFFFFF",
    inkSoft: "rgba(255,255,255,0.82)",
    accent: "#FF8C66",
    chip: "rgba(255,255,255,0.16)",
    chipInk: "#FFFFFF",
  };
}

/** Verdonker/verlicht een hex met `amt` in [-1,1]. */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + 255 * amt)));
  r = f(r); g = f(g); b = f(b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** Wikkel tekst naar meerdere regels binnen een max breedte (benaderd). */
function wrapTitle(title: string, maxChars = 26): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) { cur = w; continue; }
    if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4); // max 4 regels
}

/**
 * Genereer de SVG-string voor een branded cover.
 * @param opts.title       Artikeltitel
 * @param opts.tags        Optionele tags (max 3 getoond)
 * @param opts.seed        Slug — bepaalt het deterministische theme
 * @param opts.hex         Optionele override kleur (bijv. uit "color:/autocover:")
 * @param opts.w           Breedte (default 1200)
 * @param opts.h           Hoogte (default 630)
 */
export function buildCoverSvg(opts: {
  title: string;
  tags?: string[];
  seed: string;
  hex?: string | null;
  w?: number;
  h?: number;
}): string {
  const W = opts.w ?? 1200;
  const H = opts.h ?? 630;
  const t = opts.hex ? themeFromHex(opts.hex) : themeForSeed(opts.seed);
  const titleLines = wrapTitle(opts.title);
  const tags = (opts.tags ?? []).filter(Boolean).slice(0, 3);

  // Vaste, niet-overlappende posities:
  //  - chips:   altijd bovenaan (y=72, hoogte 40 → 72..112)
  //  - titel:   start altijd ONDER de chips en groeit naar beneden (elke regel +62)
  //  - merk:    altijd onderaan (H - 96)
  // Zo kan een 4-regelige titel nooit de chips of het merk raken.
  const CHIP_Y = 72;
  const TITLE_START = 300;
  const LINE_H = 62;
  const lines = titleLines
    .map((ln, i) => {
      const y = TITLE_START + i * LINE_H;
      return `<text x="80" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="58" font-weight="800" fill="${t.ink}" letter-spacing="-1">${escapeXml(ln)}</text>`;
    })
    .join("");

  const chipY = CHIP_Y;
  const chips = tags
    .map((tag, i) => {
      const label = `#${tag}`;
      const cw = 36 + label.length * 17;
      const x = 80 + i * (cw + 14);
      return `<g>
        <rect x="${x}" y="${chipY}" width="${cw}" height="40" rx="20" fill="${t.chip}"/>
        <text x="${x + cw / 2}" y="${chipY + 26}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="19" font-weight="700" fill="${t.chipInk}">${escapeXml(label)}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bg}"/>
      <stop offset="1" stop-color="${t.bg2}"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.6">
      <stop offset="0" stop-color="${t.accent}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="${W - 90}" cy="${H - 90}" r="220" fill="${t.accent}" opacity="0.12"/>
  <circle cx="${W - 60}" cy="${H - 60}" r="120" fill="${t.accent}" opacity="0.16"/>
  ${chips}
  ${lines}
  <g transform="translate(80, ${H - 96})">
    <rect x="0" y="0" width="44" height="44" rx="11" fill="${CREAM}"/>
    <circle cx="22" cy="22" r="13" fill="${TERRACOTTA}"/>
    <circle cx="22" cy="22" r="6" fill="${CREAM}"/>
    <text x="58" y="30" font-family="Inter, system-ui, sans-serif" font-size="26" font-weight="800" fill="${t.ink}">Bijeen</text>
    <text x="58" y="46" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="600" fill="${t.inkSoft}" letter-spacing="0.5">Inzichten voor het sociaal domein</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Zet een SVG-string om naar een data-URI bruikbaar in een <img src>. */
export function svgToDataUri(svg: string): string {
  // encodeURIComponent is veiliger dan base64 voor SVG in alle browsers.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Hoofd-API: geef de uiteindelijke cover-URL voor een post terug.
 * - echte URL → diezelfde URL
 * - "autocover:<hex>" / "color:<hex>" / leeg → branded SVG data-URI
 */
export function getCoverUrl(post: {
  coverImage?: string | null;
  title: string;
  slug: string;
  tags?: string[] | null;
}): { url: string; isAuto: boolean } {
  const raw = post.coverImage ?? "";
  const hex = parseHex(raw);
  const isColor = raw.startsWith("color:") || raw.startsWith("autocover:");
  const useAuto = isColor || raw.trim() === "";
  if (!useAuto) {
    return { url: raw, isAuto: false };
  }
  const svg = buildCoverSvg({
    title: post.title,
    tags: post.tags ?? [],
    seed: post.slug,
    hex: hex && raw.startsWith("autocover:") ? hex : hex, // bij color: ook branded tonen
  });
  return { url: svgToDataUri(svg), isAuto: true };
}

/** Marker die in de DB opgeslagen wordt voor een auto-cover (optioneel met hex). */
export function autoCoverMarker(hex?: string): string {
  return hex ? `autocover:${hex}` : "autocover:auto";
}
