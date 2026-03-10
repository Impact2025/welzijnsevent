"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

type LogEntry = {
  id: string;
  adminEmail: string;
  action: string;
  targetOrgId: string | null;
  targetOrgName: string | null;
  previousValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  note: string | null;
  createdAt: string;
};

const ACTION_CFG: Record<string, { label: string; color: string }> = {
  subscription_update: { label: "Subscriptie gewijzigd", color: "bg-amber-500/12 text-amber-400 border-amber-500/20" },
  subscription_create: { label: "Subscriptie aangemaakt", color: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20" },
  subscription_delete: { label: "Subscriptie verwijderd", color: "bg-red-500/12 text-red-400 border-red-500/20" },
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial", starter: "Starter", groei: "Groei", organisatie: "Organisatie",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Actief", expired: "Verlopen", cancelled: "Geannuleerd", pending_payment: "Betaling lopend",
};

function formatValue(v: Record<string, unknown> | null) {
  if (!v) return null;
  const parts: string[] = [];
  if (v.plan) parts.push(`Plan: ${PLAN_LABELS[v.plan as string] ?? v.plan}`);
  if (v.status) parts.push(`Status: ${STATUS_LABELS[v.status as string] ?? v.status}`);
  if (v.expiresAt) parts.push(`Verloopt: ${new Date(v.expiresAt as string).toLocaleDateString("nl-NL")}`);
  if (v.amountPaid) parts.push(`Betaald: €${((v.amountPaid as number) / 100).toFixed(0)}`);
  return parts.join(" · ") || JSON.stringify(v);
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) +
    " " + date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-log");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">Audit Log</h1>
          <p className="text-sm text-[#9E9890] mt-1">
            {loading ? "Laden..." : `${logs.length} acties`}
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          className="flex items-center gap-2 bg-black/4 hover:bg-black/8 border border-black/8 text-[#6B5E54] hover:text-[#1C1814] text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Vernieuwen
        </button>
      </div>

      <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[180px_1fr_160px_36px] gap-4 px-5 py-3 border-b border-black/8">
          {["Tijdstip", "Actie / Organisatie", "Wijziging", ""].map(h => (
            <span key={h} className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw size={20} className="text-black/20 animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Shield size={28} className="text-black/15 mx-auto mb-3" />
            <p className="text-sm text-[#9E9890]">Nog geen acties gelogd</p>
            <p className="text-xs text-[#9E9890] mt-1">Acties worden hier zichtbaar zodra wijzigingen worden opgeslagen</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {logs.map(log => {
              const cfg = ACTION_CFG[log.action] ?? { label: log.action, color: "bg-black/5 text-[#9E9890] border-black/8" };
              const isExpanded = expandedId === log.id;
              const prev = formatValue(log.previousValue);
              const next = formatValue(log.newValue);

              return (
                <div key={log.id}>
                  <div
                    className="grid grid-cols-[180px_1fr_160px_36px] gap-4 px-5 py-4 hover:bg-black/2 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div>
                      <p className="text-xs text-[#6B5E54] font-mono">{formatDate(log.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#1C1814] mb-1">{log.targetOrgName ?? log.targetOrgId ?? "—"}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="min-w-0">
                      {next && (
                        <p className="text-[11px] text-[#9E9890] truncate">{next}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {isExpanded
                        ? <ChevronUp size={13} className="text-[#9E9890]" />
                        : <ChevronDown size={13} className="text-[#9E9890]" />
                      }
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 bg-black/[0.01] border-t border-black/6">
                      <div className="grid grid-cols-2 gap-6 mt-4">
                        {prev && (
                          <div>
                            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider mb-2">Vorige waarde</p>
                            <p className="text-xs text-[#6B5E54] font-mono bg-black/3 rounded-lg px-3 py-2 border border-black/8">{prev}</p>
                          </div>
                        )}
                        {next && (
                          <div>
                            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider mb-2">Nieuwe waarde</p>
                            <p className="text-xs text-emerald-700 font-mono bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">{next}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-[10px] text-[#9E9890] font-mono">Admin: {log.adminEmail} · ID: {log.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && logs.length > 0 && (
        <p className="text-xs text-[#9E9890] text-center mt-4">
          Laatste {logs.length} acties (max 200)
        </p>
      )}
    </div>
  );
}
