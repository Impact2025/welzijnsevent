"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Check, Building2, Sparkles, Loader2,
  Upload, X, User, Phone, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";
import { PLAN_FEATURES, PLAN_LIMITS } from "@/lib/plans";

const PLANS = [
  {
    key: "community",
    name: "Community",
    price: "€0",
    period: "altijd gratis",
    badge: null,
    highlight: false,
  },
  {
    key: "welzijn",
    name: "Welzijn",
    price: "€490",
    period: "/jaar",
    badge: null,
    highlight: false,
    hint: "Ideaal voor 3–10 events/jaar",
  },
  {
    key: "netwerk",
    name: "Netwerk",
    price: "€1.290",
    period: "/jaar",
    badge: "Meest gekozen",
    highlight: true,
    hint: "Voor groeiende organisaties",
  },
  {
    key: "organisatie",
    name: "Organisatie",
    price: "€2.890",
    period: "/jaar",
    badge: null,
    highlight: false,
    hint: "Onbeperkt, dedicated support",
    demoUrl: "mailto:hello@bijeen.app?subject=Demo aanvragen — Organisatie plan",
  },
];

const ORG_TYPES = [
  { key: "welzijn", label: "Welzijnsorganisatie" },
  { key: "gemeente", label: "Gemeente / Overheid" },
  { key: "netwerk", label: "Netwerk / Koepel" },
  { key: "anders", label: "Anders" },
];

const ROLES = [
  { key: "coordinator", label: "Eventcoördinator" },
  { key: "manager", label: "Manager / Directeur" },
  { key: "vrijwilliger", label: "Vrijwilliger" },
  { key: "anders", label: "Anders" },
];

const EVENTS_PER_YEAR = [
  { key: "1-2", label: "1–2" },
  { key: "3-10", label: "3–10" },
  { key: "11-24", label: "11–24" },
  { key: "25+", label: "25+" },
];

function suggestPlan(eventsPerYear: string): string {
  if (eventsPerYear === "1-2") return "community";
  if (eventsPerYear === "3-10") return "welzijn";
  if (eventsPerYear === "11-24") return "netwerk";
  if (eventsPerYear === "25+") return "organisatie";
  return "netwerk";
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
            value === opt.key
              ? "border-terra-500 bg-terra-50 text-terra-700"
              : "border-sand bg-white text-ink-muted hover:border-terra-300 hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StepBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Organisatie" },
    { n: 2, label: "Profiel" },
    { n: 3, label: "Abonnement" },
  ];
  return (
    <div className="flex items-start gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          {i > 0 && (
            <div
              className={`h-0.5 w-10 mt-3 transition-colors ${step > s.n - 1 ? "bg-terra-500" : "bg-sand"}`}
            />
          )}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                step > s.n
                  ? "bg-terra-500 text-white"
                  : step === s.n
                  ? "bg-terra-500 text-white ring-4 ring-terra-500/20"
                  : "bg-sand text-ink-muted"
              }`}
            >
              {step > s.n ? <Check size={11} /> : s.n}
            </div>
            <span
              className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                step >= s.n ? "text-terra-600" : "text-ink-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  // Step 1
  const [orgName, setOrgName] = useState("");
  const [logo, setLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [orgType, setOrgType] = useState<string>("");
  const [contactRole, setContactRole] = useState<string>("");
  const [eventsPerYear, setEventsPerYear] = useState<string>("");
  const [phone, setPhone] = useState("");

  // Step 3
  const [selectedPlan, setSelectedPlan] = useState("netwerk");

  // Meta
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    fetch("/api/organizations")
      .then(r => r.json())
      .then(d => {
        if (d.organization) router.replace("/dashboard");
        else setCheckingExisting(false);
      })
      .catch(() => setCheckingExisting(false));
  }, [router]);

  function goToStep3() {
    if (eventsPerYear) setSelectedPlan(suggestPlan(eventsPerYear));
    setStep(3);
  }

  const handleLogoUpload = async (file: File) => {
    setLogoError("");
    setLogoUploading(true);
    setLogoPreview(URL.createObjectURL(file));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogo(data.url);
    } catch (err: unknown) {
      setLogoError(err instanceof Error ? err.message : "Upload mislukt");
      setLogoPreview("");
      setLogo("");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgName.trim(),
          logo: logo.trim() || null,
          plan: selectedPlan,
          phone: phone.trim() || null,
          orgType: orgType || null,
          eventsPerYear: eventsPerYear || null,
          contactRole: contactRole || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-terra-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-sand">
        <BijeenWordmark variant="dark" size="md" />
        <StepBar step={step} />
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-lg">

          {/* ── Step 1: Organisatie ──────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-terra-100 flex items-center justify-center mb-4">
                  <Building2 size={22} className="text-terra-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">Welkom bij Bijeen</h1>
                <p className="text-ink-muted text-sm">Laten we je account inrichten. Eerst: je organisatie.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                    Naam van je organisatie <span className="text-terra-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && orgName.trim() && setStep(2)}
                    placeholder="bijv. Humanitas Utrecht"
                    autoFocus
                    className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-300 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                    Logo <span className="text-ink-muted/50 font-normal normal-case">(optioneel)</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                  />
                  {logoPreview ? (
                    <div className="flex items-center gap-3 bg-white border border-sand rounded-xl px-4 py-3">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain rounded"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        {logoUploading ? (
                          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                            <Loader2 size={14} className="animate-spin" /> Uploaden…
                          </span>
                        ) : logoError ? (
                          <span className="text-sm text-red-500">{logoError}</span>
                        ) : (
                          <span className="text-sm text-green-600 font-medium">Logo geüpload</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLogo(""); setLogoPreview(""); setLogoError("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-ink-muted hover:text-ink transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-sand hover:border-terra-300 rounded-xl px-4 py-4 text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                      <Upload size={16} />
                      Klik om een logo te uploaden
                      <span className="text-xs text-ink-muted/60">PNG, JPG, SVG · max 2 MB</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!orgName.trim()}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Volgende stap
                <ArrowRight size={16} />
              </button>

              <p className="text-center text-xs text-ink-muted mt-5">
                Gebruikt door 200+ welzijns&shy;organisaties in Nederland
              </p>
            </div>
          )}

          {/* ── Step 2: Profiel ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-terra-100 flex items-center justify-center mb-4">
                  <User size={22} className="text-terra-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">Even voorstellen</h1>
                <p className="text-ink-muted text-sm">
                  Zodat we Bijeen goed op jou kunnen afstemmen.
                  <span className="ml-1 text-ink-muted/60">Je kunt alles overslaan.</span>
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                    Wat voor organisatie zijn jullie?
                  </label>
                  <PillGroup
                    options={ORG_TYPES}
                    value={orgType}
                    onChange={setOrgType}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                    Jouw rol
                  </label>
                  <PillGroup
                    options={ROLES}
                    value={contactRole}
                    onChange={setContactRole}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                    Hoeveel events organiseer je per jaar?
                  </label>
                  <PillGroup
                    options={EVENTS_PER_YEAR}
                    value={eventsPerYear}
                    onChange={setEventsPerYear}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                    Telefoonnummer
                    <span className="ml-2 font-normal normal-case text-ink-muted/60">optioneel</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full bg-white border border-sand rounded-xl pl-9 pr-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-300 transition"
                    />
                  </div>
                  <p className="text-xs text-ink-muted mt-1.5">
                    Voor een gratis onboarding-call van 15 minuten — wij nemen contact op.
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={goToStep3}
                  className="w-full flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  Kies je abonnement
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-ink-muted hover:text-ink transition-colors py-2"
                >
                  Terug
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Abonnement ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-terra-100 flex items-center justify-center mb-4">
                  <Sparkles size={22} className="text-terra-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">Kies je plan</h1>
                <p className="text-ink-muted text-sm">
                  {eventsPerYear
                    ? `Op basis van jouw ${eventsPerYear} events per jaar raden we het volgende aan.`
                    : `Je kiest voor ${orgName}. Welk abonnement past het best?`}
                </p>
              </div>

              <div className="space-y-3">
                {PLANS.map(plan => {
                  const limits = PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS];
                  const features = PLAN_FEATURES[plan.key] ?? [];
                  const active = selectedPlan === plan.key;
                  const suggested = eventsPerYear && suggestPlan(eventsPerYear) === plan.key;

                  return (
                    <div key={plan.key}>
                      <button
                        onClick={() => setSelectedPlan(plan.key)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                          active
                            ? "border-terra-500 bg-terra-50"
                            : "border-sand bg-white hover:border-terra-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                active ? "border-terra-500" : "border-sand"
                              }`}
                            >
                              {active && <div className="w-2 h-2 rounded-full bg-terra-500" />}
                            </div>
                            <div>
                              <span className="font-bold text-ink text-sm">{plan.name}</span>
                              {plan.badge && (
                                <span className="ml-2 text-[10px] font-bold text-terra-600 bg-terra-100 px-1.5 py-0.5 rounded-full">
                                  {plan.badge}
                                </span>
                              )}
                              {suggested && !active && (
                                <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                                  Aanbevolen
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-ink">{plan.price}</span>
                            <span className="text-xs text-ink-muted"> {plan.period}</span>
                          </div>
                        </div>
                        {"hint" in plan && plan.hint && (
                          <p className="ml-6 text-xs text-ink-muted mb-1.5">{plan.hint}</p>
                        )}
                        <ul className="ml-6 space-y-0.5">
                          {features.slice(0, 4).map(f => (
                            <li key={f} className="text-xs text-ink-muted flex items-center gap-1.5">
                              <Check size={10} className="text-terra-500 shrink-0" />
                              {f}
                            </li>
                          ))}
                          {features.length > 4 && (
                            <li className="text-xs text-ink-muted/60 ml-4">
                              +{features.length - 4} meer...
                            </li>
                          )}
                        </ul>
                      </button>

                      {"demoUrl" in plan && plan.demoUrl && (
                        <a
                          href={plan.demoUrl}
                          className="flex items-center justify-center gap-1.5 text-xs text-ink-muted hover:text-terra-600 transition-colors py-1.5"
                        >
                          <ChevronRight size={12} />
                          Of vraag een persoonlijke demo aan
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Even geduld…</>
                  ) : selectedPlan === "community" ? (
                    <><Check size={16} /> Gratis starten</>
                  ) : (
                    <><ArrowRight size={16} /> Verder naar betaling</>
                  )}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full text-center text-sm text-ink-muted hover:text-ink transition-colors py-2"
                >
                  Terug
                </button>
              </div>

              {selectedPlan !== "community" && (
                <p className="text-center text-xs text-ink-muted mt-4">
                  Jaarlijkse betaling via MultiSafePay · Veilig &amp; AVG-compliant · Opzegbaar
                </p>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
