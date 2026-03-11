"use client";

import { useState } from "react";
import { Check, X, ChevronDown, Plus } from "lucide-react";

interface OrgPlanEditorProps {
  subscriptionId?: string;
  organizationId?: string;       // needed when creating new subscription
  currentPlan: string;
  currentStatus: string;
  currentExpiresAt: string | null;
  onSaved: () => void;
}

const PLANS = ["community", "welzijn", "netwerk", "organisatie", "platform", "trial", "starter", "groei"];
const STATUSES = ["active", "expired", "cancelled", "pending_payment"];
const STATUS_LABELS: Record<string, string> = {
  active: "Actief",
  expired: "Verlopen",
  cancelled: "Geannuleerd",
  pending_payment: "Betaling lopend",
};
const PLAN_LABELS: Record<string, string> = {
  community: "Community", welzijn: "Welzijn", netwerk: "Netwerk",
  organisatie: "Organisatie", platform: "Platform",
  trial: "Trial (legacy)", starter: "Starter (legacy)", groei: "Groei (legacy)",
};
const PLAN_PRICES: Record<string, number> = {
  community: 0, welzijn: 49000, netwerk: 129000, organisatie: 289000, platform: 0,
  trial: 0, starter: 59000, groei: 149000,
};

export function OrgPlanEditor({
  subscriptionId, organizationId, currentPlan, currentStatus, currentExpiresAt, onSaved,
}: OrgPlanEditorProps) {
  const isNew = !subscriptionId;

  const [plan, setPlan] = useState(currentPlan);
  const [status, setStatus] = useState(currentStatus);
  const [expiresAt, setExpiresAt] = useState(
    currentExpiresAt ? new Date(currentExpiresAt).toISOString().split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = isNew
        ? await fetch("/api/admin/organisaties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              organizationId,
              plan,
              status,
              expiresAt: expiresAt || null,
              amountPaid: PLAN_PRICES[plan] ?? null,
            }),
          })
        : await fetch("/api/admin/organisaties", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId,
              plan,
              status,
              expiresAt: expiresAt || null,
            }),
          });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Opslaan mislukt");
      } else {
        onSaved();
      }
    } catch {
      setError("Netwerkfout");
    } finally {
      setSaving(false);
    }
  }

  const changed = isNew
    ? true
    : plan !== currentPlan || status !== currentStatus ||
      (expiresAt || "") !== (currentExpiresAt ? new Date(currentExpiresAt).toISOString().split("T")[0] : "");

  return (
    <div className="mt-3 p-4 bg-black/3 border border-black/8 rounded-xl space-y-3">
      {isNew && (
        <div className="flex items-center gap-2 mb-1">
          <Plus size={12} className="text-emerald-600" />
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Nieuwe subscriptie aanmaken</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        {/* Plan */}
        <div>
          <label className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider block mb-1.5">Plan</label>
          <div className="relative">
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="w-full appearance-none bg-black/3 border border-black/8 rounded-lg px-3 py-2 text-sm text-[#1C1814] font-medium focus:outline-none focus:border-black/25 pr-8"
            >
              {PLANS.map(p => <option key={p} value={p} className="bg-white">{PLAN_LABELS[p]}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider block mb-1.5">Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full appearance-none bg-black/3 border border-black/8 rounded-lg px-3 py-2 text-sm text-[#1C1814] font-medium focus:outline-none focus:border-black/25 pr-8"
            >
              {STATUSES.map(s => <option key={s} value={s} className="bg-white">{STATUS_LABELS[s]}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
          </div>
        </div>

        {/* Expires */}
        <div>
          <label className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider block mb-1.5">Vervaldatum</label>
          <input
            type="date"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="w-full bg-black/3 border border-black/8 rounded-lg px-3 py-2 text-sm text-[#1C1814] font-medium focus:outline-none focus:border-black/25"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {changed && (
        <div className="flex items-center gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check size={12} />
            {saving ? "Opslaan..." : isNew ? "Aanmaken" : "Opslaan"}
          </button>
          {!isNew && (
            <button
              onClick={() => {
                setPlan(currentPlan);
                setStatus(currentStatus);
                setExpiresAt(currentExpiresAt ? new Date(currentExpiresAt).toISOString().split("T")[0] : "");
                setError("");
              }}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              <X size={12} />
              Annuleren
            </button>
          )}
        </div>
      )}
    </div>
  );
}
