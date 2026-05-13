"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, FileText, Printer,
  Mail, Check, Loader2, ChevronRight, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

type ViewState = "form" | "generating" | "result";
type FormStep  = 1 | 2 | 3;

interface FormData {
  evenementNaam:    string;
  organisatieNaam:  string;
  gemeente:         string;
  datum:            string;
  aantalDeelnemers: number | "";
  doelgroepen:      string[];
  themas:           string[];
  aantalSessies:    number | "";
  tevredenheid:     number;
  subsidiegever:    string;
}

const INITIAL: FormData = {
  evenementNaam:    "",
  organisatieNaam:  "",
  gemeente:         "",
  datum:            "",
  aantalDeelnemers: "",
  doelgroepen:      [],
  themas:           [],
  aantalSessies:    "",
  tevredenheid:     8,
  subsidiegever:    "",
};

const DOELGROEPEN = [
  { id: "ouderen",        label: "Ouderen (65+)" },
  { id: "jongeren",       label: "Jongeren (16–27)" },
  { id: "beperking",      label: "Mensen met beperking" },
  { id: "mantelzorgers",  label: "Mantelzorgers" },
  { id: "professionals",  label: "Welzijnsprofessionals" },
  { id: "gemengd",        label: "Gemengd publiek" },
];

const THEMAS = [
  { id: "zelfredzaamheid", label: "Zelfredzaamheid" },
  { id: "participatie",    label: "Sociale participatie" },
  { id: "cohesie",         label: "Sociale cohesie" },
  { id: "gezondheid",      label: "Gezondheid & preventie" },
  { id: "wonen",           label: "Wonen & langer thuis" },
  { id: "werk",            label: "Werk & inkomen" },
  { id: "digitaal",        label: "Digitale inclusie" },
];

const DEELNEMERS_PRESETS = [25, 50, 100, 200, 300, 500];

// ── Root component ───────────────────────────────────────────────────────────

export function RapportGenerator() {
  const [view,        setView]        = useState<ViewState>("form");
  const [step,        setStep]        = useState<FormStep>(1);
  const [form,        setForm]        = useState<FormData>(INITIAL);
  const [rapport,     setRapport]     = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const [emailState,  setEmailState]  = useState<"idle" | "submitting" | "sent">("idle");
  const [email,       setEmail]       = useState("");
  const [emailNaam,   setEmailNaam]   = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);

  function togglePill(field: "doelgroepen" | "themas", id: string) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter(x => x !== id)
        : [...prev[field], id],
    }));
  }

  const step1Valid = !!(
    form.evenementNaam.trim() &&
    form.organisatieNaam.trim() &&
    form.gemeente.trim() &&
    form.datum
  );

  const step2Valid = !!(
    form.aantalDeelnemers !== "" &&
    Number(form.aantalDeelnemers) > 0 &&
    form.doelgroepen.length > 0 &&
    form.themas.length > 0
  );

  const formValid = step1Valid && step2Valid &&
    form.aantalSessies !== "" && Number(form.aantalSessies) > 0;

  async function generate() {
    if (!formValid) return;
    setError(null);
    setView("generating");

    try {
      const res = await fetch("/api/ai/generate-rapport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          aantalDeelnemers: Number(form.aantalDeelnemers),
          aantalSessies:    Number(form.aantalSessies),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Genereren mislukt. Probeer opnieuw.");
      }

      if (!res.body) throw new Error("Geen response ontvangen.");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   html    = "";

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text  = decoder.decode(value, { stream: true });
        const lines = text.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const chunk = line.slice(6).trim();
          if (chunk === "[DONE]") break outer;
          try {
            const parsed = JSON.parse(chunk);
            html += parsed.choices?.[0]?.delta?.content ?? "";
          } catch { /* skip malformed chunk */ }
        }
      }

      setRapport(html);
      setView("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
      setView("form");
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || emailState !== "idle") return;
    setEmailState("submitting");
    try {
      await fetch("/api/leadgen/rapport-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          naam:             emailNaam || undefined,
          organisatieNaam:  form.organisatieNaam,
          evenementNaam:    form.evenementNaam,
          gemeente:         form.gemeente,
          aantalDeelnemers: Number(form.aantalDeelnemers),
          doelgroepen:      form.doelgroepen,
          themas:           form.themas,
          rapportHtml:      rapport,
        }),
      });
    } catch { /* silent — user already has the rapport */ }
    setEmailState("sent");
  }

  function reset() {
    setView("form");
    setStep(1);
    setForm(INITIAL);
    setRapport("");
    setEmailState("idle");
    setEmail("");
    setEmailNaam("");
  }

  if (view === "generating") return <GeneratingScreen />;
  if (view === "result") {
    return (
      <ResultScreen
        form={form}
        rapport={rapport}
        printRef={printRef}
        email={email}
        emailNaam={emailNaam}
        emailState={emailState}
        onEmailChange={setEmail}
        onEmailNaamChange={setEmailNaam}
        onEmailSubmit={submitEmail}
        onReset={reset}
      />
    );
  }

  return (
    <FormScreen
      step={step}
      form={form}
      error={error}
      step1Valid={step1Valid}
      step2Valid={step2Valid}
      formValid={formValid}
      onUpdate={(patch) => setForm(prev => ({ ...prev, ...patch }))}
      onTogglePill={togglePill}
      onNext={() => setStep(s => Math.min(s + 1, 3) as FormStep)}
      onBack={() => setStep(s => Math.max(s - 1, 1) as FormStep)}
      onGenerate={generate}
    />
  );
}

// ── Form screen ───────────────────────────────────────────────────────────────

function FormScreen({
  step, form, error, step1Valid, step2Valid, formValid,
  onUpdate, onTogglePill, onNext, onBack, onGenerate,
}: {
  step:       FormStep;
  form:       FormData;
  error:      string | null;
  step1Valid: boolean;
  step2Valid: boolean;
  formValid:  boolean;
  onUpdate:      (patch: Partial<FormData>) => void;
  onTogglePill:  (field: "doelgroepen" | "themas", id: string) => void;
  onNext:        () => void;
  onBack:        () => void;
  onGenerate:    () => void;
}) {
  return (
    <div className="bg-cream min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-[#12100E] pt-16 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
            Gratis · Geen account
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.05] mb-5">
            WMO-impactrapport
            <br />
            <span className="text-terra-400">in 2 minuten gegenereerd.</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Vul de gegevens van uw evenement in. De AI schrijft een volledig,
            professioneel rapport dat direct bruikbaar is voor uw subsidieaanvraag
            of verantwoording aan de gemeente.
          </p>
        </div>
      </section>

      {/* Form card */}
      <section className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2, 3] as FormStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors",
                  step > s  ? "bg-terra-500 text-white" :
                  step === s ? "bg-terra-500 text-white ring-4 ring-terra-500/20" :
                               "bg-ink/8 text-ink/30",
                )}>
                  {step > s ? <Check size={12} strokeWidth={3} /> : s}
                </div>
                <span className={cn(
                  "text-xs font-medium hidden sm:block",
                  step === s ? "text-ink" : "text-ink/35",
                )}>
                  {s === 1 ? "Het evenement" : s === 2 ? "Deelnemers & inhoud" : "Kwaliteit & indienen"}
                </span>
                {i < 2 && <div className={cn("flex-1 h-px", step > s ? "bg-terra-500/40" : "bg-ink/10")} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-sand/60 shadow-sm">
            <div className="p-6 sm:p-8">
              {step === 1 && <Step1 form={form} onUpdate={onUpdate} />}
              {step === 2 && <Step2 form={form} onUpdate={onUpdate} onTogglePill={onTogglePill} />}
              {step === 3 && <Step3 form={form} onUpdate={onUpdate} />}
            </div>

            {error && (
              <div className="mx-6 mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex items-center justify-between gap-3 border-t border-sand/50 pt-5">
              {step > 1 ? (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink/50 hover:text-ink transition-colors px-3 py-2 rounded-xl hover:bg-ink/5"
                >
                  <ArrowLeft size={14} />
                  Terug
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={onNext}
                  disabled={step === 1 ? !step1Valid : !step2Valid}
                  className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:bg-ink/15 disabled:cursor-not-allowed text-white disabled:text-ink/35 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Volgende
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={onGenerate}
                  disabled={!formValid}
                  className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:bg-ink/15 disabled:cursor-not-allowed text-white disabled:text-ink/35 font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-terra-500/20"
                >
                  <FileText size={15} />
                  Genereer rapport
                </button>
              )}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink/35 font-medium">
            {["Geen account nodig", "Gratis", "AVG-compliant", "Nederlandse servers"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-terra-500/50" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Step 1: evenement basics ─────────────────────────────────────────────────

function Step1({ form, onUpdate }: { form: FormData; onUpdate: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Over het evenement</h2>
        <p className="text-sm text-ink/50">Basisgegevens van de activiteit waarvoor u het rapport wilt genereren.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Naam van het evenement" required>
          <input
            type="text"
            value={form.evenementNaam}
            onChange={e => onUpdate({ evenementNaam: e.target.value })}
            placeholder="Buurtbijeenkomst Zelfredzaamheid 2026"
            className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Naam van uw organisatie" required>
          <input
            type="text"
            value={form.organisatieNaam}
            onChange={e => onUpdate({ organisatieNaam: e.target.value })}
            placeholder="Stichting Welzijn Noord"
            className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Gemeente / regio" required>
          <input
            type="text"
            value={form.gemeente}
            onChange={e => onUpdate({ gemeente: e.target.value })}
            placeholder="Amsterdam"
            className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Datum van het evenement" required>
          <input
            type="date"
            value={form.datum}
            onChange={e => onUpdate({ datum: e.target.value })}
            className={inputCls}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

// ── Step 2: deelnemers & inhoud ──────────────────────────────────────────────

function Step2({
  form, onUpdate, onTogglePill,
}: {
  form: FormData;
  onUpdate: (p: Partial<FormData>) => void;
  onTogglePill: (field: "doelgroepen" | "themas", id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Deelnemers & inhoud</h2>
        <p className="text-sm text-ink/50">
          Deze gegevens bepalen de diepgang en relevantie van het rapport.
        </p>
      </div>

      {/* Aantal deelnemers */}
      <FieldGroup label="Aantal deelnemers" required>
        <div className="space-y-2">
          <input
            type="number"
            min={1}
            max={10000}
            value={form.aantalDeelnemers}
            onChange={e => onUpdate({ aantalDeelnemers: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder="Voer een getal in"
            className={inputCls}
          />
          <div className="flex flex-wrap gap-2">
            {DEELNEMERS_PRESETS.map(n => (
              <button
                key={n}
                onClick={() => onUpdate({ aantalDeelnemers: n })}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                  form.aantalDeelnemers === n
                    ? "bg-terra-500 border-terra-500 text-white"
                    : "bg-cream border-sand text-ink/50 hover:border-terra-300 hover:text-terra-600",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </FieldGroup>

      {/* Doelgroepen */}
      <FieldGroup label="Doelgroepen" hint="Selecteer alle doelgroepen die aanwezig waren" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {DOELGROEPEN.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTogglePill("doelgroepen", id)}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all",
                form.doelgroepen.includes(id)
                  ? "bg-terra-500 border-terra-500 text-white shadow-sm shadow-terra-500/25"
                  : "bg-cream border-sand text-ink/55 hover:border-terra-300 hover:text-terra-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Thema's */}
      <FieldGroup label="Thema's" hint="Selecteer de hoofdthema's van uw programma" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {THEMAS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTogglePill("themas", id)}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all",
                form.themas.includes(id)
                  ? "bg-terra-500 border-terra-500 text-white shadow-sm shadow-terra-500/25"
                  : "bg-cream border-sand text-ink/55 hover:border-terra-300 hover:text-terra-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

// ── Step 3: kwaliteit & indienen ─────────────────────────────────────────────

function Step3({ form, onUpdate }: { form: FormData; onUpdate: (p: Partial<FormData>) => void }) {
  const tevredenheidLabel =
    form.tevredenheid >= 9 ? "Uitstekend" :
    form.tevredenheid >= 7 ? "Goed" : "Voldoende";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Kwaliteitsgegevens</h2>
        <p className="text-sm text-ink/50">
          Laatste details voor een onderbouwd rapport.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Aantal sessies / workshops" required>
          <input
            type="number"
            min={1}
            max={50}
            value={form.aantalSessies}
            onChange={e => onUpdate({ aantalSessies: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder="3"
            className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label={`Gemiddelde tevredenheid — ${tevredenheidLabel}`}>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-ink/35 w-10">6</span>
            <input
              type="range"
              min={6}
              max={10}
              step={0.5}
              value={form.tevredenheid}
              onChange={e => onUpdate({ tevredenheid: Number(e.target.value) })}
              className="flex-1 accent-terra-500"
            />
            <span className="text-sm font-bold text-terra-500 w-10 text-right">{form.tevredenheid}/10</span>
          </div>
        </FieldGroup>
      </div>

      <FieldGroup label="Subsidiegever" hint="Optioneel — geeft het rapport meer specificiteit">
        <input
          type="text"
          value={form.subsidiegever}
          onChange={e => onUpdate({ subsidiegever: e.target.value })}
          placeholder="Gemeente Amsterdam — WMO-budget, of: IZA-programma"
          className={inputCls}
        />
      </FieldGroup>

      {/* Preview van wat er gegenereerd wordt */}
      <div className="bg-terra-50 border border-terra-100 rounded-xl p-4">
        <p className="text-xs font-bold text-terra-600 uppercase tracking-wider mb-2">
          Het rapport bevat
        </p>
        <ul className="space-y-1.5">
          {[
            "Samenvatting voor besluitvormers",
            "Bereik & deelnamecijfers (kwantitatief)",
            "Doelgroepanalyse per WMO-prestatieveld",
            "Programma en methodiek",
            "Maatschappelijke impact (berekend)",
            "WMO-verantwoordingstekst (artikelreferenties)",
            "Conclusie & 3 concrete aanbevelingen",
          ].map(item => (
            <li key={item} className="flex items-center gap-2 text-xs text-terra-700">
              <Check size={11} className="text-terra-500 shrink-0" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Generating screen ─────────────────────────────────────────────────────────

function GeneratingScreen() {
  return (
    <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center py-24">
        <div className="w-14 h-14 bg-terra-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader2 size={22} className="text-terra-500 animate-spin" />
        </div>
        <h2 className="text-xl font-extrabold text-ink mb-3 tracking-tight">
          Rapport wordt gegenereerd
        </h2>
        <p className="text-sm text-ink/50 leading-relaxed max-w-xs mx-auto">
          De AI analyseert uw gegevens en schrijft een volledig WMO-rapport.
          Dit duurt ongeveer 10–15 seconden.
        </p>
        <div className="mt-8 space-y-2">
          {[
            "Bereik- en deelnamecijfers berekenen...",
            "Doelgroepanalyse opstellen...",
            "WMO-verantwoordingstekst schrijven...",
          ].map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white border border-sand/60 rounded-xl px-4 py-3 text-sm text-ink/50"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-terra-400 animate-pulse shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────────

function ResultScreen({
  form, rapport, printRef,
  email, emailNaam, emailState,
  onEmailChange, onEmailNaamChange, onEmailSubmit, onReset,
}: {
  form:              FormData;
  rapport:           string;
  printRef:          React.MutableRefObject<HTMLDivElement | null>;
  email:             string;
  emailNaam:         string;
  emailState:        "idle" | "submitting" | "sent";
  onEmailChange:     (v: string) => void;
  onEmailNaamChange: (v: string) => void;
  onEmailSubmit:     (e: React.FormEvent) => void;
  onReset:           () => void;
}) {
  const datumFormatted = form.datum
    ? new Date(form.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const ref = form.evenementNaam.slice(0, 4).toUpperCase().replace(/\s/g, "") +
    "-" + new Date().getFullYear();

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #rapport-print-area { display: block !important; }
          #rapport-print-area * { visibility: visible !important; }
          #rapport-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 2cm; }
        }
        .rapport-content h2 {
          font-size: 1rem; font-weight: 700; color: #1C1814;
          margin: 2rem 0 0.625rem; padding-top: 1.5rem;
          border-top: 1px solid #F0E8DC;
        }
        .rapport-content h2:first-child { border-top: none; padding-top: 0; margin-top: 0; }
        .rapport-content h3 {
          font-size: 0.9375rem; font-weight: 600; color: #5C5248; margin: 1rem 0 0.375rem;
        }
        .rapport-content p {
          color: #5C5248; line-height: 1.8; margin-bottom: 0.75rem; font-size: 0.9375rem;
        }
        .rapport-content ul {
          color: #5C5248; padding-left: 1.25rem; margin-bottom: 1rem; list-style: disc;
        }
        .rapport-content li { line-height: 1.75; margin-bottom: 0.25rem; font-size: 0.9375rem; }
        .rapport-content strong { color: #1C1814; font-weight: 600; }
        .rapport-content em { color: #9E3E1C; font-style: normal; font-weight: 500; }
      `}</style>

      <div id="rapport-print-area" className="hidden" ref={printRef}>
        <div className="rapport-content" dangerouslySetInnerHTML={{ __html: rapport }} />
      </div>

      <div className="bg-cream min-h-screen pt-16">
        {/* Topbar */}
        <div className="bg-white border-b border-sand/60 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm font-semibold text-ink truncate">
                {form.evenementNaam}
              </span>
              <span className="hidden sm:inline text-xs text-ink/35 shrink-0">
                · {form.organisatieNaam}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/55 hover:text-ink px-3 py-1.5 rounded-lg border border-ink/10 hover:bg-ink/5 transition-colors"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Afdrukken / PDF</span>
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ink/55 hover:text-ink px-3 py-1.5 rounded-lg border border-ink/10 hover:bg-ink/5 transition-colors"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Nieuw rapport</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* Rapport document */}
            <div className="bg-white rounded-2xl border border-sand/60 shadow-sm overflow-hidden">
              {/* Document header */}
              <div className="bg-[#12100E] px-7 py-6">
                <p className="text-[10px] font-bold text-terra-400 uppercase tracking-widest mb-3">
                  WMO-impactrapportage
                </p>
                <h1 className="text-xl font-extrabold text-white mb-1 leading-tight">
                  {form.evenementNaam}
                </h1>
                <p className="text-white/55 text-sm">{form.organisatieNaam}</p>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-sand/60 divide-x divide-sand/60">
                {[
                  { label: "Datum",        val: datumFormatted },
                  { label: "Gemeente",     val: form.gemeente },
                  { label: "Deelnemers",   val: String(form.aantalDeelnemers) },
                  { label: "Kenmerk",      val: ref },
                ].map(({ label, val }) => (
                  <div key={label} className="px-4 py-3">
                    <p className="text-[9px] font-bold text-ink/30 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-ink truncate">{val}</p>
                  </div>
                ))}
              </div>

              {/* Rapport body */}
              <div className="px-7 py-8 rapport-content"
                   dangerouslySetInnerHTML={{ __html: rapport }} />

              {/* Document footer */}
              <div className="border-t border-sand/60 px-7 py-4 flex items-center justify-between">
                <p className="text-xs text-ink/30">
                  Gegenereerd via{" "}
                  <a href="https://bijeen.app" className="text-terra-500 hover:underline">
                    bijeen.app
                  </a>{" "}
                  · {new Date().toLocaleDateString("nl-NL")}
                </p>
                <p className="text-[10px] text-ink/20 font-medium uppercase tracking-wider">
                  AVG-compliant
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:sticky lg:top-28">

              {/* Email capture */}
              <div className="bg-white rounded-2xl border border-sand/60 shadow-sm p-5">
                {emailState === "sent" ? (
                  <div className="text-center py-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check size={18} className="text-green-600" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-ink text-sm mb-1">Rapport verstuurd</p>
                    <p className="text-xs text-ink/45 leading-relaxed">
                      Controleer uw inbox. Het rapport staat klaar voor indiening.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onEmailSubmit} className="space-y-3">
                    <div>
                      <p className="font-bold text-ink text-sm mb-1">Rapport per e-mail ontvangen</p>
                      <p className="text-xs text-ink/45 leading-relaxed">
                        Ontvang het rapport in uw inbox — direct klaar als bijlage bij uw subsidieaanvraag.
                      </p>
                    </div>
                    <input
                      type="text"
                      value={emailNaam}
                      onChange={e => onEmailNaamChange(e.target.value)}
                      placeholder="Uw naam (optioneel)"
                      className={cn(inputCls, "text-sm")}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => onEmailChange(e.target.value)}
                      placeholder="E-mailadres"
                      className={cn(inputCls, "text-sm")}
                    />
                    <button
                      type="submit"
                      disabled={!email || emailState === "submitting"}
                      className="w-full inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:bg-ink/15 disabled:cursor-not-allowed text-white disabled:text-ink/35 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      {emailState === "submitting" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Mail size={14} />
                      )}
                      Verstuur rapport
                    </button>
                    <p className="text-[10px] text-ink/30 leading-relaxed">
                      Uw e-mailadres wordt niet gedeeld met derden.
                    </p>
                  </form>
                )}
              </div>

              {/* Bijeen CTA */}
              <div className="bg-[#12100E] rounded-2xl p-5">
                <p className="text-[10px] font-bold text-terra-400 uppercase tracking-wider mb-3">
                  Met Bijeen
                </p>
                <p className="text-white text-sm font-bold mb-2 leading-snug">
                  Dit rapport automatisch na elk event
                </p>
                <p className="text-white/50 text-xs leading-relaxed mb-4">
                  Bijeen genereert dit rapport automatisch — aangevuld met echte data over
                  opkomst, tevredenheid en netwerkmatches. Geen handmatig invullen.
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Echte opkomst- en check-in data",
                    "Tevredenheid per sessie",
                    "WMO-rapport in één klik",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-white/60">
                      <Check size={11} className="text-terra-400 shrink-0 mt-0.5" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-in?new=true&utm_source=rapport_tool&utm_medium=sidebar&utm_campaign=leadgen"
                  className="inline-flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
                >
                  Gratis starten
                  <ChevronRight size={12} />
                </Link>
                <p className="text-white/25 text-[10px] text-center mt-2">Geen creditcard</p>
              </div>

              {/* Nieuw rapport */}
              <button
                onClick={onReset}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-ink/45 hover:text-ink border border-sand/80 hover:border-ink/20 py-2.5 rounded-xl transition-colors bg-white"
              >
                <RotateCcw size={13} />
                Nieuw rapport genereren
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 text-sm text-ink bg-cream border border-sand rounded-xl " +
  "placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-terra-500/30 " +
  "focus:border-terra-400 transition-colors";

function FieldGroup({
  label, hint, required, children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wide">
        {label}
        {required && <span className="text-terra-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-ink/40 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}
