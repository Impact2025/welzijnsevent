"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Check, Building2, Sparkles, Loader2 } from "lucide-react";
import { PLAN_FEATURES, PLAN_LIMITS } from "@/lib/plans";

const PLANS = [
  {
    key: "trial",
    name: "Probeer gratis",
    price: "€0",
    period: "14 dagen",
    highlight: false,
    badge: null,
  },
  {
    key: "starter",
    name: "Starter",
    price: "€590",
    period: "/jaar",
    highlight: false,
    badge: null,
  },
  {
    key: "groei",
    name: "Groei",
    price: "€1.490",
    period: "/jaar",
    highlight: true,
    badge: "Meest gekozen",
  },
  {
    key: "organisatie",
    name: "Organisatie",
    price: "€3.490",
    period: "/jaar",
    highlight: false,
    badge: null,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [logo, setLogo] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("groei");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    // Redirect to dashboard if org already exists
    fetch("/api/organizations")
      .then(r => r.json())
      .then(d => {
        if (d.organization) router.replace("/dashboard");
        else setCheckingExisting(false);
      })
      .catch(() => setCheckingExisting(false));
  }, [router]);

  const handleComplete = async () => {
    if (!orgName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName.trim(), logo: logo.trim() || null, plan: selectedPlan }),
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
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/30">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-ink text-base tracking-tight">Bijeen</span>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > s ? "bg-terra-500 text-white" :
                step === s ? "bg-terra-500 text-white" :
                "bg-sand text-ink-muted"
              }`}>
                {step > s ? <Check size={12} /> : s}
              </div>
              {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-terra-500" : "bg-sand"}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-lg">

          {/* Step 1: Organisation */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-terra-100 flex items-center justify-center mb-4">
                  <Building2 size={22} className="text-terra-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">Welkom bij Bijeen</h1>
                <p className="text-ink-muted">Laten we je account inrichten. Eerst: je organisatie.</p>
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
                    Logo URL <span className="text-ink-muted/50 font-normal normal-case">(optioneel)</span>
                  </label>
                  <input
                    type="text"
                    value={logo}
                    onChange={e => setLogo(e.target.value)}
                    placeholder="https://jouworganisatie.nl/logo.png"
                    className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-sm text-ink outline-none placeholder-ink-muted/40 focus:ring-2 focus:ring-terra-500/30 focus:border-terra-300 transition"
                  />
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
            </div>
          )}

          {/* Step 2: Plan kiezen */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-terra-100 flex items-center justify-center mb-4">
                  <Sparkles size={22} className="text-terra-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink mb-2">Kies je plan</h1>
                <p className="text-ink-muted">
                  Je kiest voor <span className="font-semibold text-ink">{orgName}</span>.
                  Welk abonnement past bij jullie?
                </p>
              </div>

              <div className="space-y-3">
                {PLANS.map(plan => {
                  const limits = PLAN_LIMITS[plan.key as keyof typeof PLAN_LIMITS];
                  const features = PLAN_FEATURES[plan.key] ?? [];
                  const active = selectedPlan === plan.key;

                  return (
                    <button
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                        active
                          ? "border-terra-500 bg-terra-50"
                          : "border-sand bg-white hover:border-terra-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                            active ? "border-terra-500" : "border-sand"
                          }`}>
                            {active && <div className="w-2 h-2 rounded-full bg-terra-500" />}
                          </div>
                          <div>
                            <span className="font-bold text-ink text-sm">{plan.name}</span>
                            {plan.badge && (
                              <span className="ml-2 text-[10px] font-bold text-terra-600 bg-terra-100 px-1.5 py-0.5 rounded-full">
                                {plan.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-ink">{plan.price}</span>
                          <span className="text-xs text-ink-muted">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="ml-6 space-y-0.5">
                        {features.map(f => (
                          <li key={f} className="text-xs text-ink-muted flex items-center gap-1.5">
                            <Check size={10} className="text-terra-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
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
                    <><Loader2 size={16} className="animate-spin" /> Even geduld...</>
                  ) : selectedPlan === "trial" ? (
                    <><Check size={16} /> Gratis starten</>
                  ) : (
                    <><ArrowRight size={16} /> Verder naar betaling</>
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-ink-muted hover:text-ink transition-colors py-2"
                >
                  Terug
                </button>
              </div>

              {selectedPlan !== "trial" && (
                <p className="text-center text-xs text-ink-muted mt-4">
                  Jaarlijkse betaling via MultiSafePay. Je kunt altijd opzeggen.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
