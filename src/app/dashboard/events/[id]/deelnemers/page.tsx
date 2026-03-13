import { db, attendees, events, waitlist } from "@/db";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import { SlidersHorizontal, UserPlus, FileUp, ScanLine, Tag } from "lucide-react";
import { SearchInput } from "@/components/events/search-input";
import { FilterTabs } from "@/components/events/filter-tabs";
import { Pagination } from "@/components/ui/pagination";
import { WaitlistTab } from "@/components/attendees/waitlist-tab";
import { ExportButton } from "@/components/attendees/export-button";
import { EventTabs } from "@/components/events/event-tabs";
import type { Attendee, WaitlistEntry } from "@/db/schema";

const PAGE_SIZE = 25;

const STATUS_TABS = [
  { label: "Alle",       value: "" },
  { label: "Ingecheckt", value: "ingecheckt" },
  { label: "Aangemeld",  value: "aangemeld" },
  { label: "Afwezig",    value: "afwezig" },
];

function AttendeeItem({ attendee, eventId }: { attendee: Attendee; eventId: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    ingecheckt: { label: "INGECHECKT", className: "badge-ingecheckt" },
    aangemeld:  { label: "AANGEMELD",  className: "badge-aangemeld"  },
    afwezig:    { label: "AFWEZIG",    className: "badge-afwezig"    },
  };
  const statusInfo = statusConfig[attendee.status ?? "aangemeld"] ?? statusConfig.aangemeld;

  return (
    <Link
      href={`/dashboard/events/${eventId}/deelnemers/${attendee.id}`}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sand transition-colors border-b border-sand/60 last:border-0 text-left"
    >
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", avatarColor(attendee.name))}>
        <span className="text-white text-xs font-bold">{getInitials(attendee.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{attendee.name}</p>
        <p className="text-xs text-ink-muted truncate">
          {attendee.organization}
          {attendee.registeredAt && <> · {formatRelative(attendee.registeredAt)}</>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={statusInfo.className}>{statusInfo.label}</span>
        <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { q?: string; status?: string; page?: string; tab?: string };
}) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const allAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, params.id));

  const waitlistEntries = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.eventId, params.id))
    .orderBy(waitlist.position);

  const activeTab = searchParams.tab ?? "deelnemers";
  const q = searchParams.q ?? "";
  const statusFilter = searchParams.status ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));

  let list = allAttendees;
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter(
      a =>
        a.name.toLowerCase().includes(lower) ||
        a.email.toLowerCase().includes(lower) ||
        a.organization?.toLowerCase().includes(lower)
    );
  }
  if (statusFilter) {
    list = list.filter(a => a.status === statusFilter);
  }

  const checked = allAttendees.filter(a => a.status === "ingecheckt").length;
  const total   = allAttendees.length;
  const waitingCount = waitlistEntries.filter(w => w.status === "waiting").length;

  const tabsWithCounts = STATUS_TABS.map(t => ({
    ...t,
    count: t.value
      ? allAttendees.filter(a => a.status === t.value).length
      : total,
  }));

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paginated = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (statusFilter) baseParams.set("status", statusFilter);
  const statusParams = statusFilter ? `status=${statusFilter}` : "";
  const paginationBase = `/dashboard/events/${params.id}/deelnemers${baseParams.toString() ? `?${baseParams.toString()}` : ""}`;

  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link href={`/dashboard/events/${params.id}`} className="text-white/70 text-sm mb-3 inline-block">
          ← {event.title}
        </Link>
        <h1 className="text-lg font-bold">Deelnemersbeheer</h1>
        <p className="text-white/70 text-xs">{event.location}</p>
        <div className="flex gap-4 mt-3 text-xs text-white/80">
          <span><strong className="text-white">{checked}</strong> ingecheckt</span>
          <span><strong className="text-white">{total - checked}</strong> aangemeld</span>
          <span><strong className="text-white">{total}</strong> totaal</span>
          {waitingCount > 0 && (
            <span><strong className="text-white">{waitingCount}</strong> wachtlijst</span>
          )}
        </div>
      </div>

      <EventTabs eventId={params.id} />

      {/* Deelnemers / Wachtlijst sub-tabs */}
      <div className="flex gap-4 px-4 border-b border-sand/50">
        <Link
          href={`/dashboard/events/${params.id}/deelnemers`}
          className={`py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "deelnemers" ? "text-ink border-ink" : "text-ink-muted border-transparent hover:text-ink"
          }`}
        >
          Lijst
        </Link>
        <Link
          href={`/dashboard/events/${params.id}/deelnemers?tab=wachtlijst`}
          className={`py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "wachtlijst" ? "text-ink border-ink" : "text-ink-muted border-transparent hover:text-ink"
          }`}
        >
          Wachtlijst{waitingCount > 0 ? ` (${waitingCount})` : ""}
        </Link>
      </div>

      {activeTab === "wachtlijst" ? (
        /* Wachtlijst tab */
        <WaitlistTab entries={waitlistEntries} eventId={params.id} />
      ) : (
        /* Deelnemers tab */
        <>
          {/* Search */}
          <div className="px-4 py-3 border-b border-sand">
            <SearchInput
              placeholder="Zoek deelnemers..."
              defaultValue={q}
              currentParams={statusParams}
              className="bg-sand"
            />
          </div>

          {/* Status filter */}
          <div className="px-4 py-2 border-b border-sand">
            <FilterTabs tabs={tabsWithCounts} currentValue={statusFilter} currentQ={q} />
          </div>

          {/* List header */}
          <div className="border-b border-sand px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs font-bold text-ink">
              {q || statusFilter ? `${list.length} gevonden` : `Lijst (${total} deelnemers)`}
            </p>
            <div className="flex items-center gap-2">
              <ExportButton eventId={params.id} />
              <SlidersHorizontal size={14} className="text-ink-muted" />
            </div>
          </div>

          {/* List */}
          <div className="pb-24">
            {list.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <p className="text-sm">
                  {q || statusFilter ? "Geen deelnemers gevonden" : "Nog geen deelnemers"}
                </p>
              </div>
            ) : (
              <>
                {paginated.map(a => <AttendeeItem key={a.id} attendee={a} eventId={params.id} />)}
                <Pagination page={page} totalPages={totalPages} baseHref={paginationBase} />
              </>
            )}
          </div>
        </>
      )}

      {/* FABs — scan + import + new */}
      {activeTab !== "wachtlijst" && (
        <div className="fixed bottom-20 right-4 flex flex-col gap-2 items-end">
          <Link
            href={`/dashboard/events/${params.id}/scan`}
            className="flex items-center gap-2 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg px-4 py-2 hover:bg-green-600 transition-colors"
          >
            <ScanLine size={14} />
            Scanner
          </Link>
          <Link
            href={`/dashboard/events/${params.id}/badges`}
            className="flex items-center gap-2 bg-white border border-sand text-ink-muted text-xs font-semibold rounded-full shadow px-4 py-2 hover:bg-sand transition-colors"
          >
            <Tag size={14} />
            Naamplaatjes
          </Link>
          <Link
            href={`/dashboard/events/${params.id}/deelnemers/import`}
            className="flex items-center gap-2 bg-white border border-sand text-ink-muted text-xs font-semibold rounded-full shadow px-4 py-2 hover:bg-sand transition-colors"
          >
            <FileUp size={14} />
            Importeren
          </Link>
          <Link
            href={`/dashboard/events/${params.id}/deelnemers/new`}
            className="w-12 h-12 bg-terra-500 rounded-full shadow-lg flex items-center justify-center hover:bg-terra-600 transition-colors"
          >
            <UserPlus size={20} className="text-white" />
          </Link>
        </div>
      )}

    </div>
  );
}
