// Generic organization discovery — uses Brave Search API when available,
// falls back to DuckDuckGo HTML scraping.

export interface DiscoveryResult {
  name: string;
  url: string;
  domain: string;
  snippet?: string;
}

const SKIP_DOMAINS = [
  'wikipedia.', 'facebook.com', 'linkedin.com', 'twitter.com', 'x.com',
  'instagram.com', 'youtube.com', 'nos.nl', 'ad.nl', 'nu.nl', 'rtl.nl',
];

function isOrgUrl(domain: string) {
  return !SKIP_DOMAINS.some((s) => domain.includes(s));
}

async function discoverViaBrave(query: string, maxResults: number): Promise<DiscoveryResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return [];

  const results: DiscoveryResult[] = [];
  const seen = new Set<string>();
  const perPage = Math.min(maxResults, 20);

  try {
    const qs = new URLSearchParams({
      q: query,
      count: String(perPage),
      country: 'nl',
      search_lang: 'nl',
      text_decorations: '0',
    });

    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${qs}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];
    const data = await res.json() as {
      web?: { results?: Array<{ title: string; url: string; description?: string }> };
    };

    for (const item of data.web?.results ?? []) {
      let domain: string;
      try { domain = new URL(item.url).hostname.replace(/^www\./, ''); } catch { continue; }
      if (!isOrgUrl(domain) || seen.has(domain)) continue;
      seen.add(domain);
      results.push({
        name: item.title,
        url: item.url,
        domain,
        snippet: item.description?.slice(0, 300),
      });
      if (results.length >= maxResults) break;
    }
  } catch {
    // fall through to DDG
  }
  return results;
}

const DDG_HTML = 'https://html.duckduckgo.com/html/';

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '').trim();
}

function parseDdgHtml(html: string): DiscoveryResult[] {
  const results: DiscoveryResult[] = [];
  const seen = new Set<string>();
  const blocks = html.split(/(?=<div class="result(?:\s[^"]*)?"\s)/);

  for (const block of blocks) {
    const uddgMatch = block.match(/uddg=([^&"'\s]+)/);
    if (!uddgMatch) continue;
    let url: string;
    try { url = decodeURIComponent(uddgMatch[1]); } catch { continue; }
    if (!url.startsWith('http')) continue;
    let domain: string;
    try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { continue; }
    if (!isOrgUrl(domain) || seen.has(domain)) continue;
    seen.add(domain);
    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const name = titleMatch ? decodeHtmlEntities(titleMatch[1]) : domain;
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    const snippet = snippetMatch ? decodeHtmlEntities(snippetMatch[1]).slice(0, 300) : undefined;
    results.push({ name, url, domain, snippet });
  }
  return results;
}

async function discoverViaDDG(query: string, maxResults: number): Promise<DiscoveryResult[]> {
  const pages = Math.ceil(Math.min(maxResults, 30) / 10);
  const allResults: DiscoveryResult[] = [];
  const seen = new Set<string>();

  for (let page = 0; page < pages; page++) {
    try {
      const qs = new URLSearchParams({ q: query });
      if (page > 0) qs.set('s', String(page * 25));

      const res = await fetch(`${DDG_HTML}?${qs}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'nl-NL,nl;q=0.9',
        },
        signal: AbortSignal.timeout(12_000),
      });

      if (!res.ok) break;
      const html = await res.text();
      const pageResults = parseDdgHtml(html);
      for (const r of pageResults) {
        if (!seen.has(r.domain)) { seen.add(r.domain); allResults.push(r); }
      }
      if (pageResults.length < 5) break;
    } catch { break; }
  }
  return allResults.slice(0, maxResults);
}

export async function discoverOrganizations(
  query: string,
  maxResults = 10,
): Promise<DiscoveryResult[]> {
  if (process.env.BRAVE_SEARCH_API_KEY) {
    const results = await discoverViaBrave(query, maxResults);
    if (results.length > 0) return results;
  }
  return discoverViaDDG(query, maxResults);
}
