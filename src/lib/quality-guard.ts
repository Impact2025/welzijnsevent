/**
 * quality-guard.ts — Pre-publish content validator voor blog & kennisbank.
 *
 * Doel: voorkomt dat beschadigde content live komt. De automation (Agent OS /
 * Iris) levert af en toe troep aan door LLM-tokenrot:
 *   - english/de/chinese woorden midden in NL tekst ("without", "nichts", "工具")
 *   - placeholder-tekst die nooit is ingevuld ("[link naar toolkit]",
 *     "[contact@bijeen.nl]", "TODO", "TBD", "lorem ipsum")
 *   - gelekte template-markup ("{{", "undefined", "null" als zichtbare tekst)
 *
 * Deze guard draait in POST /api/blog vóórdat iets wordt opgeslagen. Bij een
 * harde fout (corruptie/placeholder) weigeren we de publish met 422 + reden,
 * zodat de automation het kan herstellen in plaats van rotzooi te publiceren.
 *
 * Ontwerpkeuzes:
 * - Geen externe NLP: we werken met (1) een gerichte bloklijst van
 *   corruptie-tokens, (2) detectie van niet-Latijnse scripts (CJK, Cyrillisch,
 *   Arabisch), en (3) detectie van lege placeholders. Dat is bewust
 *   conservatief — liever één valse positief (een post die opnieuw moet) dan
 *   één stukje "nichts" op de live site.
 * - "EN woorden" zijn notoir valse positieven (NL leent "tool", "team",
 *   "checklist" etc.). Daarom alleen tokens die in correct NL níét voorkomen
 *   én typische LLM-rot zijn, plus een hoge drempel (>=2 verdachte tokens).
 */

// ── 1. Bekende corruptie-tokens (exact, hoofdletterongevoelig) ──────────────
// Alleen woorden die in correct Nederlands nooit voorkomen en typisch zijn voor
// LLM-tokenrot (EN/DE/ZH/JA). Geen gewone leenwoorden.
const CORRUPTION_TOKENS = new Set([
  // Engels dat in NL-tekst hier fout zit
  "without", "nichts", "today", "therefore", "however", "moreover", "thus",
  "hence", "whereas", "namely", "indeed", "furthermore", "amongst", "whilst",
  "utilize", "regarding", "additionally", "subsequently", "nonetheless",
  "nevertheless", "overall", "specifically", "approximately", "currently",
  "various", "numerous", "several", "within", "upon", "via", "per", "the",
  "and", "for", "with", "this", "that", "from", "your", "you", "are", "was",
  "were", "will", "have", "has", "been", "they", "their", "there", "here",
  "what", "when", "where", "which", "while", "about", "into", "also", "can",
  "should", "would", "could", "may", "might", "each", "other", "than", "then",
  "them", "these", "those", "some", "such", "only", "just", "like", "more",
  "most", "very", "first", "last", "next", "new", "old", "good", "best",
  "well", "how", "why", "who", "whom", "whose", "our", "out", "use", "used",
  "using", "make", "made", "find", "found", "need", "needs", "one", "two",
  "see", "saw", "get", "got", "let", "set", "end", "big", "small", "high",
  "low", "long", "short", "open", "close", "read", "write", "help", "start",
  "stop", "keep", "give", "take", "work", "play", "show", "turn", "move",
  "live", "dead", "free", "full", "half", "both", "all", "any", "few", "own",
  "same", "real", "sure", "easy", "hard", "fast", "slow", "early", "late",
  // Duits
  "nicht", "und", "oder", "aber", "doch", "sehr", "auch", "schon", "noch",
  "wird", "werden", "seine", "ihre", "einem", "einen", "dieser", "jeder",
  "während", "obwohl", "weil", "dass", "eine", "einer", "kein", "keine",
  "nichts", "alles", "wir", "sie", "er", "es", "ist", "sind", "war", "waren",
  "hat", "haben", "kann", "soll", "muss", "will", "zum", "zur", "auf", "aus",
  "mit", "nach", "bei", "vor", "für", "gegen", "durch", "über", "unter",
  "zwischen", "ohne", "um", "an", "in", "im", "am", "den", "der", "dem",
  "des", "das", "die", "nur", "schon", "mehr", "weniger", "sehr", "ganz",
  // Veelvoorkomende CJK-zinsdelen die als tokenrot verschijnen (placeholder-set)
  "工具", "数据", "用户", "系统", "问题", "内容", "使用", "请", "我们", "您的",
  // Japanse/Chinese losse markers
  "の", "は", "を", "に", "が", "と", "です", "ます", "例えば",
]);

// ── 1b. Woorden die in het Nederlands (of als leenwoord) wél geldig zijn ──
// Deze mogen NOOIT als "tokenrot" worden flagt, ook niet als ze toevallig in
// CORRUPTION_TOKENS staan. Zonder deze set falen normale NL-zinnen
// ("er is", "in de", "die man", "het was", "alles half open", "was in die per
// er start waren half") ten onrechte — en blokkeert de publish met een 422
// terwijl de tekst perfect Nederlands is. Gespiegeld aan de Python
// quality_guard.DUTCH_SAFE (Agent OS backend), die wel een safe-list had en
// daardoor geen false-positives gaf. 18 aug 2026: de site-guard miste deze
// set en wees gezonde Bijeen-artikelen af op woorden als "die", "in", "er",
// "was", "per", "via", "half", "help", "start", "alles", "last".
const DUTCH_SAFE = new Set([
  // Nederlandse functiewoorden / lidwoorden / voornaamwoorden / voorzetsels
  "de", "het", "een", "en", "van", "in", "op", "aan", "met", "voor", "naar",
  "bij", "door", "over", "onder", "tussen", "zonder", "om", "tot", "als",
  "dat", "dit", "deze", "ons", "jij", "hij", "zij", "ze", "wij", "ik", "mij",
  "je", "jou", "u", "uw", "zijn", "haar", "hen", "hun", "waar", "wanneer",
  "hoe", "waarom", "welke", "elke", "alle", "veel", "weinig", "sommige",
  "andere", "zelfde", "zelf", "echt", "zeker", "makkelijk", "moeilijk",
  "snel", "langzaam", "vroeg", "laat", "groot", "klein", "hoog", "laag",
  "lang", "kort", "levend", "dood", "gratis", "vol", "beide", "enige",
  "eigen",
  // de specifieke false-positives uit de productie-logs van 18-08
  "er", "was", "waren", "alles", "per", "half", "open", "start", "let",
  "via", "see", "get", "set", "end", "out", "use", "used", "using", "make",
  "made", "find", "found", "need", "needs", "one", "two", "you", "your",
  "are", "have", "has", "been", "they", "their", "there", "here", "what",
  "when", "where", "which", "while", "about", "into", "also", "can",
  "should", "would", "could", "may", "might", "each", "other", "than",
  "then", "them", "these", "those", "some", "such", "only", "just", "like",
  "more", "most", "very", "first", "last", "next", "new", "old", "good",
  "best", "well", "how", "why", "who", "whom", "whose", "our", "from",
  "this", "that", "with", "for", "and", "the", "a", "an", "to", "of", "at",
  "is", "it", "as", "be", "do", "we", "he", "she", "my", "me", "not", "no",
  "so", "up", "by", "or", "if", "his", "were", "will", "die", "last",
  "help", "verder", "snel", "laat", "werk", "speel", "toon", "draai",
  "verplaats", "levens", "vrij", "volle", "beide", "allemaal", "paar",
]);

// ── 2. Plaatshouders die nooit live mogen ─────────────────────────────────
const PLACEHOLDER_PATTERNS: Array<[RegExp, string]> = [
  [/\[link\b[^\]]*\]/i, "lege download-/link-plaatshouder '[link …]'"],
  [/\[contact[^\]]*\]/i, "e-mail-plaatshouder '[contact …]' (gebruik een echte mailto-link)"],
  [/\[todo\]/i, "TODO-plaatshouder"],
  [/\[tbd\]/i, "TBD-plaatshouder"],
  [/lorem ipsum/i, "'lorem ipsum'-vulling"],
  [/\[\s*(invul|vul hier|hier invullen)[^\]]*\]/i, "oningevelde invul-plaatshouder"],
  [/\{\{[^}]+\}\}/, "onverwerkte template-variabele '{{ … }}'"],
  [/\{\s*\w+\s*\}/, "onverwerkte template-variabele '{ … }'"],
];

// Zichtbaar "undefined"/"null" als tekst (niet in code/attrs) — losse woorden.
const VISIBLE_GARBAGE = /\b(?:undefined|null)\b/i;

// Niet-Latijnse scripts die in een NL-post niet thuis horen (CJK/Cyrillisch/
// Arabisch/Thais/Grieks). Hiermee vangen we Chinese/Japanse rot net zo goed af
// als een gemist token in CORRUPTION_TOKENS.
const NON_LATIN_SCRIPT = /[　-〿぀-ヿ㐀-䶿一-鿿Ѐ-ӿӐ-֏؀-ۿ฀-๿ἀ-῿]/;

export interface QualityIssue {
  severity: "hard" | "warn";
  message: string;
  snippet?: string;
}

export interface QualityReport {
  ok: boolean;
  issues: QualityIssue[];
  /** Aantal verdachte EN/DE tokens — bruikbaar als drempelwaarde. */
  suspicionScore: number;
}

/** Strip HTML naar platte tekst voor token-analyse. */
function toText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

/** Tokeniseer op woordgrenzen, alleen alphanumeriek. */
function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9à-ÿ]+/i)
    .filter(Boolean);
}

export function validateBlogContent(html: string): QualityReport {
  const issues: QualityIssue[] = [];
  const text = toText(html);
  const toks = tokens(text);

  // (a) Exacte corruptie-tokens — maar ALLEEN als het woord niet in het
  // Nederlands voorkomt (DUTCH_SAFE). Zonder die uitsluiting flagt elke
  // gewone NL-zin ("er was in die per …") ten onrechte als tokenrot.
  const hits = new Set<string>();
  for (const t of toks) {
    if (CORRUPTION_TOKENS.has(t) && !DUTCH_SAFE.has(t)) hits.add(t);
  }
  // Drempel: één los Engels zinnetje in een NL-artikel (ratio < drempel) mag de
  // publish niet killen; structurele rot (>= 2 écht vreemde tokens) wel.
  // DUTCH_SAFE voorkomt false-positives op woorden die in het Nederlands geldig
  // zijn ("er", "in", "die", "was" …). Gespiegeld aan de Python-backend-guard.
  if (hits.size >= 2) {
    const hitList = Array.from(hits);
    issues.push({
      severity: "hard",
      message: `Mogelijke taalcorruptie (LLM-tokenrot) gedetecteerd: ${hitList.slice(0, 8).join(", ")}${hitList.length > 8 ? " …" : ""}. Nederlandse tekst mag geen Engelse/Duitse/zakelijke vreemde woorden bevatten.`,
      snippet: hitList.slice(0, 5).join(", "),
    });
  }

  // (b) Niet-Latijnse scripts (CJK/Cyrillisch/Arabisch/…)
  const nonLatin = text.match(NON_LATIN_SCRIPT);
  if (nonLatin) {
    issues.push({
      severity: "hard",
      message: "Niet-Latijnse karakters gevonden (Chinees/Japans/Cyrillisch/Arabisch). Tekst is niet-Nederlands en hoort niet in deze post.",
      snippet: nonLatin[0],
    });
  }

  // (c) Plaatshouders
  for (const [re, msg] of PLACEHOLDER_PATTERNS) {
    const m = html.match(re) || text.match(re);
    if (m) {
      issues.push({ severity: "hard", message: `Plaatshouder niet ingevuld: ${msg}.`, snippet: m[0] });
    }
  }

  // (d) Zichtbaar undefined/null
  if (VISIBLE_GARBAGE.test(text)) {
    const m = text.match(VISIBLE_GARBAGE);
    issues.push({
      severity: "hard",
      message: `Zichtbare '${m?.[0] ?? "undefined/null"}'-tekst in de body. Template niet correct verwerkt.`,
      snippet: m?.[0],
    });
  }

  // Drempel voor EN/DE: een enkel leenwoord is oké, >=2 verdachte tokens = rot.
  const suspicionScore = hits.size;

  const ok = issues.every((i) => i.severity !== "hard");
  return { ok, issues, suspicionScore };
}

/**
 * Slug-hygiene: naast de bestaande slugify() (die & → en doet) vangen we hier
 * resterende `amp`, dubbele koppeltekens en trailing koppeltekens af. Geeft
 * een schone slug terug; als de input al schoon was, blijft hij identiek.
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .replace(/&amp;/gi, "en")
    .replace(/&/g, "en")
    .replace(/amp/gi, "en") // resterende 'amp' uit oude entity-lekken
    .replace(/-{2,}/g, "-") // dubbele koppeltekens
    .replace(/^-+|-+$/g, "") // leading/trailing
    .slice(0, 80);
}
