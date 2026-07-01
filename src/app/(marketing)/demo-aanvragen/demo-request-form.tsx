"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, Calendar, Check, Loader2,
  Mail, MessageCircle, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// ── Types ────────────────────────────────────────────────────────────────────

type FormStep = 1 | 2 | 3 | 4;
type ViewState = "form" | "submitting" | "done" | "error";

interface FormData {
  naam:             string;
  email:            string;
  telefoon:         string;
  organisatieNaam:  string;
  organisatieType:  string;
  functie:          string;
  eventsPerJaar:    string;
  interesses:       string[];
  toelichting:      string;
  sociaalTarief:    boolean;
  voorkeursmoment:  string;
  gewensteWeek:     string;
}

const INITIAL: FormData = {
  naam:            "",
  email:           "",
  telefoon:        "",
  organisatieNaam: "",
  organisatieType: "",
  functie:         "",
  eventsPerJaar:   "",
  interesses:      [],
  toelichting:     "",
  sociaalTarief:   false,
  voorkeursmoment: "",
  gewensteWeek:    "",
};

const ORG_TYPES = [
  "Welzijnsorganisatie",
  "Gemeente",
  "Zorginstelling",
  "Vrijwilligersorganisatie",
  "ANBI / stichting",
  "Overig",
];

const EVENTS_PER_JAAR = [
  { id: "1-2",  label: "1–2" },
  { id: "3-10", label: "3–10" },
  { id: "11-24", label: "11–24" },
  { id: "25+",  label: "25+" },
];

const INTERESSES = [
  { id: "aanmeldingen",  label: "Aanmeldingen & tickets" },
  { id: "vrijwilligers", label: "Vrijwilligersbeheer" },
  { id: "netwerken",     label: "AI-netwerken & matching" },
  { id: "crm",           label: "CRM & contactbeheer" },
  { id: "verantwoording", label: "WMO / subsidieverantwoording" },
  { id: "live",          label: "Live polls & Q&A" },
  { id: "anders",        label: "Anders" },
];

const MOMENTEN = [
  { id: "ochtend", label: "Ochtend" },
  { id: "middag",  label: "Middag" },
  { id: "avond",   label: "Avond" },
  { id: "weet-niet", label: "Weet ik nog niet" },
];

const STEP_LABELS = ["Contact", "Organisatie", "Behoefte", "Planning"];

// ── Root component ───────────────────────────────────────────────────────────

export function DemoRequestForm() {
  const [step, setStep] = useState<FormStep>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [view, setView] = useState<ViewState>("form");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { trackEvent("view_demo_aanvraag_page"); }, []);

  function update(patch: Partial<FormData>) {
    setForm(prev => ({ ...prev, ...patch }));
  }

  function toggleInteresse(id: string) {
    setForm(prev => ({
      ...prev,
      interesses: prev.interesses.includes(id)
        ? prev.interesses.filter(x => x !== id)
        : [...prev.interesses, id],
    }));
  }

  const step1Valid = !!(form.naam.trim() && form.email.trim() && form.organisatieNaam.trim());
  const step2Valid = !!form.organisatieType;
  const step3Valid = form.interesses.length > 0;

  async function submit() {
    setView("submitting");
    setError(null);
    trackEvent("demo_aanvraag_submitted");
    try {
      const res = await fetch("/api/leadgen/demo-aanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Versturen mislukt. Probeer het opnieuw.");
      }
      setView("done");
      trackEvent("demo_aanvraag_success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan.");
      setView("error");
    }
  }

  if (view === "done") return <DoneScreen naam={form.naam} />;

  return (
    <div className="bg-cream min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-[#12100E] pt-16 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
            Gratis · 30 minuten · Vrijblijvend
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.05] mb-5">
            Plan je gratis demo
            <br />
            <span className="text-terra-400">in 4 korte stappen.</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            We lopen samen door de tool en kijken eerlijk of Bijeen bij jullie past.
            Geen verkooppraatje, geen verplichtingen.
          </p>
        </div>
      </section>

      {/* Form card */}
      <section className="py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {([1, 2, 3, 4] as FormStep[]).map((s, i) => (
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
                  {STEP_LABELS[i]}
                </span>
                {i < 3 && <div className={cn("flex-1 h-px", step > s ? "bg-terra-500/40" : "bg-ink/10")} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-sand/60 shadow-sm">
            <div className="p-6 sm:p-8">
              {step === 1 && <Step1 form={form} onUpdate={update} />}
              {step === 2 && <Step2 form={form} onUpdate={update} />}
              {step === 3 && <Step3 form={form} onUpdate={update} onToggle={toggleInteresse} />}
              {step === 4 && <Step4 form={form} onUpdate={update} />}
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
                  onClick={() => setStep(s => Math.max(s - 1, 1) as FormStep)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink/50 hover:text-ink transition-colors px-3 py-2 rounded-xl hover:bg-ink/5"
                >
                  <ArrowLeft size={14} />
                  Terug
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  onClick={() => setStep(s => Math.min(s + 1, 4) as FormStep)}
                  disabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : !step3Valid}
                  className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:bg-ink/15 disabled:cursor-not-allowed text-white disabled:text-ink/35 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
                >
                  Volgende
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={view === "submitting"}
                  className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-terra-500/20"
                >
                  {view === "submitting" ? <Loader2 size={15} className="animate-spin" /> : <Calendar size={15} />}
                  Demo aanvragen
                </button>
              )}
            </div>
          </div>

          {/* Alternative contact */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-ink/40">
            <span>Liever direct contact?</span>
            <div className="flex items-center gap-3">
              <a href="mailto:hallo@bijeen.nl?subject=Demo aanvragen" className="inline-flex items-center gap-1.5 font-semibold text-terra-600 hover:underline">
                <Mail size={12} /> hallo@bijeen.nl
              </a>
              <a href="https://wa.me/31614470977" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-terra-600 hover:underline">
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Step 1: contact ──────────────────────────────────────────────────────────

function Step1({ form, onUpdate }: { form: FormData; onUpdate: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Wie bent u?</h2>
        <p className="text-sm text-ink/50">Zodat we weten met wie we straks spreken.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Naam" required>
          <input
            type="text" value={form.naam}
            onChange={e => onUpdate({ naam: e.target.value })}
            placeholder="Jouw naam" className={inputCls} autoFocus
          />
        </FieldGroup>
        <FieldGroup label="E-mailadres" required>
          <input
            type="email" value={form.email}
            onChange={e => onUpdate({ email: e.target.value })}
            placeholder="naam@organisatie.nl" className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Telefoonnummer" hint="Optioneel">
          <input
            type="tel" value={form.telefoon}
            onChange={e => onUpdate({ telefoon: e.target.value })}
            placeholder="06 12345678" className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Naam organisatie" required>
          <input
            type="text" value={form.organisatieNaam}
            onChange={e => onUpdate({ organisatieNaam: e.target.value })}
            placeholder="Stichting Welzijn Noord" className={inputCls}
          />
        </FieldGroup>
      </div>
    </div>
  );
}

// ── Step 2: organisatie ──────────────────────────────────────────────────────

function Step2({ form, onUpdate }: { form: FormData; onUpdate: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Over uw organisatie</h2>
        <p className="text-sm text-ink/50">Helpt ons de demo op maat voor te bereiden.</p>
      </div>

      <FieldGroup label="Type organisatie" required>
        <div className="flex flex-wrap gap-2">
          {ORG_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onUpdate({ organisatieType: type })}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all",
                form.organisatieType === type
                  ? "bg-terra-500 border-terra-500 text-white shadow-sm shadow-terra-500/25"
                  : "bg-cream border-sand text-ink/55 hover:border-terra-300 hover:text-terra-600",
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </FieldGroup>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Jouw functie" hint="Optioneel">
          <input
            type="text" value={form.functie}
            onChange={e => onUpdate({ functie: e.target.value })}
            placeholder="Bijv. Coördinator evenementen" className={inputCls}
          />
        </FieldGroup>
        <FieldGroup label="Aantal evenementen per jaar">
          <div className="flex flex-wrap gap-2 pt-0.5">
            {EVENTS_PER_JAAR.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onUpdate({ eventsPerJaar: id })}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
                  form.eventsPerJaar === id
                    ? "bg-terra-500 border-terra-500 text-white"
                    : "bg-cream border-sand text-ink/50 hover:border-terra-300 hover:text-terra-600",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}

// ── Step 3: behoefte ─────────────────────────────────────────────────────────

function Step3({
  form, onUpdate, onToggle,
}: {
  form: FormData;
  onUpdate: (p: Partial<FormData>) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Waar wilt u meer over weten?</h2>
        <p className="text-sm text-ink/50">Zo besteden we de 30 minuten aan wat voor jullie relevant is.</p>
      </div>

      <FieldGroup label="Interessegebieden" hint="Selecteer alles wat relevant is" required>
        <div className="flex flex-wrap gap-2 mt-1">
          {INTERESSES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all",
                form.interesses.includes(id)
                  ? "bg-terra-500 border-terra-500 text-white shadow-sm shadow-terra-500/25"
                  : "bg-cream border-sand text-ink/55 hover:border-terra-300 hover:text-terra-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Toelichting" hint="Optioneel — bijv. waar loop je nu tegenaan?">
        <textarea
          value={form.toelichting}
          onChange={e => onUpdate({ toelichting: e.target.value })}
          placeholder="Vertel kort waar je tegenaan loopt of wat je hoopt op te lossen..."
          rows={3}
          className={cn(inputCls, "resize-none")}
        />
      </FieldGroup>
    </div>
  );
}

// ── Step 4: planning ─────────────────────────────────────────────────────────

function Step4({ form, onUpdate }: { form: FormData; onUpdate: (p: Partial<FormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-ink mb-1 tracking-tight">Wanneer schikt het?</h2>
        <p className="text-sm text-ink/50">We nemen contact op om een moment te plannen dat jou uitkomt.</p>
      </div>

      <FieldGroup label="Voorkeursmoment">
        <div className="flex flex-wrap gap-2">
          {MOMENTEN.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onUpdate({ voorkeursmoment: id })}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all",
                form.voorkeursmoment === id
                  ? "bg-terra-500 border-terra-500 text-white shadow-sm shadow-terra-500/25"
                  : "bg-cream border-sand text-ink/55 hover:border-terra-300 hover:text-terra-600",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label="Gewenste week of datum" hint="Optioneel">
        <input
          type="text" value={form.gewensteWeek}
          onChange={e => onUpdate({ gewensteWeek: e.target.value })}
          placeholder="Bijv. week van 14 juli, of zo snel mogelijk"
          className={inputCls}
        />
      </FieldGroup>

      <label className="flex items-start gap-3 bg-terra-50 border border-terra-100 rounded-xl p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={form.sociaalTarief}
          onChange={e => onUpdate({ sociaalTarief: e.target.checked })}
          className="mt-0.5 accent-terra-500"
        />
        <span className="text-sm text-terra-700">
          <span className="font-bold">Wij zijn ANBI- of WMO-gefinancierd</span>
          <span className="block text-xs text-terra-600/80 mt-0.5">Vraag direct het Sociaal Tarief aan — 15% korting op alle betaalde plannen.</span>
        </span>
      </label>
    </div>
  );
}

// ── Success screen ───────────────────────────────────────────────────────────

function DoneScreen({ naam }: { naam: string }) {
  const firstName = naam.trim().split(" ")[0] || "";
  return (
    <div className="bg-cream min-h-screen pt-16 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-green-600" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
          Bedankt{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-ink/60 text-base leading-relaxed mb-8">
          Je aanvraag is ontvangen. We hebben een bevestiging naar je e-mail gestuurd en
          Vincent neemt binnen 1 werkdag persoonlijk contact met je op om een moment in te plannen.
        </p>
        <div className="bg-white rounded-2xl border border-sand/60 shadow-sm p-6 mb-8 text-left">
          <p className="text-xs font-bold text-terra-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles size={13} /> Wat je kunt verwachten
          </p>
          <ul className="space-y-2">
            {[
              "Persoonlijke rondleiding door de tool (~30 min)",
              "Jouw specifieke use case centraal",
              "Eerlijk antwoord of Bijeen bij jullie past",
              "Geen verkooppraatje, geen verplichtingen",
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink/60">
                <Check size={13} className="text-terra-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink/50 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          Terug naar de homepage
        </Link>
      </div>
    </div>
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
