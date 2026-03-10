"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Users, Clock, Globe, Link2, ChevronRight } from "lucide-react";
import Link from "next/link";

const YEAR = new Date().getFullYear();

const TEMPLATES = [
  {
    id: "vrijwilligersdag",
    emoji: "🤝",
    label: "Vrijwilligersdag",
    color: "bg-terra-50 border-terra-200",
    iconColor: "text-terra-600",
    description: "Jaarlijkse bijeenkomst voor en door vrijwilligers",
    prefill: {
      title: `Vrijwilligersdag ${YEAR}`,
      tagline: "Samen sterk voor de buurt",
      description: `Onze jaarlijkse vrijwilligersdag staat in het teken van ontmoeting, waardering en inspiratie. We kijken terug op een mooi jaar en blikken vooruit op nieuwe initiatieven. Er zijn workshops, een lunch en uiteraard volop ruimte om bij te praten met andere vrijwilligers.`,
      maxAttendees: "150",
    },
  },
  {
    id: "kennisdag",
    emoji: "🧠",
    label: "Kennisdag",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    description: "Expertlezingen, workshops en kennisuitwisseling",
    prefill: {
      title: `Kennisdag Welzijn ${YEAR}`,
      tagline: "Kennis delen, samen groeien",
      description: `Een dag vol inspirerende sprekers, interactieve workshops en diepgaande gesprekken over de toekomst van de welzijnssector. Professionals, beleidsmakers en onderzoekers komen samen om kennis te delen en nieuwe inzichten op te doen.`,
      maxAttendees: "200",
    },
  },
  {
    id: "netwerkbijeenkomst",
    emoji: "🔗",
    label: "Netwerkbijeenkomst",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    description: "Nieuwe verbindingen leggen in de sector",
    prefill: {
      title: `Netwerkbijeenkomst ${YEAR}`,
      tagline: "Nieuwe verbindingen voor betere zorg",
      description: `Een informele bijeenkomst voor professionals in de welzijns- en zorgsector. Via ons AI-matchingssysteem worden je op basis van je profiel gekoppeld aan de meest relevante gesprekspartners. Kom met een open vizier en ga naar huis met waardevolle nieuwe contacten.`,
      maxAttendees: "80",
    },
  },
  {
    id: "buurtbijeenkomst",
    emoji: "🏘️",
    label: "Buurtbijeenkomst",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    description: "Bewoners samenbrengen rondom een thema",
    prefill: {
      title: `Buurtbijeenkomst ${YEAR}`,
      tagline: "Samen bouwen aan een sterkere buurt",
      description: `Een open bijeenkomst voor bewoners, organisaties en gemeente om samen te praten over de toekomst van de buurt. Wat gaat goed? Wat kan beter? Iedereen heeft een stem en elke bijdrage telt.`,
      maxAttendees: "100",
    },
  },
  {
    id: "congres",
    emoji: "🎤",
    label: "Congres",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    description: "Groot evenement met meerdere sprekers & tracks",
    prefill: {
      title: `Congres Welzijn & Zorg ${YEAR}`,
      tagline: "Het jaarlijkse congres voor de welzijnssector",
      description: `Het toonaangevende congres van het jaar voor iedereen die werkt in welzijn, zorg en sociaal domein. Met keynotes van landelijke experts, parallelle sessies per thema en een bruisend netwerkprogramma. Schrijf je in en zorg dat je erbij bent.`,
      maxAttendees: "500",
    },
  },
  {
    id: "leeg",
    emoji: "✏️",
    label: "Leeg evenement",
    color: "bg-gray-50 border-gray-200",
    iconColor: "text-gray-500",
    description: "Begin met een leeg formulier",
    prefill: {
      title: "",
      tagline: "",
      description: "",
      maxAttendees: "",
    },
  },
] as const;

type TemplateId = (typeof TEMPLATES)[number]["id"];

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState<"template" | "form">("template");
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
  });

  const slugPreview =
    form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "jouw-evenement";

  function applyTemplate(id: TemplateId) {
    const t = TEMPLATES.find((t) => t.id === id);
    if (!t) return;
    setForm((f) => ({
      ...f,
      title: t.prefill.title,
      description: t.prefill.description,
      tagline: t.prefill.tagline,
      maxAttendees: t.prefill.maxAttendees,
    }));
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
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          endsAt:   form.endsAt   ? new Date(form.endsAt).toISOString()   : undefined,
          maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
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

  if (step === "template") {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard/events" className="text-ink-muted hover:text-ink transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">Nieuw evenement</h1>
            <p className="text-ink-muted text-sm">Kies een template of begin leeg</p>
          </div>
        </div>

        <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-4 mt-6">
          Sector-templates
        </p>

        <div className="grid grid-cols-1 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left hover:scale-[1.01] active:scale-[0.99] transition-all ${t.color}`}
            >
              <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-white/60`}>
                {t.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink text-sm">{t.label}</p>
                <p className="text-ink-muted text-xs mt-0.5">{t.description}</p>
              </div>
              <ChevronRight size={16} className="text-ink-muted shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("template")}
          className="text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink">Nieuw evenement</h1>
          <p className="text-ink-muted text-sm">Vul de details in</p>
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
            placeholder="bijv. Vrijwilligersdag 2025"
            value={form.title}
            onChange={set("title")}
            className="w-full text-ink text-base outline-none placeholder-ink-muted/50 bg-transparent"
            autoFocus
          />
        </div>

        {/* Tagline */}
        <div className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Tagline
          </label>
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
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Beschrijving
          </label>
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
            placeholder="bijv. De Jaarbeurs, Utrecht"
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
            placeholder="bijv. 250"
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
