const EMAIL_RE = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}\b/g;
const PHONE_RE = /(?:tel:|href=["']tel:)?(\+31|0031|0)[- .]?[1-9][0-9]{1,2}[- .]?[0-9]{6,8}/g;

const SKIP_EMAIL_PATTERNS = ['@sentry.', '@w3.org', '@example.', '@schema.', 'noreply@', 'no-reply@'];

function isValidEmail(email: string): boolean {
  if (email.length > 80) return false;
  if (/\.(png|jpg|gif|svg|css|js|woff)$/i.test(email)) return false;
  return !SKIP_EMAIL_PATTERNS.some((p) => email.includes(p));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('31')) return `+${digits}`;
  if (digits.startsWith('0')) return `+31${digits.slice(1)}`;
  return raw;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

const GENERIC_EMAIL_RE = /^(info|contact|administratie|secretariaat|welzijn|receptie|aanmelden|hallo|hello)@/i;

function emailMatchesSite(email: string, siteHost: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !siteHost) return false;
  return domain === siteHost || siteHost.endsWith(`.${domain}`) || domain.endsWith(`.${siteHost}`);
}

function pickBestEmail(candidates: string[], siteHost: string): string | undefined {
  const rank = (e: string) =>
    (emailMatchesSite(e, siteHost) ? 0 : 2) + (GENERIC_EMAIL_RE.test(e) ? 0 : 1);
  return [...candidates].sort((a, b) => rank(a) - rank(b))[0];
}

export async function scrapeContactInfo(websiteUrl: string): Promise<ContactInfo> {
  if (!websiteUrl) return {};

  const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BijeenBot/1.0; +https://welzijnsevent.nl)' },
      redirect: 'follow',
    });

    if (!res.ok) return {};

    const html = await res.text();

    let siteHost = '';
    try {
      siteHost = new URL(res.url || url).hostname.replace(/^www\./, '').toLowerCase();
    } catch { /* */ }

    const mailtos = Array.from(html.matchAll(/mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6})/g))
      .map((m) => m[1]);
    const candidates = Array.from(new Set([...mailtos, ...(html.match(EMAIL_RE) ?? [])])).filter(isValidEmail);
    const email = pickBestEmail(candidates, siteHost);

    let phone: string | undefined;
    const phoneMatches = html.match(PHONE_RE);
    if (phoneMatches?.[0]) {
      phone = normalizePhone(phoneMatches[0].replace(/[^\d+]/g, ''));
    }

    return { email, phone };
  } catch {
    return {};
  }
}

export async function scrapeMany(
  items: Array<{ kvkNumber: string; website?: string }>,
  concurrency = 5,
): Promise<Map<string, ContactInfo>> {
  const result = new Map<string, ContactInfo>();
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()!;
      result.set(item.kvkNumber, item.website ? await scrapeContactInfo(item.website) : {});
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return result;
}
