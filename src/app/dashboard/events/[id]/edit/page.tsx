"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Clock, Globe, Link2 } from "lucide-react";
import Link from "next/link";
import { AiGenButton } from "@/components/ui/ai-gen-button";
import { ImageUpload } from "@/components/ui/image-upload";

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [form, setForm] = useState({
    title:       "",
    tagline:     "",
    description: "",
    location:    "",
    startsAt:    "",
    endsAt:      "",
    maxAttendees: "",
    isPublic:    true,
    coverImage:  "",
  });

  const slugPreview =
    form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "jouw-evenement";

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const loadEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${params.id}`);
    const data = await res.json();
    const ev = data.event ?? data;
    setForm({
      title:        ev.title ?? "",
      tagline:      ev.tagline ?? "",
      description:  ev.description ?? "",
      location:     ev.location ?? "",
      startsAt:     ev.startsAt ? toLocalDatetime(ev.startsAt) : "",
      endsAt:       ev.endsAt   ? toLocalDatetime(ev.endsAt)   : "",
      maxAttendees: ev.maxAttendees != null ? String(ev.maxAttendees) : "",
      isPublic:     ev.isPublic ?? false,
      coverImage:   ev.coverImage ?? "",
    });
    setFetching(false);
  }, [params.id]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const handleSubmit = async () => {
    if (!form.title || !form.startsAt || !form.endsAt) {
      setError("Vul naam, startdatum en einddatum in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:       form.title,
          tagline:     form.tagline || null,
          description: form.description || null,
          location:    form.location || null,
          startsAt:    new Date(form.startsAt).toISOString(),
          endsAt:      new Date(form.endsAt).toISOString(),
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
          isPublic:    form.isPublic,
          coverImage:  form.coverImage || null,
        }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      router.push(`/dashboard/events/${params.id}`);
    } catch {
      setError("Opslaan mislukt. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-ink-muted text-sm">Laden…</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/dashboard/events/${params.id}`} className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">Evenement bewerken</h1>
          <p className="text-ink-muted text-sm">Wijzig de basisgegevens</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Cover image */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Omslagfoto
          </label>
          <ImageUpload
            value={form.coverImage}
            onChange={url => setForm(f => ({ ...f, coverImage: url }))}
            aspectRatio="wide"
            placeholder="Sleep een omslagfoto of klik om te uploaden"
          />
        </div>

        {/* Title */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Naam evenement *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            className="w-full text-ink text-base outline-none placeholder-ink-muted/50 bg-transparent"
            autoFocus
          />
        </div>

        {/* Tagline */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tagline</label>
            <AiGenButton
              type="tagline"
              context={{ title: form.title }}
              onResult={text => setForm(f => ({ ...f, tagline: text.split("\n")[0] }))}
              disabled={!form.title}
            />
          </div>
          <input
            type="text"
            placeholder="bijv. Samen bouwen aan een betere wijk"
            value={form.tagline}
            onChange={set("tagline")}
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Description */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">Beschrijving</label>
            <AiGenButton
              type="description"
              context={{ title: form.title }}
              onResult={text => setForm(f => ({ ...f, description: text }))}
              disabled={!form.title}
            />
          </div>
          <textarea
            placeholder="Waar gaat het evenement over?"
            value={form.description}
            onChange={set("description")}
            rows={4}
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
              <input type="datetime-local" value={form.startsAt} onChange={set("startsAt")}
                className="w-full text-ink text-sm outline-none bg-sand rounded-lg px-3 py-2" />
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1.5">Einde</p>
              <input type="datetime-local" value={form.endsAt} onChange={set("endsAt")}
                className="w-full text-ink text-sm outline-none bg-sand rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>

        {/* Max attendees */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5"><Users size={12} /> Max. deelnemers</span>
          </label>
          <input type="number" placeholder="bijv. 250" value={form.maxAttendees} onChange={set("maxAttendees")}
            min="1" className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent" />
        </div>

        {/* Public */}
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
                /e/<span className="font-bold text-terra-600">{slugPreview}</span>
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
          {loading ? "Opslaan…" : "Wijzigingen opslaan"}
        </button>
      </div>
    </div>
  );
}
