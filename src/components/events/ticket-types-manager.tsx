"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Euro, Users, ToggleLeft, ToggleRight, X, Ticket } from "lucide-react";

interface TicketType {
  id:          string;
  name:        string;
  description: string | null;
  price:       number;
  currency:    string | null;
  maxQuantity: number | null;
  soldCount:   number | null;
  isActive:    boolean | null;
}

interface Props {
  eventId:     string;
  ticketTypes: TicketType[];
}

const EMPTY = {
  name:        "",
  description: "",
  price:       "0",
  maxQuantity: "",
};

export function TicketTypesManager({ eventId, ticketTypes: initial }: Props) {
  const [list,    setList]    = useState<TicketType[]>(initial);
  const [open,    setOpen]    = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error,   setError]   = useState("");
  const router = useRouter();

  const set = (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Naam is verplicht"); return; }
    setError(""); setSaving(true);
    try {
      const priceCents = Math.round(parseFloat(form.price || "0") * 100);
      const res = await fetch("/api/ticket-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          name:        form.name,
          description: form.description || null,
          price:       priceCents,
          maxQuantity: form.maxQuantity ? parseInt(form.maxQuantity) : null,
        }),
      });
      if (!res.ok) throw new Error();
      const ticket = await res.json();
      setList(l => [...l, ticket]);
      setForm(EMPTY);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/ticket-types/${id}`, { method: "DELETE" });
      setList(l => l.filter(t => t.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function toggleActive(ticket: TicketType) {
    const updated = await fetch(`/api/ticket-types/${ticket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !ticket.isActive }),
    }).then(r => r.json());
    setList(l => l.map(t => t.id === ticket.id ? updated : t));
  }

  function formatPrice(cents: number) {
    return cents === 0 ? "Gratis" : `€${(cents / 100).toFixed(2)}`;
  }

  return (
    <div className="space-y-3">

      {list.length === 0 && !open ? (
        <div className="py-10 text-center">
          <Ticket size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-semibold text-ink-muted">Nog geen tickettypes</p>
          <p className="text-xs text-ink-muted/60 mt-0.5">
            Voeg een gratis of betaald tickettype toe
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(ticket => {
            const sold  = ticket.soldCount ?? 0;
            const max   = ticket.maxQuantity;
            const fillPct = max ? Math.min(100, Math.round((sold / max) * 100)) : null;
            const active = ticket.isActive ?? true;

            return (
              <div
                key={ticket.id}
                className={`rounded-2xl border p-4 transition-opacity ${!active ? "opacity-50" : ""} ${
                  ticket.price > 0 ? "border-terra-200 bg-terra-50/30" : "border-sand bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-ink">{ticket.name}</p>
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                        ticket.price === 0
                          ? "bg-green-100 text-green-700"
                          : "bg-terra-100 text-terra-700"
                      }`}>
                        {formatPrice(ticket.price)}
                      </span>
                      {!active && (
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                          Inactief
                        </span>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{ticket.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(ticket)}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-sand transition-colors"
                      title={active ? "Deactiveer" : "Activeer"}
                    >
                      {active ? <ToggleRight size={18} className="text-terra-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      disabled={deleting === ticket.id || sold > 0}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                      title={sold > 0 ? "Niet verwijderbaar (er zijn al betalingen)" : "Verwijder"}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Capacity + sales */}
                <div className="flex items-center gap-4 mt-2.5 text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {sold} verkocht
                    {max ? ` / ${max}` : ""}
                  </span>
                  {ticket.price > 0 && (
                    <span className="flex items-center gap-1">
                      <Euro size={10} />
                      {formatPrice(sold * ticket.price)} omzet
                    </span>
                  )}
                </div>
                {fillPct !== null && (
                  <div className="mt-1.5 h-1.5 bg-sand rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-terra-400 transition-all"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add form */}
      {open ? (
        <div className="rounded-2xl border-2 border-terra-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-terra-50 border-b border-terra-100">
            <p className="text-sm font-bold text-terra-700">Nieuw tickettype</p>
            <button onClick={() => { setOpen(false); setForm(EMPTY); setError(""); }}>
              <X size={16} className="text-terra-400 hover:text-terra-600" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="p-4 space-y-3">
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

            <div>
              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Naam *</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="bijv. Standaard ticket · VIP · Vroegboeker"
                className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">Omschrijving</label>
              <input
                type="text"
                value={form.description}
                onChange={set("description")}
                placeholder="optioneel"
                className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1"><Euro size={10} /> Prijs (€)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  placeholder="0.00"
                  className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400"
                />
                <p className="text-[10px] text-ink-muted/60 mt-0.5">0 = gratis</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1"><Users size={10} /> Max. tickets</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.maxQuantity}
                  onChange={set("maxQuantity")}
                  placeholder="onbeperkt"
                  className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setForm(EMPTY); setError(""); }}
                className="flex-1 py-2.5 rounded-xl border border-sand text-sm font-semibold text-ink-muted hover:bg-sand transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-40 text-white text-sm font-bold transition-colors"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm font-bold text-terra-500 hover:text-terra-600 border-2 border-dashed border-terra-200 hover:border-terra-400 rounded-2xl px-4 py-3 w-full transition-all"
        >
          <Plus size={15} />
          Tickettype toevoegen
        </button>
      )}
    </div>
  );
}
