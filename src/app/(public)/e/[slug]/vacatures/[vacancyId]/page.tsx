"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Clock, MapPin, Loader2, Check,
  HandHeart, Wrench, Shield, MessageCircle, Baby, Car,
  UtensilsCrossed, ClipboardList, Sparkles, ChevronRight,
} from "lucide-react";

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  begeleiding:  { label: "Begeleiding",  icon: HandHeart,       bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  registratie:  { label: "Registratie",  icon: ClipboardList,   bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  catering:     { label: "Catering",     icon: UtensilsCrossed, bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  techniek:     { label: "Techniek",     icon: Wrench,          bg: "bg-gray-100",  text: "text-gray-700",   border: "border-gray-200"   },
  veiligheid:   { label: "Veiligheid",   icon: Shield,          bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  communicatie: { label: "Communicatie", icon: MessageCircle,   bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200"    },
  decoratie:    { label: "Decoratie",    icon: Sparkles,        bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200"   },
  vervoer:      { label: "Vervoer",      icon: Car,             bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  kinderhoek:   { label: "Kinderhoek",   icon: Baby,            bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  overig:       { label: "Overig",       icon: HandHeart,       bg: "bg-sand",      text: "text-ink-muted",  border: "border-sand"       },
};

type VacancyData = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  spotsAvailable: number | null;
  location: string | null;
  shiftDate: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  requirements: string[];
  status: string | null;
  eventTitle: string;
  eventSlug: string;
  primaryColor: string;
};

export default function VacancyDetailPage() {
  const params  = useParams<{ slug: string; vacancyId: string }>();
  const router  = useRouter();

  const [vacancy,    setVacancy]    = useState<VacancyData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [step,       setStep]       = useState<"view" | "apply">("view");

  const [form, setForm] = useState({
    name:       "",
    email:      "",
    phone:      "",
    motivation: "",
  });

  useEffect(() => {
    fetch(`/api/public/vacancy/${params.vacancyId}?slug=${params.slug}`)
      .then((r) => r.json())
      .then((d) => setVacancy(d.vacancy ?? null))
      .catch(() => setError("Vacature niet gevonden"))
      .finally(() => setLoading(false));
  }, [params.vacancyId, params.slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Vul je naam en e-mailadres in.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/vacancy-applications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId:  params.vacancyId,
          name:       form.name.trim(),
          email:      form.email.trim(),
          phone:      form.phone.trim() || null,
          motivation: form.motivation.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Aanmelding mislukt.");
        setSubmitting(false);
        return;
      }
      router.push(`/e/${params.slug}/vacatures/${params.vacancyId}/bevestiging`);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!vacancy || vacancy.status !== "open") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-bold text-ink mb-2">Vacature niet beschikbaar</p>
          <Link href={`/e/${params.slug}/vacatures`} className="text-sm text-terra-600 hover:underline">
            ← Bekijk andere vacatures
          </Link>
        </div>
      </div>
    );
  }

  const cat  = CATEGORY_META[vacancy.category ?? "overig"] ?? CATEGORY_META.overig;
  const Icon = cat.icon;
  const primary = vacancy.primaryColor;

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* Header */}
      <div className="text-white px-4 pt-10 pb-8" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}>
        <Link
          href={`/e/${params.slug}/vacatures`}
          className="inline-flex items-center gap-1.5 text-white/80 text-sm mb-5 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Alle vacatures
        </Link>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/75 text-xs font-semibold mb-1">{cat.label}</p>
            <h1 className="text-xl font-bold leading-tight">{vacancy.title}</h1>
            <p className="text-white/75 text-sm mt-1">{vacancy.eventTitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {step === "view" ? (
          <>
            {/* Meta chips */}
            <div className="flex flex-wrap gap-2">
              {vacancy.spotsAvailable != null && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink bg-white rounded-xl border border-sand px-3 py-1.5">
                  <Users size={14} className="text-ink-muted" />
                  {vacancy.spotsAvailable} {vacancy.spotsAvailable === 1 ? "plek" : "plekken"}
                </span>
              )}
              {vacancy.shiftStart && vacancy.shiftEnd && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink bg-white rounded-xl border border-sand px-3 py-1.5">
                  <Clock size={14} className="text-ink-muted" />
                  {vacancy.shiftStart}–{vacancy.shiftEnd}
                </span>
              )}
              {vacancy.location && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink bg-white rounded-xl border border-sand px-3 py-1.5">
                  <MapPin size={14} className="text-ink-muted" />
                  {vacancy.location}
                </span>
              )}
            </div>

            {/* Description */}
            {vacancy.description && (
              <div className="bg-white rounded-2xl border border-sand p-5">
                <div
                  className="tiptap-content"
                  dangerouslySetInnerHTML={{ __html: vacancy.description }}
                />
              </div>
            )}

            {/* Requirements */}
            {vacancy.requirements?.length > 0 && (
              <div className="bg-white rounded-2xl border border-sand p-5">
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                  Wat breng jij mee?
                </p>
                <div className="flex flex-wrap gap-2">
                  {vacancy.requirements.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1.5 text-sm font-medium bg-sand rounded-xl px-3 py-1.5 text-ink">
                      <Check size={12} className="text-terra-500" />
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Apply form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white rounded-2xl border border-sand p-5">
              <p className="text-sm font-bold text-ink mb-4">Jouw gegevens</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Naam *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Voor- en achternaam"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 focus:ring-1 focus:ring-terra-200 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">E-mailadres *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jouw@email.nl"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 focus:ring-1 focus:ring-terra-200 transition-all placeholder-ink-muted/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-muted mb-1.5">Telefoonnummer <span className="font-normal">(optioneel)</span></label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="06 12345678"
                    className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 focus:ring-1 focus:ring-terra-200 transition-all placeholder-ink-muted/40"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand p-5">
              <label className="block text-xs font-bold text-ink-muted mb-1.5">
                Motivatie <span className="font-normal">(optioneel)</span>
              </label>
              <textarea
                value={form.motivation}
                onChange={(e) => setForm(f => ({ ...f, motivation: e.target.value }))}
                placeholder="Waarom wil je vrijwilliger zijn bij dit evenement?"
                rows={4}
                className="w-full bg-cream rounded-xl border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-terra-300 focus:ring-1 focus:ring-terra-200 transition-all placeholder-ink-muted/40 resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
          </form>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-sand px-4 py-3 pb-safe">
        <div className="max-w-xl mx-auto">
          {step === "view" ? (
            <button
              type="button"
              onClick={() => setStep("apply")}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-opacity hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}
            >
              <HandHeart size={16} />
              Aanmelden als vrijwilliger
              <ChevronRight size={15} />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep("view"); setError(""); }}
                className="px-4 py-3 rounded-2xl border-2 border-sand text-sm font-bold text-ink-muted hover:bg-sand transition-colors"
              >
                Terug
              </button>
              <button
                type="button"
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={submitting || !form.name.trim() || !form.email.trim()}
                className="flex-1 py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}CC 100%)` }}
              >
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /> Aanmelden…</>
                  : <><Check size={15} /> Aanmelding versturen</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
