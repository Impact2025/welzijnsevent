"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Clock, Globe, Link2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AiGenButton } from "@/components/ui/ai-gen-button";
import { ImageUpload } from "@/components/ui/image-upload";

type EventType = "klein" | "programma" | "netwerk" | "conferentie";

interface EventTypeConfig {
  id: EventType;
  label: string;
  examples: string;
  pitch: string;
  features: string[];
  accentColor: string;
  dotColor: string;
  maxAttendees: string;
}

const EVENT_TYPES: EventTypeConfig[] = [
  {
    id: "klein",
    label: "Kleine bijeenkomst",
    examples: "Buurtlunch · Vergadering · Workshop · Vrijwilligersavond",
    pitch: "Simpele inschrijving en QR check-in. Geen overbodige functies.",
    features: ["Inschrijvingen", "QR check-in", "Deelnemerslijst"],
    accentColor: "border-l-amber-400",
    dotColor: "bg-amber-400",
    maxAttendees: "50",
  },
  {
    id: "programma",
    label: "Evenement met programma",
    examples: "Kennisdag · Lezing · Training · Vrijwilligersdag",
    pitch: "Sessies, sprekers en live interactie voor je deelnemers.",
    features: ["Dagschema & sessies", "Sprekers", "Live Q&A & polls"],
    accentColor: "border-l-blue-400",
    dotColor: "bg-blue-400",
    maxAttendees: "150",
  },
  {
    id: "netwerk",
    label: "Netwerkevenement",
    examples: "Speed-networking · Community building · Koppelsessie",
    pitch: "Deelnemers ontmoeten elkaar via slimme AI-koppeling.",
    features: ["AI-koppeling", "Deelnemerprofielen", "Netwerkoverzicht"],
    accentColor: "border-l-green-500",
    dotColor: "bg-green-500",
    maxAttendees: "100",
  },
  {
    id: "conferentie",
    label: "Conferentie",
    examples: "Congres · Symposium · Groot evenement",
    pitch: "De volledige toolset: tickets, sponsors, website en meer.",
    features: ["Betaalde tickets", "Sponsoring", "Website builder", "+4 meer"],
    accentColor: "border-l-purple-400",
    dotColor: "bg-purple-400",
    maxAttendees: "500",
  },
];

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState<"type" | "form">("type");
  const [eventType, setEventType] = useState<EventType>("programma");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startsAt: "",
    endsAt: "",
    maxAttendees: "",
    tagline: "",
    isPublic: true,
    coverImage: "",
  });

  const slugPreview =
    form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "jouw-evenement";

  function selectType(type: EventType) {
    const config = EVENT_TYPES.find((t) => t.id === type)!;
    setEventType(type);
    setForm((f) => ({ ...f, maxAttendees: config.maxAttendees }));
    setStep("form");
  }

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

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
          eventType,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          endsAt:   form.endsAt   ? new Date(form.endsAt).toISOString()   : undefined,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
          coverImage: form.coverImage || undefined,
        }),
      });
      const data = await res.json();
      if (data.event?.id) {
        router.push(`/dashboard/events/${data.event.id}`);
      } else if (data.limitReached) {
        setError(data.error + " → Ga naar Instellingen om te upgraden.");
      } else {
        setError("Aanmaken mislukt. Probeer opnieuw.");
      }
    } catch {
      setError("Er is een fout opgetreden.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 1: Type selectie ─────────────────────────────────────────────── */
  if (step === "type") {
    return (
      <div className="p-6 max-w-xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/events" className="text-ink-muted hover:text-ink transition-colors p-1 -ml-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Nieuw evenement</h1>
            <p className="text-ink-muted text-sm mt-0.5">Wat voor bijeenkomst organiseer je?</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => selectType(type.id)}
              className={`group relative flex items-start gap-5 p-5 bg-white rounded-2xl border border-sand border-l-4 ${type.accentColor} text-left hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150`}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-[15px] leading-tight mb-0.5">{type.label}</p>
                <p className="text-ink-muted text-xs mb-3">{type.examples}</p>
                <p className="text-ink text-sm mb-3 font-medium">{type.pitch}</p>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-1.5">
                  {type.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-muted bg-sand/80 px-2 py-0.5 rounded-full"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${type.dotColor}`} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRight
                size={18}
                className="text-ink-muted/50 group-hover:text-ink-muted mt-0.5 shrink-0 transition-colors"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Step 2: Event details ─────────────────────────────────────────────── */
  const selectedType = EVENT_TYPES.find((t) => t.id === eventType)!;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("type")}
          className="text-ink-muted hover:text-ink transition-colors p-1 -ml-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">Nieuw evenement</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${selectedType.dotColor}`} />
            <p className="text-ink-muted text-sm">{selectedType.label}</p>
          </div>
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
            placeholder="bijv. Vrijwilligersdag 2026"
            value={form.title}
            onChange={set("title")}
            className="w-full text-ink text-base outline-none placeholder-ink-muted/50 bg-transparent"
            autoFocus
          />
        </div>

        {/* Cover image */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Omslagfoto
          </label>
          <ImageUpload
            value={form.coverImage}
            onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
            aspectRatio="wide"
            placeholder="Sleep een omslagfoto of klik om te uploaden"
          />
        </div>

        {/* Tagline */}
        <div className="card-base p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
              Tagline
            </label>
            <AiGenButton
              type="tagline"
              context={{ title: form.title }}
              onResult={(text) => setForm((f) => ({ ...f, tagline: text.split("\n")[0] }))}
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
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
              Beschrijving
            </label>
            <AiGenButton
              type="description"
              context={{ title: form.title, type: eventType }}
              onResult={(text) => setForm((f) => ({ ...f, description: text }))}
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
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> Locatie
            </span>
          </label>
          <input
            type="text"
            placeholder="bijv. Buurthuis De Klinker, Amsterdam"
            value={form.location}
            onChange={set("location")}
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Date & Time */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> Datum &amp; Tijd *
            </span>
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
            <span className="flex items-center gap-1.5">
              <Users size={12} /> Max. deelnemers
            </span>
          </label>
          <input
            type="number"
            placeholder="bijv. 50"
            value={form.maxAttendees}
            onChange={set("maxAttendees")}
            min="1"
            className="w-full text-ink text-sm outline-none placeholder-ink-muted/50 bg-transparent"
          />
        </div>

        {/* Openbaar */}
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
              onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.isPublic ? "bg-terra-500" : "bg-sand"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                  form.isPublic ? "left-5" : "left-0.5"
                }`}
              />
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
          {loading ? "Aanmaken..." : "Evenement aanmaken"}
        </button>
      </div>
    </div>
  );
}
