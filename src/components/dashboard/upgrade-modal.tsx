"use client";

import { useState } from "react";
import { X, Check, Zap, Loader2 } from "lucide-react";
import { PLAN_FEATURES, PLAN_PRICES_CENTS } from "@/lib/plans";

const UPGRADE_PLANS = [
  { key: "welzijn",     name: "Welzijn",      badge: null,            popular: false },
  { key: "netwerk",     name: "Netwerk",       badge: "Meest gekozen", popular: true  },
  { key: "organisatie", name: "Organisatie",   badge: null,            popular: false },
] as const;

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ open, onClose, featureName }: UpgradeModalProps) {
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan);
    setError(null);
    try {
      const res = await fetch("/api/payments/multisafepay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error ?? "Betaallink aanmaken mislukt");
        setUpgrading(null);
      }
    } catch {
      setError("Netwerkfout — probeer opnieuw");
      setUpgrading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b border-sand/50">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={14} className="text-terra-500 fill-terra-500" />
              <span className="text-[11px] font-bold text-terra-500 uppercase tracking-widest">Pro feature</span>
            </div>
            <h2 className="text-xl font-extrabold text-ink tracking-tight">
              {featureName
                ? `${featureName} is beschikbaar in betaalde plannen`
                : "Upgrade je abonnement"}
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Kies het plan dat bij jouw organisatie past.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-sand transition-colors text-ink-muted shrink-0 ml-4"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {UPGRADE_PLANS.map(({ key, name, badge, popular }) => {
            const priceYearly = PLAN_PRICES_CENTS[key] / 100;
            const features = PLAN_FEATURES[key] ?? [];
            return (
              <div
                key={key}
                className={`relative rounded-2xl border-2 p-4 flex flex-col gap-3 transition-all ${
                  popular
                    ? "border-terra-400 bg-terra-50/30"
                    : "border-sand/70 bg-white"
                }`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terra-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    {badge}
                  </div>
                )}
                <div>
                  <p className="font-bold text-ink text-sm">{name}</p>
                  <p className="text-2xl font-extrabold text-ink mt-1 tracking-tight">
                    €{priceYearly.toLocaleString("nl")}
                    <span className="text-xs font-medium text-ink-muted">/jaar</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5 flex-1">
                  {features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ink-muted">
                      <Check size={11} className="text-terra-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={!!upgrading}
                  className={`mt-2 w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all disabled:opacity-60 ${
                    popular
                      ? "bg-terra-500 text-white hover:bg-terra-600 shadow-lg shadow-terra-500/20"
                      : "bg-ink text-white hover:bg-ink/85"
                  }`}
                >
                  {upgrading === key ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Bezig…
                    </>
                  ) : (
                    "Upgraden"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="px-6 pb-5 text-xs text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
