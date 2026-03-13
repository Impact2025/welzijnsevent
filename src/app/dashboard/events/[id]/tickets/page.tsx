import { db, events, ticketTypes, orders } from "@/db";
import { eq, sum, count, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Euro, ShoppingBag, CheckCircle2, XCircle, Clock, Ticket } from "lucide-react";
import { TicketTypesManager } from "@/components/events/ticket-types-manager";
import { EventTabs } from "@/components/events/event-tabs";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  paid:      { label: "Betaald",    color: "text-green-600 bg-green-50" },
  pending:   { label: "In behandeling", color: "text-amber-600 bg-amber-50" },
  cancelled: { label: "Geannuleerd", color: "text-gray-400 bg-gray-50" },
  failed:    { label: "Mislukt",    color: "text-red-500 bg-red-50" },
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  paid:      <CheckCircle2 size={12} />,
  pending:   <Clock size={12} />,
  cancelled: <XCircle size={12} />,
  failed:    <XCircle size={12} />,
};

export default async function TicketsPage({ params }: { params: { id: string } }) {
  const [event] = await db.select().from(events).where(eq(events.id, params.id));
  if (!event) notFound();

  const eventTicketTypes = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, params.id));

  const recentOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.eventId, params.id))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  // Revenue totals
  const paidOrders  = recentOrders.filter(o => o.status === "paid");
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
  const totalTicketsSold = paidOrders.length;


  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link href={`/dashboard/events/${params.id}`} className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white">
          <ArrowLeft size={16} />
          Terug
        </Link>
        <h1 className="text-lg font-bold">{event.title}</h1>
        <p className="text-white/70 text-xs">Ticketbeheer &amp; bestellingen</p>
      </div>

      <EventTabs eventId={params.id} />

      <div className="p-4 space-y-5">

        {/* Revenue summary */}
        {totalTicketsSold > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-terra-50 border border-terra-200 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Euro size={13} className="text-terra-500" />
                <p className="text-[10px] font-bold text-terra-600/70 uppercase tracking-wider">Omzet</p>
              </div>
              <p className="text-2xl font-extrabold text-terra-700">
                €{(totalRevenue / 100).toFixed(2)}
              </p>
              <p className="text-[11px] text-terra-600/60 mt-0.5">uit betaalde bestellingen</p>
            </div>
            <div className="rounded-2xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Ticket size={13} className="text-green-600" />
                <p className="text-[10px] font-bold text-green-600/70 uppercase tracking-wider">Verkocht</p>
              </div>
              <p className="text-2xl font-extrabold text-green-700">{totalTicketsSold}</p>
              <p className="text-[11px] text-green-600/60 mt-0.5">tickets afgerond</p>
            </div>
          </div>
        )}

        {/* Ticket types management */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Ticket size={13} className="text-ink-muted" />
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Tickettypes</p>
          </div>
          <TicketTypesManager eventId={params.id} ticketTypes={eventTicketTypes} />
        </div>

        {/* Orders list */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <ShoppingBag size={13} className="text-ink-muted" />
            <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
              Bestellingen ({recentOrders.length})
            </p>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingBag size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink-muted">Nog geen bestellingen</p>
              <p className="text-xs text-ink-muted/60 mt-0.5">Bestellingen verschijnen hier zodra deelnemers tickets kopen</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-sand overflow-hidden">
              {recentOrders.map(order => {
                const st = STATUS_LABEL[order.status ?? ""] ?? { label: order.status ?? "?", color: "text-gray-400 bg-gray-50" };
                const icon = STATUS_ICON[order.status ?? ""];
                return (
                  <div key={order.id} className="flex items-center gap-3 px-4 py-3 border-b border-sand last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{order.customerName}</p>
                      <p className="text-[11px] text-ink-muted truncate">{order.customerEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink">
                        {order.amount === 0 ? "Gratis" : `€${(order.amount / 100).toFixed(2)}`}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${st.color}`}>
                        {icon}
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
