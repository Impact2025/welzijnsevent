import { db, events, attendees } from "@/db";
import { desc, count, eq } from "drizzle-orm";
import { EventCard } from "@/components/events/event-card";
import { FilterTabs } from "@/components/events/filter-tabs";
import { SearchInput } from "@/components/events/search-input";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = [
  { label: "Alle",      value: "" },
  { label: "Actief",    value: "published" },
  { label: "Live",      value: "live" },
  { label: "Concept",   value: "draft" },
  { label: "Afgelopen", value: "ended" },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const q = searchParams.q ?? "";
  const statusFilter = searchParams.status ?? "";

  const allEvents = await db.select().from(events).orderBy(desc(events.startsAt));

  // Filter
  let filtered = allEvents;
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      e =>
        e.title.toLowerCase().includes(lower) ||
        e.location?.toLowerCase().includes(lower) ||
        e.description?.toLowerCase().includes(lower)
    );
  }
  if (statusFilter) {
    filtered = filtered.filter(e => e.status === statusFilter);
  }

  const enrichedEvents = await Promise.all(
    filtered.map(async (event) => {
      const [{ count: attendeeCount }] = await db
        .select({ count: count() })
        .from(attendees)
        .where(eq(attendees.eventId, event.id));
      return { ...event, attendeeCount };
    })
  );

  const tabsWithCounts = STATUS_TABS.map(t => ({
    ...t,
    count: t.value
      ? allEvents.filter(e => e.status === t.value).length
      : allEvents.length,
  }));

  const statusParams = statusFilter ? `status=${statusFilter}` : "";

  return (
    <div className="px-4 py-5 sm:p-6 max-w-3xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Evenementen</h1>
          <p className="text-ink-muted text-sm">{allEvents.length} evenementen totaal</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nieuw </span>evenement
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-4">
        <FilterTabs tabs={tabsWithCounts} currentValue={statusFilter} currentQ={q} />
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Zoek evenementen..."
        defaultValue={q}
        currentParams={statusParams}
        className="bg-white border border-sand mb-5"
      />

      {/* Events list */}
      <div className="card-base overflow-hidden">
        {enrichedEvents.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            {q || statusFilter ? (
              <>
                <p className="text-sm font-semibold mb-1">Geen resultaten gevonden</p>
                <p className="text-xs text-ink-muted/70">Probeer een andere zoekterm of filter</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold mb-1">Nog geen evenementen</p>
                <Link href="/dashboard/events/new" className="text-terra-500 text-sm font-semibold hover:underline">
                  Maak je eerste event →
                </Link>
              </>
            )}
          </div>
        ) : (
          enrichedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
