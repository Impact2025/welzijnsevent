import { discoverOrganizations } from './discovery';
import { scrapeMany } from './scraper';
import { scoreMany, DEFAULT_SCORING_CONTEXT } from './scorer';
import { db, prospectLeads } from '@/db';
import { eq, and, or, like } from 'drizzle-orm';
import type { SearchResult } from './types';

export interface RunSearchOptions {
  query: string;
  maxResults?: number;
  scoringContext?: string;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`)
      .hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

export async function runLeadSearch({
  query,
  maxResults = 10,
  scoringContext = DEFAULT_SCORING_CONTEXT,
}: RunSearchOptions): Promise<SearchResult[]> {
  const limit = Math.min(Math.max(Number(maxResults) || 10, 1), 30);

  // 1 — Discover organizations via DuckDuckGo/Brave
  const discovered = await discoverOrganizations(query.trim(), limit);
  if (discovered.length === 0) return [];

  // 2 — Scrape contact info from each website
  const contactMap = await scrapeMany(
    discovered.map((d) => ({ kvkNumber: d.domain, website: d.url })),
    5,
  );

  // 3 — AI score all organizations
  const scores = await scoreMany(
    discovered.map((d) => ({ name: d.name, domain: d.domain, snippet: d.snippet })),
    scoringContext,
    5,
  );

  // 4 — Check which domains are already saved
  const existing = await db
    .select({ website: prospectLeads.website })
    .from(prospectLeads)
    .where(
      or(
        ...discovered.map((d) => like(prospectLeads.website, `%${d.domain}%`)),
      ),
    )
    .catch(() => []);

  const savedDomains = new Set(
    existing
      .map((l) => hostnameOf(l.website ?? ''))
      .filter(Boolean) as string[],
  );

  // 5 — Assemble + sort by score desc
  const results: SearchResult[] = discovered.map((d, i) => {
    const contact = contactMap.get(d.domain) ?? {};
    const score = scores[i];
    return {
      kvkNumber: d.domain,
      name: d.name,
      website: d.url,
      email: contact.email,
      phone: contact.phone,
      aiScore: score.score ?? undefined,
      aiRationale: score.rationale,
      alreadySaved: savedDomains.has(d.domain),
      sbiDescription: d.snippet?.slice(0, 150),
    };
  });

  results.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  return results;
}

// Persist a search result as a prospect lead
export async function saveSearchResult(r: SearchResult): Promise<string | null> {
  if (!r.name) return null;

  try {
    const domain = r.website ? hostnameOf(r.website) : null;

    // Check for existing lead by website domain
    if (domain) {
      const existing = await db
        .select({ id: prospectLeads.id })
        .from(prospectLeads)
        .where(like(prospectLeads.website, `%${domain}%`))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(prospectLeads)
          .set({
            email: r.email ?? undefined,
            telefoon: r.phone ?? undefined,
            aiScore: r.aiScore ?? undefined,
            aiRationale: r.aiRationale ?? undefined,
            sbiBeschrijving: r.sbiDescription ?? undefined,
            website: r.website ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(prospectLeads.id, existing[0].id));

        return existing[0].id;
      }
    }

    const inserted = await db
      .insert(prospectLeads)
      .values({
        organisatie: r.name,
        email: r.email ?? '',
        telefoon: r.phone ?? null,
        website: r.website ?? null,
        aiScore: r.aiScore ?? null,
        aiRationale: r.aiRationale ?? null,
        sbiBeschrijving: r.sbiDescription ?? null,
        bron: 'websearch',
        status: 'nieuw',
        scrapedAt: r.email || r.phone ? new Date() : null,
        scoredAt: r.aiScore != null ? new Date() : null,
      })
      .returning({ id: prospectLeads.id });

    return inserted[0]?.id ?? null;
  } catch (error) {
    console.error('saveSearchResult error:', error);
    return null;
  }
}
