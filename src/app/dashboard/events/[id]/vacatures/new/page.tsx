"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Loader2, Users, Clock, MapPin,
  Check, ChevronRight, RefreshCw, Eye, EyeOff,
  HandHeart, Wrench, Shield, MessageCircle,
  Baby, Car, UtensilsCrossed, ClipboardList, Sparkle,
} from "lucide-react";
import { TiptapEditor } from "@/components/vacancy/tiptap-editor";
import { SkillTagsInput } from "@/components/vacancy/skill-tags-input";

// ── Category config ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "begeleiding",  label: "Begeleiding",   icon: HandHeart,      color: "blue"   },
  { id: "registratie",  label: "Registratie",   icon: ClipboardList,  color: "purple" },
  { id: "catering",     label: "Catering",      icon: UtensilsCrossed,color: "orange" },
  { id: "techniek",     label: "Techniek",      icon: Wrench,         color: "gray"   },
  { id: "veiligheid",   label: "Veiligheid",    icon: Shield,         color: "red"    },
  { id: "communicatie", label: "Communicatie",  icon: MessageCircle,  color: "sky"    },
  { id: "decoratie",    label: "Decoratie",     icon: Sparkle,        color: "pink"   },
  { id: "vervoer",      label: "Vervoer",       icon: Car,            color: "yellow" },
  { id: "kinderhoek",   label: "Kinderhoek",    icon: Baby,           color: "green"  },
] as const;

const COLOR_MAP: Record<string, { ring: string; bg: string; icon: string; border: string }> = {
  blue:   { ring: "ring-blue-400",   bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-200"   },
  purple: { ring: "ring-purple-400", bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
  orange: { ring: "ring-orange-400", bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
  gray:   { ring: "ring-gray-400",   bg: "bg-gray-100",  icon: "text-gray-600",   border: "border-gray-200"   },
  red:    { ring: "ring-red-400",    bg: "bg-red-50",    icon: "text-red-600",    border: "border-red-200"    },
  sky:    { ring: "ring-sky-400",    bg: "bg-sky-50",    icon: "text-sky-600",    border: "border-sky-200"    },
  pink:   { ring: "ring-pink-400",   bg: "bg-pink-50",   icon: "text-pink-600",   border: "border-pink-200"   },
  yellow: { ring: "ring-yellow-400", bg: "bg-yellow-50", icon: "text-yellow-600", border: "border-yellow-200" },
  green:  { ring: "ring-green-400",  bg: "bg-green-50",  icon: "text-green-600",  border: "border-green-200"  },
};

// ── AI SSE stream helper ─────────────────────────────────────────────────────
async function streamVacancyAI(
  data: {
    title: string;
    category: string;
    spotsAvailable: number;
    shiftStart?: string;
    shiftEnd?: string;
    location?: string;
  },
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: () => void
) {
  try {
    const res = await fetch("/api/ai/generate-vacancy", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    if (!res.ok || !res.body) { onError(); return; }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = "";
    let   accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;
        try {
          const json  = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            accumulated += delta;
            onChunk(accumulated);
          }
        } catch { /* skip malformed */ }
      }
    }
    onDone();
  } catch {
    onError();
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function NewVacaturePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // Form state
  const [category,       setCategory]       = useState("");
  const [title,          setTitle]          = useState("");
  const [description,    setDescription]    = useState("");
  const [spotsAvailable, setSpotsAvailable] = useState(1);
  const [shiftDate,      setShiftDate]      = useState("");
  const [shiftStart,     setShiftStart]     = useState("");
  const [shiftEnd,       setShiftEnd]       = useState("");
  const [location,       setLocation]       = useState("");
  const [requirements,   setRequirements]   = useState<string[]>([]);
  const [status,         setStatus]         = useState<"draft" | "open">("open");

  // UI state
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [genDone,     setGenDone]     = useState(false);
  const [genError,    setGenError]    = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  const canGenerate = title.trim().length >= 3;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setGenDone(false);
    setGenError(false);
    setDescription("");

    await streamVacancyAI(
      {
        title,
        category:       category || "overig",
        spotsAvailable,
        shiftStart:     shiftStart || undefined,
        shiftEnd:       shiftEnd   || undefined,
        location:       location   || undefined,
      },
      (accumulated) => setDescription(accumulated),
      () => { setGenerating(false); setGenDone(true); },
      () => { setGenerating(false); setGenError(true); setTimeout(() => setGenError(false), 3000); }
    );
  }, [canGenerate, generating, title, category, spotsAvailable, shiftStart, shiftEnd, location]);

  const handleSave = useCallback(async (publishStatus: "draft" | "open") => {
    if (!title.trim() || !category) {
      setError("Vul minimaal een categorie en vacaturenaam in.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/vacancies", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId:        params.id,
          title:          title.trim(),
          description:    description || null,
          category,
          spotsAvailable,
          location:       location.trim() || null,
          shiftDate:      shiftDate || null,
          shiftStart:     shiftStart || null,
          shiftEnd:       shiftEnd   || null,
          requirements,
          status:         publishStatus,
        }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      router.push(`/dashboard/events/${params.id}/vacatures`);
    } catch {
      setError("Opslaan mislukt. Probeer opnieuw.");
      setSaving(false);
    }
  }, [title, category, description, spotsAvailable, location, shiftDate, shiftStart, shiftEnd, requirements, params.id, router]);

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="w-full md:max-w-3xl md:mx-auto bg-white min-h-screen pb-32">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-sand">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/dashboard/events/${params.id}/vacatures`}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-sand transition-colors text-ink-muted"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-ink truncate">
              {title || "Nieuwe vacature"}
            </h1>
            <p className="text-[11px] text-ink-muted">
              {category ? (CATEGORIES.find((c) => c.id === category)?.label ?? category) : "Kies een categorie"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink px-2.5 py-1.5 rounded-xl hover:bg-sand transition-colors"
          >
            {previewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
            Preview
          </button>
        </div>

        {error && (
          <div className="mx-4 mb-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <div className="px-4 pt-6 space-y-4">

        {/* ── STAP 1: Categorie ── */}
        <section>
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            Soort functie *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(({ id, label, icon: Icon, color }) => {
              const cls    = COLOR_MAP[color];
              const active = category === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  className={[
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                    active
                      ? `${cls.bg} ${cls.border} ring-2 ${cls.ring} ring-offset-1`
                      : "bg-white border-sand hover:border-gray-300 hover:bg-cream/60",
                  ].join(" ")}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? cls.bg : "bg-sand/60"}`}>
                    <Icon size={16} className={active ? cls.icon : "text-ink-muted"} />
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${active ? "text-ink" : "text-ink-muted"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── STAP 2: Vacaturenaam ── */}
        <section className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Vacaturenaam *
          </label>
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="bijv. Gastheer/gastvrouw bij de ingang"
            className="w-full text-ink text-base font-medium outline-none placeholder-ink-muted/40 bg-transparent"
          />
        </section>

        {/* ── STAP 3: Beschrijving met AI editor ── */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Beschrijving
            </label>

            {/* AI genereer knop */}
            <div className="flex items-center gap-2">
              {genDone && (
                <span className="flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                  <Check size={11} />
                  Gegenereerd
                </span>
              )}
              {genError && (
                <span className="text-[11px] text-red-500 font-semibold">AI fout</span>
              )}
              {description && !generating && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  title="Opnieuw genereren"
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg text-ink-muted hover:bg-sand hover:text-ink transition-all"
                >
                  <RefreshCw size={11} />
                  Herschrijf
                </button>
              )}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate || generating}
                className={[
                  "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all",
                  generating
                    ? "bg-terra-100 text-terra-600 border border-terra-200 cursor-wait"
                    : !canGenerate
                    ? "bg-sand text-ink-muted/40 border border-sand cursor-not-allowed"
                    : "bg-terra-500 hover:bg-terra-600 text-white shadow-sm shadow-terra-200",
                ].join(" ")}
              >
                {generating
                  ? <><Loader2 size={11} className="animate-spin" /> Schrijven…</>
                  : <><Sparkles size={11} /> Genereer met AI</>
                }
              </button>
            </div>
          </div>

          {/* AI generating skeleton */}
          {generating && !description && (
            <div className="rounded-xl border border-terra-200 bg-terra-50/40 p-4 space-y-2 min-h-[180px] animate-pulse">
              <div className="h-3 bg-terra-200/60 rounded w-3/4" />
              <div className="h-3 bg-terra-200/60 rounded w-full" />
              <div className="h-3 bg-terra-200/60 rounded w-5/6" />
              <div className="h-3 bg-terra-200/40 rounded w-1/2 mt-4" />
              <div className="h-3 bg-terra-200/60 rounded w-4/5" />
              <div className="h-3 bg-terra-200/60 rounded w-3/4" />
            </div>
          )}

          {/* Tiptap editor */}
          <div className={generating && !description ? "hidden" : ""}>
            <TiptapEditor
              value={description}
              onChange={setDescription}
              placeholder="Beschrijf de vacature, taken en wat vrijwilligers kunnen verwachten… of klik 'Genereer met AI'."
            />
          </div>

          {!canGenerate && !generating && !description && (
            <p className="mt-1.5 text-[11px] text-ink-muted">
              Vul een vacaturenaam in om AI te activeren
            </p>
          )}
        </section>

        {/* ── STAP 4: Vaardigheden ── */}
        <section className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            Vereisten &amp; Vaardigheden
          </label>
          <SkillTagsInput
            value={requirements}
            onChange={setRequirements}
            context={{ title, category: category || "overig" }}
          />
        </section>

        {/* ── STAP 5: Praktisch ── */}
        <section className="card-base p-5 space-y-4">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider">
            Praktisch
          </label>

          {/* Aantal plekken */}
          <div>
            <p className="text-xs text-ink-muted mb-2 flex items-center gap-1.5">
              <Users size={12} /> Aantal plekken
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSpotsAvailable((n) => Math.max(1, n - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-sand bg-cream hover:bg-sand text-ink-muted font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-ink w-8 text-center tabular-nums">
                {spotsAvailable}
              </span>
              <button
                type="button"
                onClick={() => setSpotsAvailable((n) => n + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-sand bg-cream hover:bg-sand text-ink-muted font-bold text-lg transition-colors"
              >
                +
              </button>
              <span className="text-sm text-ink-muted">
                {spotsAvailable === 1 ? "vrijwilliger" : "vrijwilligers"}
              </span>
            </div>
          </div>

          {/* Datum */}
          <div>
            <p className="text-xs text-ink-muted mb-2 flex items-center gap-1.5">
              <Clock size={12} /> Datum &amp; Dienst
            </p>
            <div className="space-y-2">
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                className="w-full text-sm text-ink outline-none bg-sand rounded-xl px-3 py-2.5 border border-transparent focus:border-terra-300 transition-colors"
              />
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="flex-1 text-sm text-ink outline-none bg-sand rounded-xl px-3 py-2.5 border border-transparent focus:border-terra-300 transition-colors"
                />
                <span className="text-ink-muted text-sm">→</span>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="flex-1 text-sm text-ink outline-none bg-sand rounded-xl px-3 py-2.5 border border-transparent focus:border-terra-300 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Locatie */}
          <div>
            <p className="text-xs text-ink-muted mb-2 flex items-center gap-1.5">
              <MapPin size={12} /> Locatie op event
            </p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="bijv. Hoofdingang, Zaal B, Parkeerterrein…"
              className="w-full text-sm text-ink outline-none placeholder-ink-muted/40 bg-sand rounded-xl px-3 py-2.5 border border-transparent focus:border-terra-300 transition-colors"
            />
          </div>
        </section>

        {/* ── STAP 6: Status ── */}
        <section className="card-base p-5">
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
            Publicatiestatus
          </label>
          <div className="space-y-2">
            {[
              {
                value:    "draft" as const,
                label:    "Concept",
                desc:     "Bewaar als concept, vrijwilligers kunnen deze vacature nog niet zien",
                color:    "text-ink-muted",
                bgActive: "bg-cream border-sand",
              },
              {
                value:    "open" as const,
                label:    "Direct publiceren",
                desc:     "Vrijwilligers kunnen zich direct aanmelden via de evenementpagina",
                color:    "text-green-700",
                bgActive: "bg-green-50 border-green-300",
              },
            ].map(({ value, label, desc, color, bgActive }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={[
                  "w-full flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                  status === value ? bgActive : "bg-white border-sand hover:border-gray-300",
                ].join(" ")}
              >
                <div className={[
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                  status === value ? "border-terra-500 bg-terra-500" : "border-sand",
                ].join(" ")}>
                  {status === value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${status === value ? color : "text-ink"}`}>{label}</p>
                  <p className="text-[11px] text-ink-muted mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Preview panel ── */}
      {previewOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Vrijwilligersview preview</p>
              <button type="button" onClick={() => setPreviewOpen(false)} className="text-ink-muted hover:text-ink p-1 rounded-lg hover:bg-sand">
                ×
              </button>
            </div>

            {selectedCat && (() => {
              const cls = COLOR_MAP[selectedCat.color];
              const Icon = selectedCat.icon;
              return (
                <div className="rounded-2xl border border-sand overflow-hidden">
                  <div className={`px-4 py-3 ${cls.bg} ${cls.border} border-b flex items-center gap-2`}>
                    <Icon size={14} className={cls.icon} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${cls.icon}`}>
                      {selectedCat.label}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-ink text-base">{title || "Vacaturenaam"}</h3>

                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Users size={11} />
                        {spotsAvailable} {spotsAvailable === 1 ? "plek" : "plekken"}
                      </span>
                      {shiftStart && shiftEnd && (
                        <span className="flex items-center gap-1 text-xs text-ink-muted">
                          <Clock size={11} />
                          {shiftStart}–{shiftEnd}
                        </span>
                      )}
                      {location && (
                        <span className="flex items-center gap-1 text-xs text-ink-muted">
                          <MapPin size={11} />
                          {location}
                        </span>
                      )}
                    </div>

                    {description && (
                      <div
                        className="tiptap-content text-sm pt-1"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    )}

                    {requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {requirements.map((r) => (
                          <span key={r} className="text-[11px] bg-sand rounded-lg px-2 py-0.5 text-ink-muted font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="w-full mt-2 bg-terra-500 text-white font-bold py-2.5 rounded-xl text-sm"
                    >
                      Aanmelden als vrijwilliger
                    </button>
                  </div>
                </div>
              );
            })()}

            {!selectedCat && (
              <div className="text-center py-6 text-ink-muted text-sm">
                Kies een categorie om de preview te zien
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fixed bottom action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-sand px-4 py-3 pb-safe">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving || !title.trim() || !category}
            className="flex-1 py-3 rounded-2xl border-2 border-sand text-sm font-bold text-ink-muted hover:bg-sand hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Opslaan…" : "Bewaar concept"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("open")}
            disabled={saving || !title.trim() || !category}
            className="flex-[2] py-3 rounded-2xl bg-terra-500 hover:bg-terra-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Publiceren…</>
              : <><Check size={15} /> Publiceer vacature <ChevronRight size={14} /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
