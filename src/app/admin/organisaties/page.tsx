"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Building2, Search, ChevronDown, ChevronUp, RefreshCw,
  Download, Mail, Send, X, Check,
} from "lucide-react";
import { OrgPlanEditor } from "@/components/admin/org-plan-editor";
import { formatDate } from "@/lib/utils";

type OrgRow = {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
  customDomain: string | null;
  userId: string | null;
  createdAt: string | null;
  subscription: {
    id: string;
    plan: string;
    status: string | null;
    expiresAt: string | null;
    amountPaid: number | null;
    startsAt: string | null;
  } | null;
  eventCount: number;
  attendeeCount: number;
};

function adminAvatarColor(name: string): string {
  const colors = ["#C8522A", "#2D5A3D", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
  return colors[name.charCodeAt(0) % colors.length];
}
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function PlanBadge({ plan }: { plan: string }) {
  const cfg: Record<string, string> = {
    trial:       "bg-amber-500/15 text-amber-400 border-amber-500/20",
    starter:     "bg-blue-500/15 text-blue-400 border-blue-500/20",
    groei:       "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    organisatie: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  };
  const labels: Record<string, string> = {
    trial: "Trial", starter: "Starter", groei: "Groei", organisatie: "Organisatie",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${cfg[plan] ?? "bg-white/10 text-white/50 border-white/10"}`}>
      {labels[plan] ?? plan}
    </span>
  );
}

function StatusBadge({ status, expiresAt }: { status: string | null; expiresAt: string | null }) {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  if (expired || status === "expired" || status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Verlopen
      </span>
    );
  }
  if (status === "pending_payment") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />Betaling
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />Actief
    </span>
  );
}

function MailModal({
  org,
  onClose,
}: {
  org: OrgRow;
  onClose: () => void;
}) {
  // Try to derive email from userId / show input
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Betreft uw Bijeen account — ${org.name}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!to || !subject || !message) { setError("Vul alle velden in"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, orgName: org.name, subject, message }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Verzenden mislukt");
      } else {
        setSent(true);
        setTimeout(onClose, 1200);
      }
    } catch {
      setError("Netwerkfout");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1815] border border-white/12 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors">
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Mail size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Mail sturen naar</h2>
            <p className="text-xs text-white/40">{org.name}</p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
              <Check size={22} className="text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">Mail verstuurd!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Ontvanger e-mailadres</label>
              <input
                type="email"
                placeholder="naam@organisatie.nl"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Onderwerp</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Bericht</label>
              <textarea
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Schrijf hier je bericht..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={send}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 text-sm font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? "Versturen..." : "Verstuur mail"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminOrganisatiesPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("alle");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mailOrg, setMailOrg] = useState<OrgRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organisaties");
      const data = await res.json();
      setOrgs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const filtered = orgs.filter(org => {
    const matchSearch = org.name.toLowerCase().includes(search.toLowerCase()) ||
      (org.slug ?? "").toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === "alle" || org.subscription?.plan === filterPlan ||
      (filterPlan === "geen" && !org.subscription);
    return matchSearch && matchPlan;
  });

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/organisaties/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bijeen-organisaties-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Organisaties</h1>
          <p className="text-sm text-white/40 mt-1">
            {loading ? "Laden..." : `${orgs.length} organisaties`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <Download size={13} className={exporting ? "animate-bounce" : ""} />
            CSV
          </button>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Vernieuwen
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Zoek op naam of slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
          />
        </div>

        {["alle", "trial", "starter", "groei", "organisatie", "geen"].map(plan => (
          <button
            key={plan}
            onClick={() => setFilterPlan(plan)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all capitalize ${
              filterPlan === plan
                ? "bg-white/12 text-white border-white/20"
                : "bg-white/3 text-white/40 border-white/8 hover:text-white/60 hover:bg-white/6"
            }`}
          >
            {plan === "alle" ? "Alle" : plan.charAt(0).toUpperCase() + plan.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1A1815] border border-white/8 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_70px_70px_100px_36px_36px] gap-3 px-5 py-3 border-b border-white/8">
          {["Organisatie", "Plan", "Events", "Aanm.", "Status", "", ""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw size={20} className="text-white/20 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={28} className="text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/40">Geen organisaties gevonden</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(org => {
              const isExpanded = expandedId === org.id;
              const sub = org.subscription;

              return (
                <div key={org.id}>
                  <div className="grid grid-cols-[1fr_100px_70px_70px_100px_36px_36px] gap-3 px-5 py-4 hover:bg-white/2 transition-colors">
                    {/* Org name — click to expand */}
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : org.id)}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                        style={{ backgroundColor: adminAvatarColor(org.name) }}
                      >
                        {getInitials(org.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{org.name}</p>
                        <p className="text-[10px] text-white/30 truncate">
                          {org.slug ?? org.id.slice(0, 8)}
                          {org.customDomain && ` · ${org.customDomain}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center" onClick={() => setExpandedId(isExpanded ? null : org.id)}>
                      {sub ? <PlanBadge plan={sub.plan} /> : <span className="text-xs text-white/25">—</span>}
                    </div>

                    <div className="flex items-center" onClick={() => setExpandedId(isExpanded ? null : org.id)}>
                      <span className="text-sm font-semibold text-white">{org.eventCount}</span>
                    </div>

                    <div className="flex items-center" onClick={() => setExpandedId(isExpanded ? null : org.id)}>
                      <span className="text-sm font-semibold text-white">{org.attendeeCount}</span>
                    </div>

                    <div className="flex items-center" onClick={() => setExpandedId(isExpanded ? null : org.id)}>
                      {sub ? (
                        <StatusBadge status={sub.status} expiresAt={sub.expiresAt} />
                      ) : (
                        <span className="text-xs text-white/25">—</span>
                      )}
                    </div>

                    {/* Mail button */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setMailOrg(org)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="Mail sturen"
                      >
                        <Mail size={13} />
                      </button>
                    </div>

                    {/* Expand */}
                    <div
                      className="flex items-center justify-center cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : org.id)}
                    >
                      {isExpanded
                        ? <ChevronUp size={14} className="text-white/40" />
                        : <ChevronDown size={14} className="text-white/25" />
                      }
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 bg-white/[0.01] border-t border-white/5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 mb-1">
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Aangemeld</p>
                          <p className="text-xs text-white font-medium">
                            {org.createdAt ? formatDate(org.createdAt, "d MMM yyyy") : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Betaald</p>
                          <p className="text-xs text-white font-medium">
                            {sub?.amountPaid ? `€${(sub.amountPaid / 100).toLocaleString("nl-NL")}` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Verloopt</p>
                          <p className="text-xs text-white font-medium">
                            {sub?.expiresAt ? formatDate(sub.expiresAt, "d MMM yyyy") : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">User ID</p>
                          <p className="text-[10px] text-white/40 font-mono truncate">{org.userId ?? "—"}</p>
                        </div>
                      </div>

                      {sub ? (
                        <OrgPlanEditor
                          subscriptionId={sub.id}
                          currentPlan={sub.plan}
                          currentStatus={sub.status ?? "active"}
                          currentExpiresAt={sub.expiresAt}
                          onSaved={() => { setExpandedId(null); setRefreshKey(k => k + 1); }}
                        />
                      ) : (
                        <OrgPlanEditor
                          organizationId={org.id}
                          currentPlan="trial"
                          currentStatus="active"
                          currentExpiresAt={null}
                          onSaved={() => { setExpandedId(null); setRefreshKey(k => k + 1); }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-white/25 text-center mt-4">
          {filtered.length} van {orgs.length} organisaties
        </p>
      )}

      {mailOrg && <MailModal org={mailOrg} onClose={() => setMailOrg(null)} />}
    </div>
  );
}
