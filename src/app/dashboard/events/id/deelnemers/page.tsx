import { db, attendees, events } from "@/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AttendeeRow } from "@/components/attendees/attendee-row";
import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function AttendeesPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const list = await db.select().from(attendees).where(eq(attendees.eventId, params.id));

  const checked  = list.filter(a => a.status === "ingecheckt").length;
  const total    = list.length;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link href={`/dashboard/events/${params.id}`} className="text-white/70 text-sm mb-3 inline-block">← {event.title}</Link>
        <h1 className="text-lg font-bold">Deelnemersbeheer</h1>
        <p className="text-white/70 text-xs">{event.location}</p>
        <div className="flex gap-4 mt-3 text-xs text-white/80">
          <span><strong className="text-white">{checked}</strong> ingecheckt</span>
          <span><strong className="text-white">{total - checked}</strong> aangemeld</span>
          <span><strong className="text-white">{total}</strong> totaal</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-sand">
        <div className="flex items-center gap-2 bg-sand rounded-xl px-3 py-2.5">
          <Search size={15} className="text-ink-muted shrink-0" />
          <input
            type="text"
            placeholder="Zoek deelnemers..."
            className="bg-transparent flex-1 text-sm outline-none text-ink placeholder-ink-muted"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-2 border-b border-sand overflow-x-auto">
        {["Status", "Rol", "Organisatie"].map(f => (
          <button key={f} className="flex items-center gap-1 text-xs font-semibold text-ink-muted border border-sand rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-sand transition-colors">
            {f}
            <span className="text-[10px]">▾</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="border-b border-sand px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs font-bold text-ink">Lijst ({total} deelnemers)</p>
        <SlidersHorizontal size={14} className="text-ink-muted" />
      </div>

      <div className="pb-24">
        {list.map(a => (
          <AttendeeRow key={a.id} attendee={a} />
        ))}
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 w-12 h-12 bg-terra-500 rounded-full shadow-lg flex items-center justify-center hover:bg-terra-600 transition-colors">
        <UserPlus size={20} className="text-white" />
      </button>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-sand flex justify-around py-2">
        {[
          { label: "Dashboard", icon: "📊", href: "/dashboard" },
          { label: "Events",    icon: "📅", href: "/dashboard/events" },
          { label: "Deelnemers",icon: "👥", href: "#", active: true },
          { label: "Instellingen",icon: "⚙️", href: "/dashboard/instellingen" },
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
