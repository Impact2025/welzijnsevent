"use client";

import { useState } from "react";
import {
  Sparkles, AlertTriangle, TrendingUp, Lightbulb,
  Activity, RefreshCw, ChevronRight, Star,
} from "lucide-react";

type Insights = {
  platformGezondheid: {
    score: number;
    status: "gezond" | "aandacht_nodig" | "kritiek";
    samenvatting: string;
    sterktes: string[];
    zwaktes: string[];
  };
  churnRisicos: {
    orgNaam: string;
    reden: string;
    urgentie: "hoog" | "gemiddeld" | "laag";
    actie: string;
  }[];
  groeikansen: {
    orgNaam: string;
    kans: string;
    upgradeWaarde: number;
    actie: string;
  }[];
  featureAdoptie: {
    samenvatting: string;
    aanbevolen: string[];
  };
  aanbevelingen: {
    prioriteit: "hoog" | "gemiddeld" | "laag";
    categorie: "product" | "sales" | "support" | "marketing";
    titel: string;
    aanbeveling: string;
    verwachtImpact: string;
  }[];
};

const URGENCY_COLORS = {
  hoog:     "bg-red-500/12 border-red-500/20 text-red-400",
  gemiddeld:"bg-amber-500/12 border-amber-500/20 text-amber-400",
  laag:     "bg-blue-500/12 border-blue-500/20 text-blue-400",
};

const CAT_COLORS = {
  product:  "bg-purple-500/15 text-purple-400",
  sales:    "bg-emerald-500/15 text-emerald-400",
  support:  "bg-blue-500/15 text-blue-400",
  marketing:"bg-orange-500/15 text-orange-400",
};

const HEALTH_COLORS = {
  gezond:         { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20", bar: "bg-emerald-500" },
  aandacht_nodig: { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/20",   bar: "bg-amber-500" },
  kritiek:        { bg: "bg-red-500/15",      text: "text-red-400",     border: "border-red-500/20",     bar: "bg-red-500" },
};

export default function AdminAIInzichtenPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastRun, setLastRun] = useState<Date | null>(null);

  async function analyse() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ai-inzichten", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analyse mislukt");
      } else {
        setInsights(data);
        setLastRun(new Date());
      }
    } catch {
      setError("Netwerkfout — probeer opnieuw");
    } finally {
      setLoading(false);
    }
  }

  const health = insights?.platformGezondheid;
  const healthCfg = health ? HEALTH_COLORS[health.status] : null;

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">AI Inzichten</h1>
          <p className="text-sm text-[#9E9890] mt-1">
            Platform analyse via Gemini AI
            {lastRun && (
              <span className="ml-2 text-[#9E9890]">
                · Laatste analyse: {lastRun.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={analyse}
          disabled={loading}
          className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-[#1C1814] text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Analyseren...
            </>
          ) : (
            <>
              <Sparkles size={15} className="fill-white/80" />
              {insights ? "Opnieuw analyseren" : "Analyseer platform"}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!insights && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-5">
            <Sparkles size={28} className="text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-[#1C1814] mb-2">Platform Intelligence</h2>
          <p className="text-sm text-[#9E9890] max-w-sm leading-relaxed">
            Klik op "Analyseer platform" voor een real-time AI analyse van churn risico's,
            groeikansen en aanbevelingen op basis van live platformdata.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-black/8 rounded-2xl p-5 animate-pulse">
              <div className="h-3 bg-black/4 rounded-full w-32 mb-4" />
              <div className="h-5 bg-black/5 rounded-full w-2/3 mb-2" />
              <div className="h-4 bg-black/4 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {insights && !loading && (
        <div className="space-y-6">

          {/* Platform Health */}
          {health && healthCfg && (
            <div className={`bg-white border ${healthCfg.border} rounded-2xl p-6`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${healthCfg.bg} flex items-center justify-center`}>
                    <Activity size={18} className={healthCfg.text} />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1C1814] text-sm">Platform Gezondheid</h2>
                    <p className={`text-xs font-semibold ${healthCfg.text} capitalize`}>
                      {health.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-[#1C1814]">{health.score}<span className="text-[#9E9890] text-lg">/10</span></div>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-2 bg-black/4 rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${healthCfg.bar}`}
                  style={{ width: `${health.score * 10}%` }}
                />
              </div>

              <p className="text-sm text-[#6B5E54] leading-relaxed mb-4">{health.samenvatting}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {health.sterktes?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Sterktes</p>
                    <ul className="space-y-1">
                      {health.sterktes.map((s, i) => (
                        <li key={i} className="text-xs text-[#6B5E54] flex items-start gap-2">
                          <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {health.zwaktes?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Aandachtspunten</p>
                    <ul className="space-y-1">
                      {health.zwaktes.map((z, i) => (
                        <li key={i} className="text-xs text-[#6B5E54] flex items-start gap-2">
                          <span className="text-red-400 shrink-0 mt-0.5">!</span>
                          {z}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Churn Risico's */}
            {insights.churnRisicos?.length > 0 && (
              <div className="bg-white border border-black/8 rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={15} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1C1814]">Churn Risico's</h2>
                    <p className="text-[10px] text-[#9E9890]">{insights.churnRisicos.length} organisaties</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {insights.churnRisicos.map((r, i) => (
                    <div key={i} className={`p-3.5 rounded-xl border ${URGENCY_COLORS[r.urgentie] ?? URGENCY_COLORS.laag}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-[#1C1814]">{r.orgNaam}</p>
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-80">
                          {r.urgentie}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B5E54] mb-2 leading-relaxed">{r.reden}</p>
                      <div className="flex items-start gap-1.5">
                        <ChevronRight size={11} className="shrink-0 mt-0.5 opacity-60" />
                        <p className="text-xs text-white/80 font-medium leading-relaxed">{r.actie}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groeikansen */}
            {insights.groeikansen?.length > 0 && (
              <div className="bg-white border border-black/8 rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp size={15} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1C1814]">Groeikansen</h2>
                    <p className="text-[10px] text-[#9E9890]">{insights.groeikansen.length} kansen</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {insights.groeikansen.map((k, i) => (
                    <div key={i} className="p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/15">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-[#1C1814]">{k.orgNaam}</p>
                        {k.upgradeWaarde > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            +€{k.upgradeWaarde.toLocaleString("nl-NL")}/jr
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5E54] mb-2 leading-relaxed">{k.kans}</p>
                      <div className="flex items-start gap-1.5">
                        <ChevronRight size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-white/80 font-medium leading-relaxed">{k.actie}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Feature Adoptie */}
          {insights.featureAdoptie && (
            <div className="bg-white border border-black/8 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Star size={15} className="text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-[#1C1814]">Feature Adoptie</h2>
              </div>
              <p className="text-sm text-[#6B5E54] leading-relaxed mb-4">{insights.featureAdoptie.samenvatting}</p>
              {insights.featureAdoptie.aanbevolen?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {insights.featureAdoptie.aanbevolen.map((f, i) => (
                    <span key={i} className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-3 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aanbevelingen */}
          {insights.aanbevelingen?.length > 0 && (
            <div className="bg-white border border-black/8 rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lightbulb size={15} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1C1814]">Aanbevelingen</h2>
                  <p className="text-[10px] text-[#9E9890]">Prioriteit acties</p>
                </div>
              </div>
              <div className="space-y-3">
                {insights.aanbevelingen.sort((a, b) => {
                  const order = { hoog: 0, gemiddeld: 1, laag: 2 };
                  return (order[a.prioriteit] ?? 2) - (order[b.prioriteit] ?? 2);
                }).map((a, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/3 border border-black/8 hover:border-black/10 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs font-bold text-[#1C1814]">{a.titel}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${CAT_COLORS[a.categorie] ?? "bg-white/10 text-[#9E9890]"}`}>
                          {a.categorie}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${URGENCY_COLORS[a.prioriteit]}`}>
                          {a.prioriteit}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B5E54] leading-relaxed mb-2">{a.aanbeveling}</p>
                    <p className="text-[10px] text-[#9E9890] italic">Impact: {a.verwachtImpact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
