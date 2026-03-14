import { db, attendees, events, contactProfiles } from "@/db";
import { eq, inArray, sql } from "drizzle-orm";
import { getCurrentOrg } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Download } from "lucide-react";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import { LifecycleBadge } from "@/components/crm/LifecycleBadge";
import { ContactFilters } from "@/components/crm/ContactFilters";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 30;

export default async function ContactenPage({
  searchParams,
}: {
  searchParams: { q?: string; lifecycle?: string; sort?: string; tag?: string; page?: string };
}) {
  const org = await getCurrentOrg();
  if (!org) redirect("/onboarding");

  const q = searchParams.q ?? "";
  const lifecycle = searchParams.lifecycle ?? "";
  const sort = searchParams.sort ?? "last_seen";
  const tagFilter = searchParams.tag ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));

  const orgEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.organizationId, org.id));
  const eventIds = orgEvents.map(e => e.id);

  let contacts: {
    email: string;
    name: string;
    organization: string | null;
    eventsCount: number;
    checkins: number;
    lastSeen: string;
    engagementScore: number;
    lifecycleStage: string;
    tags: string[];
  }[] = [];

  if (eventIds.length > 0) {
    const stats = await db
      .select({
        email: attendees.email,
        name: sql<string>`max(${attendees.name})`,
        organization: sql<string>`max(${attendees.organization})`,
        eventsCount: sql<number>`count(distinct ${attendees.eventId})`,
        checkins: sql<number>`sum(case when ${attendees.status} = 'ingecheckt' then 1 else 0 end)`,
        lastSeen: sql<string>`max(${attendees.registeredAt})`,
      })
      .from(attendees)
      .where(inArray(attendees.eventId, eventIds))
      .groupBy(attendees.email);

    const profiles = await db
      .select()
      .from(contactProfiles)
      .where(eq(contactProfiles.organizationId, org.id));
    const profileMap = Object.fromEntries(profiles.map(p => [p.email.toLowerCase(), p]));

    contacts = stats.map(c => {
      const profile = profileMap[c.email.toLowerCase()];
      return {
        email: c.email,
        name: c.name ?? c.email,
        organization: c.organization,
        eventsCount: Number(c.eventsCount),
        checkins: Number(c.checkins),
        lastSeen: c.lastSeen,
        engagementScore: Number(c.eventsCount) * 10 + Number(c.checkins) * 5,
        lifecycleStage: profile?.lifecycleStage ?? "contact",
        tags: (profile?.tags ?? []) as string[],
      };
    });
  }

  // Filter
  if (q) {
    const lower = q.toLowerCase();
    contacts = contacts.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.email.toLowerCase().includes(lower) ||
      c.organization?.toLowerCase().includes(lower)
    );
  }
  if (lifecycle) contacts = contacts.filter(c => c.lifecycleStage === lifecycle);
  if (tagFilter) contacts = contacts.filter(c => c.tags.includes(tagFilter));

  // Sort
  if (sort === "name") contacts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "events") contacts.sort((a, b) => b.eventsCount - a.eventsCount);
  else if (sort === "score") contacts.sort((a, b) => b.engagementScore - a.engagementScore);
  else contacts.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());

  const total = contacts.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = contacts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const scoreColor = (score: number) => {
    if (score >= 50) return "text-amber-500 font-bold";
    if (score >= 25) return "text-green-600 font-semibold";
    return "text-ink-muted";
  };

  return (
    <div className="p-7 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/crm" className="text-[11px] font-bold text-ink-muted uppercase tracking-widest hover:text-terra-500 transition-colors">
              CRM
            </Link>
            <span className="text-ink-muted/40">›</span>
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-widest">Contacten</p>
          </div>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">Alle Contacten</h1>
          <p className="text-sm text-ink-muted mt-1 font-medium">{total} unieke contacten over alle evenementen</p>
        </div>
        <a
          href={`/api/crm/export?orgId=${org.id}`}
          className="flex items-center gap-2 bg-white border border-sand text-ink-muted text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-sand transition-colors"
        >
          <Download size={14} />
          Exporteren
        </a>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <ContactFilters />
      </div>

      {/* List */}
      <div className="card-base overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1.5fr_80px_80px_120px_80px] gap-4 px-5 py-3 border-b border-sand bg-cream/50">
          {["Contact", "Organisatie", "Events", "Score", "Lifecycle", "Laatste activiteit"].map(h => (
            <p key={h} className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{h}</p>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={36} className="mx-auto text-ink-muted/30 mb-3" />
            <p className="text-sm font-semibold text-ink mb-1">Geen contacten gevonden</p>
            <p className="text-xs text-ink-muted">Pas de filters aan of maak een evenement aan</p>
          </div>
        ) : (
          <div>
            {paginated.map(contact => (
              <Link
                key={contact.email}
                href={`/dashboard/crm/contacten/${encodeURIComponent(contact.email)}`}
                className="flex md:grid md:grid-cols-[2fr_1.5fr_80px_80px_120px_80px] gap-4 items-center px-5 py-3.5 hover:bg-cream/60 transition-colors border-b border-sand/40 last:border-0 group"
              >
                {/* Contact */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold", avatarColor(contact.name))}>
                    {getInitials(contact.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate group-hover:text-terra-500 transition-colors">
                      {contact.name}
                    </p>
                    <p className="text-[11px] text-ink-muted truncate">{contact.email}</p>
                  </div>
                </div>

                {/* Org */}
                <p className="text-sm text-ink-muted truncate hidden md:block">{contact.organization ?? "—"}</p>

                {/* Events */}
                <div className="hidden md:flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-ink">{contact.eventsCount}</span>
                  <span className="text-[10px] text-ink-muted">({contact.checkins}✓)</span>
                </div>

                {/* Score */}
                <p className={cn("text-sm hidden md:block", scoreColor(contact.engagementScore))}>
                  {contact.engagementScore}
                </p>

                {/* Lifecycle */}
                <div className="hidden md:block">
                  <LifecycleBadge stage={contact.lifecycleStage} size="sm" />
                </div>

                {/* Last seen */}
                <p className="text-[11px] text-ink-muted hidden md:block shrink-0">
                  {contact.lastSeen ? formatRelative(contact.lastSeen) : "—"}
                </p>

                {/* Mobile: compact info */}
                <div className="flex items-center gap-2 shrink-0 md:hidden ml-auto">
                  <LifecycleBadge stage={contact.lifecycleStage} size="sm" />
                  <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            baseHref={`/dashboard/crm/contacten${(() => {
              const p = new URLSearchParams();
              if (q) p.set("q", q);
              if (lifecycle) p.set("lifecycle", lifecycle);
              if (sort !== "last_seen") p.set("sort", sort);
              const s = p.toString();
              return s ? `?${s}` : "";
            })()}`}
          />
        </div>
      )}
    </div>
  );
}
