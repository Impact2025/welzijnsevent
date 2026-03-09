import { db, attendees, events } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getInitials, avatarColor, formatRelative, cn } from "@/lib/utils";
import { SlidersHorizontal, UserPlus } from "lucide-react";
import { SearchInput } from "@/components/events/search-input";
import { FilterTabs } from "@/components/events/filter-tabs";
import { Pagination } from "@/components/ui/pagination";
import type { Attendee } from "@/db/schema";

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
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const allAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.eventId, params.id));

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
    <div className="max-w-md mx-auto bg-white min-h-screen">
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
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-sand px-4">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { label: "Programma",    href: `/dashboard/events/${params.id}` },
            { label: "Deelnemers",   href: `/dashboard/events/${params.id}/deelnemers`, active: true },
            { label: "Netwerk",      href: `/dashboard/events/${params.id}/netwerk` },
            { label: "Statistieken", href: `/dashboard/events/${params.id}/analytics` },
          ].map(tab => (
            <Link key={tab.href} href={tab.href}
              className={`py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab.active ? "text-terra-500 border-terra-500" : "text-ink-muted border-transparent hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

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
        <SlidersHorizontal size={14} className="text-ink-muted" />
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

      {/* FAB — link to new attendee page */}
      <Link
        href={`/dashboard/events/${params.id}/deelnemers/new`}
        className="fixed bottom-20 right-4 w-12 h-12 bg-terra-500 rounded-full shadow-lg flex items-center justify-center hover:bg-terra-600 transition-colors"
      >
        <UserPlus size={20} className="text-white" />
      </Link>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around pt-2 pb-safe-nav">
        {[
          { label: "Dashboard",    icon: "📊", href: "/dashboard" },
          { label: "Events",       icon: "📅", href: "/dashboard/events" },
          { label: "Deelnemers",   icon: "👥", href: "#", active: true },
          { label: "Instellingen", icon: "⚙️", href: "/dashboard/instellingen" },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 ${item.active ? "text-terra-500" : "text-ink-muted"}`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
