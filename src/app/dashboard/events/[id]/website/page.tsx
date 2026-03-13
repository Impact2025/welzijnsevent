"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Globe, Copy, Check, ExternalLink, Plus, Trash2 } from "lucide-react";
import { EventTabs } from "@/components/events/event-tabs";
import { AiGenButton } from "@/components/ui/ai-gen-button";

type Event = {
  id: string;
  title: string;
  slug: string | null;
  isPublic: boolean;
  tagline: string | null;
  websiteColor: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
};

type TicketType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  maxQuantity: number | null;
  soldCount: number | null;
  isActive: boolean;
  sortOrder: number;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export default function WebsiteTab() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    isPublic: false,
    tagline: "",
    websiteColor: "#C8522A",
    surveyEnabled: false,
  });
  const [newTicket, setNewTicket] = useState({
    name: "",
    description: "",
    price: "",
    maxQuantity: "",
  });
  const [addingTicket, setAddingTicket] = useState(false);

  const loadData = useCallback(async () => {
    const [evRes, ttRes] = await Promise.all([
      fetch(`/api/events/${params.id}`),
      fetch(`/api/ticket-types?eventId=${params.id}`),
    ]);
    const evData = await evRes.json();
    const ev: Event = evData.event ?? evData;
    const tt: TicketType[] = ttRes.ok ? await ttRes.json() : [];
    setEvent(ev);
    setTickets(tt);
    setForm({
      slug: ev.slug ?? slugify(ev.title),
      isPublic: ev.isPublic ?? false,
      tagline: ev.tagline ?? "",
      websiteColor: ev.websiteColor ?? "#C8522A",
      surveyEnabled: (ev as { surveyEnabled?: boolean }).surveyEnabled ?? false,
    });
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/events/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    loadData();
  }

  async function addTicket(e: React.FormEvent) {
    e.preventDefault();
    setAddingTicket(true);
    await fetch("/api/ticket-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: params.id,
        name: newTicket.name,
        description: newTicket.description || null,
        price: Math.round(parseFloat(newTicket.price || "0") * 100),
        maxQuantity: newTicket.maxQuantity ? parseInt(newTicket.maxQuantity) : null,
      }),
    });
    setNewTicket({ name: "", description: "", price: "", maxQuantity: "" });
    setAddingTicket(false);
    loadData();
  }

  async function deleteTicket(id: string) {
    await fetch(`/api/ticket-types/${id}`, { method: "DELETE" });
    loadData();
  }

  function copyLink() {
    const url = `${window.location.origin}/e/${form.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const publicUrl = form.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/e/${form.slug}` : null;

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center text-ink-muted text-sm">
        Laden...
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-4xl md:mx-auto bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="relative bg-terra-500 pt-10 pb-6 px-4 text-white">
        <Link href={`/dashboard/events/${params.id}`} className="flex items-center gap-1 text-white/80 text-sm mb-4 hover:text-white">
          <ArrowLeft size={16} />
          Terug
        </Link>
        <h1 className="text-xl font-bold">{event?.title}</h1>
        <p className="text-white/70 text-xs mt-1">Publieke website</p>
      </div>

      <EventTabs eventId={params.id} />

      <div className="px-4 pt-5 space-y-6">
        {/* Public URL preview */}
        {form.isPublic && form.slug && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={14} className="text-green-600" />
              <span className="text-xs font-semibold text-green-700">Website is live</span>
            </div>
            <p className="text-xs text-green-800 font-mono break-all mb-3">
              /e/{form.slug}
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Gekopieerd!" : "Kopieer link"}
              </button>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50"
                >
                  <ExternalLink size={12} />
                  Preview
                </a>
              )}
            </div>
          </div>
        )}

        {/* Settings form */}
        <form onSubmit={saveSettings} className="space-y-4">
          <h2 className="text-sm font-bold text-ink">Website-instellingen</h2>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">URL-slug</label>
            <div className="flex items-center gap-0 border border-sand rounded-xl overflow-hidden bg-white">
              <span className="px-3 py-2.5 text-xs text-ink-muted bg-sand/60 border-r border-sand whitespace-nowrap">/e/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                className="flex-1 px-3 py-2.5 text-sm text-ink focus:outline-none"
                placeholder="mijn-event-2026"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ink-muted">Tagline (korte slogan)</label>
              <AiGenButton
                type="tagline"
                context={{ title: event?.title ?? "" }}
                onResult={(text) => setForm(f => ({ ...f, tagline: text.split("\n")[0] }))}
                disabled={!event?.title}
              />
            </div>
            <input
              type="text"
              value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              className="w-full border border-sand rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terra-500/30"
              placeholder="Verbinden. Inspireren. Groeien."
            />
          </div>

          {/* Brand color */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Merkkeur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.websiteColor}
                onChange={e => setForm(f => ({ ...f, websiteColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-sand cursor-pointer"
              />
              <span className="text-sm text-ink font-mono">{form.websiteColor}</span>
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between bg-sand/40 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Publiek zichtbaar</p>
              <p className="text-xs text-ink-muted">Website toegankelijk zonder inloggen</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublic ? "bg-terra-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublic ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Survey toggle */}
          <div className="flex items-center justify-between bg-sand/40 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Tevredenheidsonderzoek</p>
              <p className="text-xs text-ink-muted">Na het event: enquête via /e/{form.slug}/survey</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, surveyEnabled: !f.surveyEnabled }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.surveyEnabled ? "bg-terra-500" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.surveyEnabled ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-terra-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-terra-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Opslaan..." : "Instellingen opslaan"}
          </button>
        </form>

        {/* Ticket types */}
        <div>
          <h2 className="text-sm font-bold text-ink mb-3">Tickettypes</h2>

          {tickets.length === 0 && (
            <p className="text-xs text-ink-muted py-3">Nog geen tickettypes. Voeg er een toe hieronder.</p>
          )}

          <div className="space-y-2 mb-4">
            {tickets.map(tt => (
              <div key={tt.id} className="flex items-center justify-between bg-sand/40 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{tt.name}</p>
                  <p className="text-xs text-ink-muted">
                    {tt.price === 0 ? "Gratis" : `€${(tt.price / 100).toFixed(2)}`}
                    {tt.maxQuantity ? ` · max ${tt.maxQuantity}` : ""}
                    {tt.soldCount ? ` · ${tt.soldCount} verkocht` : ""}
                  </p>
                </div>
                <button
                  onClick={() => deleteTicket(tt.id)}
                  className="text-ink-muted hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add ticket form */}
          <form onSubmit={addTicket} className="border border-sand rounded-xl p-4 space-y-3 bg-white">
            <p className="text-xs font-semibold text-ink-muted">Nieuw tickettype</p>
            <input
              required
              type="text"
              value={newTicket.name}
              onChange={e => setNewTicket(n => ({ ...n, name: e.target.value }))}
              placeholder="Naam (bijv. Standaard)"
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
            />
            <input
              type="text"
              value={newTicket.description}
              onChange={e => setNewTicket(n => ({ ...n, description: e.target.value }))}
              placeholder="Beschrijving (optioneel)"
              className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTicket.price}
                  onChange={e => setNewTicket(n => ({ ...n, price: e.target.value }))}
                  placeholder="Prijs (€) — leeg = gratis"
                  className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  value={newTicket.maxQuantity}
                  onChange={e => setNewTicket(n => ({ ...n, maxQuantity: e.target.value }))}
                  placeholder="Max. aantal"
                  className="w-full border border-sand rounded-lg px-3 py-2 text-sm text-ink focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingTicket}
              className="flex items-center gap-2 text-xs font-semibold text-terra-500 hover:text-terra-600 disabled:opacity-60"
            >
              <Plus size={14} />
              {addingTicket ? "Toevoegen..." : "Tickettype toevoegen"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
