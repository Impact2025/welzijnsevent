"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Clock, MapPin, User, AlignLeft, Video } from "lucide-react";
import { AiGenButton } from "@/components/ui/ai-gen-button";

export function AddSessionForm({
  eventId,
  eventStartsAt,
}: {
  eventId:      string;
  eventStartsAt: string;
}) {
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const router = useRouter();

  // Standaard: start op het begintijdstip van het evenement
  const defaultStart = eventStartsAt
    ? new Date(eventStartsAt).toISOString().slice(0, 16)
    : "";
  const defaultEnd = eventStartsAt
    ? new Date(new Date(eventStartsAt).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16)
    : "";

  const [form, setForm] = useState({
    title:       "",
    description: "",
    speaker:     "",
    speakerOrg:  "",
    location:    "",
    streamUrl:   "",
    startsAt:    defaultStart,
    endsAt:      defaultEnd,
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startsAt || !form.endsAt) {
      setError("Vul naam, start- en eindtijd in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          streamUrl: form.streamUrl || null,
          startsAt:  form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          endsAt:    form.endsAt   ? new Date(form.endsAt).toISOString()   : undefined,
          eventId,
        }),
      });
      if (!res.ok) throw new Error();
      setForm({ title: "", description: "", speaker: "", speakerOrg: "", location: "", streamUrl: "", startsAt: defaultStart, endsAt: defaultEnd });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Opslaan mislukt. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-terra-500 hover:text-terra-600 border-2 border-dashed border-terra-200 hover:border-terra-400 rounded-2xl px-4 py-3 w-full transition-all"
      >
        <Plus size={15} />
        Sessie toevoegen
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-terra-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-terra-50 border-b border-terra-100">
        <p className="text-sm font-bold text-terra-700">Nieuwe sessie</p>
        <button onClick={() => setOpen(false)} className="text-terra-400 hover:text-terra-600">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={submit} className="p-4 space-y-3">
        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Naam */}
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            Naam sessie *
          </label>
          <input
            type="text"
            placeholder="bijv. Opening: De Kracht van Samen"
            value={form.title}
            onChange={set("title")}
            className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors"
          />
        </div>

        {/* Beschrijving */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              <span className="flex items-center gap-1"><AlignLeft size={10} /> Beschrijving</span>
            </label>
            <AiGenButton
              type="session"
              context={{ title: form.title, speaker: form.speaker }}
              onResult={(text) => setForm((f) => ({ ...f, description: text }))}
              disabled={!form.title}
            />
          </div>
          <textarea
            placeholder="Korte omschrijving van de sessie..."
            value={form.description}
            onChange={set("description")}
            rows={2}
            className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors resize-none"
          />
        </div>

        {/* Tijden */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1"><Clock size={10} /> Start *</span>
            </label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={set("startsAt")}
              className="w-full text-xs border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 bg-cream transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1"><Clock size={10} /> Einde *</span>
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={set("endsAt")}
              className="w-full text-xs border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 bg-cream transition-colors"
            />
          </div>
        </div>

        {/* Spreker */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1"><User size={10} /> Spreker</span>
            </label>
            <input
              type="text"
              placeholder="bijv. Annet de Wildt"
              value={form.speaker}
              onChange={set("speaker")}
              className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
              Organisatie
            </label>
            <input
              type="text"
              placeholder="bijv. Humanitas"
              value={form.speakerOrg}
              onChange={set("speakerOrg")}
              className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors"
            />
          </div>
        </div>

        {/* Locatie */}
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1"><MapPin size={10} /> Zaal / Locatie</span>
          </label>
          <input
            type="text"
            placeholder="bijv. Grote Zaal"
            value={form.location}
            onChange={set("location")}
            className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors"
          />
        </div>

        {/* Stream URL */}
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1"><Video size={10} /> Stream URL (hybride)</span>
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/live/... of Teams-link"
            value={form.streamUrl}
            onChange={set("streamUrl")}
            className="w-full text-sm border border-sand rounded-xl px-3 py-2.5 outline-none focus:border-terra-400 transition-colors"
          />
          <p className="text-[10px] text-ink-muted/60 mt-1">Optioneel: deelnemers online kunnen meekijken tijdens de sessie</p>
        </div>

        {/* Knoppen */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-2.5 rounded-xl border border-sand text-sm font-semibold text-ink-muted hover:bg-sand transition-colors"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading || !form.title || !form.startsAt || !form.endsAt}
            className="flex-1 py-2.5 rounded-xl bg-terra-500 hover:bg-terra-600 disabled:opacity-40 text-white text-sm font-bold transition-colors"
          >
            {loading ? "Opslaan..." : "Sessie opslaan"}
          </button>
        </div>
      </form>
    </div>
  );
}
