"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Clock, Globe, Link2 } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({
    title:        "",
    description:  "",
    location:     "",
    startsAt:     "",
    endsAt:       "",
    maxAttendees: "",
    tagline:      "",
    isPublic:     false,
  });

  // Auto-genereer slug preview vanuit titel
  const slugPreview = form.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "jouw-evenement";

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title || !form.startsAt || !form.endsAt) {
      setError("Vul naam, startdatum en einddatum in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
          isPublic: form.isPublic,
        }),
      });
      const data = await res.json();
      if (data.event?.id) {
        router.push(`/dashboard/events/${data.event.id}`);
      } else {
        setError("Aanmaken mislukt. Probeer opnieuw.");
      }
    } catch {
      setError("Er is een fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/events" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">Nieuw evenement</h1>
          <p className="text-ink-muted text-sm">Vul de details in voor je evenement</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Naam evenement *
          </label>
          <input
            type="text"
            placeholder="bijv. Vrijwilligersdag 2024"
            value={form.title}
            onChange={set("title")}
            className="w-full text-ink text-base outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Description */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Beschrijving
          </label>
          <textarea
            placeholder="Waar gaat het evenement over?"
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent resize-none"
          />
        </div>

        {/* Location */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5"><MapPin size={12} /> Locatie</span>
          </label>
          <input
            type="text"
            placeholder="bijv. De Jaarbeurs, Utrecht"
            value={form.location}
            onChange={set("location")}
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Date & Time */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5"><Clock size={12} /> Datum &amp; Tijd *</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-ink-muted mb-1.5">Start</p>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={set("startsAt")}
                className="w-full text-ink text-sm outline-none bg-sand rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1.5">Einde</p>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={set("endsAt")}
                className="w-full text-ink text-sm outline-none bg-sand rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Max attendees */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5"><Users size={12} /> Max. deelnemers</span>
          </label>
          <input
            type="number"
            placeholder="bijv. 250"
            value={form.maxAttendees}
            onChange={set("maxAttendees")}
            min="1"
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Tagline */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Tagline (kort, voor de publieke pagina)
          </label>
          <input
            type="text"
            placeholder="bijv. Samen bouwen aan een betere wijk"
            value={form.tagline}
            onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Openbaar + URL */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider">
                <Globe size={12} />
                Publieke aanmeldpagina
              </label>
              <p className="text-xs text-ink-muted mt-1">Deelnemers kunnen zich aanmelden via een link</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublic ? "bg-terra-500" : "bg-sand"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${form.isPublic ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          {form.isPublic && (
            <div className="mt-3 flex items-center gap-2 bg-cream rounded-xl px-3 py-2 border border-sand">
              <Link2 size={12} className="text-ink-muted shrink-0" />
              <span className="text-xs text-ink-muted font-mono truncate">
                localhost:3000/e/<span className="font-bold text-terra-600">{slugPreview}</span>
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.startsAt || !form.endsAt}
          className="w-full bg-terra-500 hover:bg-terra-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
        >
          {loading ? "Aanmaken..." : "Evenement aanmaken"}
        </button>
      </div>
    </div>
  );
}
