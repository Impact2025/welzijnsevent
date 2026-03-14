"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Building2, Calendar, Users, Euro, Clock, Mail,
  ExternalLink, RefreshCw, Send, X, Check, Shield, TrendingUp,
} from "lucide-react";
import { OrgPlanEditor } from "@/components/admin/org-plan-editor";

function adminAvatarColor(name: string) {
  const colors = ["#C8522A", "#2D5A3D", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
  return colors[name.charCodeAt(0) % colors.length];
}
function getInitials(name: string) {
  return name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
}
function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

const PLAN_LABELS: Record<string, string> = {
  trial: "Trial", starter: "Starter", groei: "Groei", organisatie: "Organisatie",
};
const PLAN_COLORS: Record<string, string> = {
  trial: "bg-amber-50 text-amber-700 border-amber-200",
  starter: "bg-blue-50 text-blue-700 border-blue-200",
  groei: "bg-emerald-50 text-emerald-700 border-emerald-200",
  organisatie: "bg-purple-50 text-purple-700 border-purple-200",
};
const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  draft:     { label: "Concept",   color: "bg-gray-100 text-gray-500" },
  published: { label: "Gepubliceerd", color: "bg-blue-50 text-blue-600" },
  live:      { label: "Live",      color: "bg-green-50 text-green-600" },
  ended:     { label: "Afgelopen", color: "bg-gray-50 text-gray-400" },
};

type OrgDetail = {
  org: { id: string; name: string; slug: string | null; logo: string | null; phone: string | null; orgType: string | null; eventsPerYear: string | null; contactRole: string | null; userId: string | null; createdAt: string | null; primaryColor: string | null };
  subscription: { id: string; plan: string; status: string | null; expiresAt: string | null; startsAt: string | null; amountPaid: number | null } | null;
  subscriptionHistory: { id: string; plan: string; status: string | null; startsAt: string | null; expiresAt: string | null; amountPaid: number | null; createdAt: string | null }[];
  events: { id: string; title: string; status: string | null; startsAt: string; endsAt: string; location: string | null; attendeeCount: number }[];
  totalAttendees: number;
  auditLog: { id: string; adminEmail: string; action: string; newValue: unknown; createdAt: string | null }[];
};

function MailModal({ orgName, onClose }: { orgName: string; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Betreft uw Bijeen account — ${orgName}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!to || !message) { setError("Vul alle velden in"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, orgName, subject, message }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Mislukt"); }
      else { setSent(true); setTimeout(onClose, 1500); }
    } catch { setError("Netwerkfout"); }
    finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={16} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Mail size={16} className="text-blue-600" /></div>
          <div><h2 className="text-sm font-bold text-[#1C1814]">Mail sturen</h2><p className="text-xs text-[#9E9890]">{orgName}</p></div>
        </div>
        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center"><Check size={22} className="text-emerald-600" /></div>
            <p className="text-sm font-semibold">Verstuurd!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="email" placeholder="E-mailadres ontvanger" value={to} onChange={e => setTo(e.target.value)} className="w-full bg-black/4 border border-black/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/20" />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-black/4 border border-black/8 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black/20" />
            <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Bericht..." className="w-full bg-black/4 border border-black/8 rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-black/20" />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={send} disabled={sending} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              <Send size={14} />{sending ? "Versturen..." : "Verstuur"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrgDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMail, setShowMail] = useState(false);
  const [editPlan, setEditPlan] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organisaties/${params.id}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <RefreshCw size={22} className="animate-spin text-[#9E9890]" />
    </div>
  );

  if (!data) return (
    <div className="px-6 py-7 text-center text-[#9E9890]">
      <p>Organisatie niet gevonden.</p>
      <Link href="/admin/organisaties" className="text-sm font-semibold text-[#C8522A] hover:underline mt-3 inline-block">← Terug</Link>
    </div>
  );

  const { org, subscription, subscriptionHistory, events, totalAttendees, auditLog } = data;
  const isActive = subscription?.status === "active" && (!subscription.expiresAt || new Date(subscription.expiresAt) > new Date());
  const totalRevenue = subscriptionHistory.filter(s => s.amountPaid).reduce((a, s) => a + (s.amountPaid ?? 0), 0);

  return (
    <div className="px-6 py-7 max-w-5xl mx-auto">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/admin/organisaties" className="flex items-center gap-1.5 text-xs text-[#9E9890] hover:text-[#6B5E54] transition-colors mb-4 w-fit">
          <ArrowLeft size={13} /> Alle organisaties
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-14 h-14 rounded-2xl object-cover border border-black/8 shadow-sm" />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-sm" style={{ backgroundColor: adminAvatarColor(org.name) }}>
                {getInitials(org.name)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold text-[#1C1814] tracking-tight">{org.name}</h1>
              <p className="text-sm text-[#9E9890] mt-0.5">
                {org.slug && <span className="font-mono">/{org.slug}</span>}
                {org.orgType && <> · {org.orgType}</>}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {subscription && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PLAN_COLORS[subscription.plan] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {PLAN_LABELS[subscription.plan] ?? subscription.plan}
                  </span>
                )}
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${isActive ? "text-emerald-600" : "text-red-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  {isActive ? "Actief" : "Inactief"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/dashboard`}
              target="_blank"
              className="flex items-center gap-1.5 bg-black/4 hover:bg-black/6 border border-black/8 text-[#6B5E54] text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <ExternalLink size={12} /> Open app
            </Link>
            <button
              onClick={() => setShowMail(true)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <Mail size={12} /> Mail sturen
            </button>
            <button
              onClick={() => setEditPlan(p => !p)}
              className="flex items-center gap-1.5 bg-[#C8522A]/10 hover:bg-[#C8522A]/20 border border-[#C8522A]/20 text-[#C8522A] text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              <TrendingUp size={12} /> Plan wijzigen
            </button>
          </div>
        </div>
      </div>

      {/* Plan editor */}
      {editPlan && (
        <div className="bg-white border border-black/8 rounded-2xl p-5 mb-5 shadow-sm">
          <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest mb-4">Abonnement beheren</p>
          {subscription ? (
            <OrgPlanEditor
              subscriptionId={subscription.id}
              currentPlan={subscription.plan}
              currentStatus={subscription.status ?? "active"}
              currentExpiresAt={subscription.expiresAt}
              onSaved={() => { setEditPlan(false); load(); }}
            />
          ) : (
            <OrgPlanEditor
              organizationId={org.id}
              currentPlan="trial"
              currentStatus="active"
              currentExpiresAt={null}
              onSaved={() => { setEditPlan(false); load(); }}
            />
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Events totaal",    value: events.length,    icon: Calendar, color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Deelnemers",       value: totalAttendees,   icon: Users,    color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Omzet totaal",     value: `€${(totalRevenue / 100).toLocaleString("nl-NL")}`, icon: Euro, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Lid sinds",        value: formatDate(org.createdAt), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={14} className={stat.color} />
            </div>
            <p className="text-lg font-extrabold text-[#1C1814]">{stat.value}</p>
            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Events list */}
        <div className="md:col-span-2 bg-white border border-black/8 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-black/6">
            <p className="text-xs font-bold text-[#6B5E54] uppercase tracking-widest">Evenementen</p>
          </div>
          {events.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar size={24} className="mx-auto text-black/15 mb-2" />
              <p className="text-sm text-[#9E9890]">Geen evenementen</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {events.slice(0, 10).map(ev => {
                const sc = EVENT_STATUS[ev.status ?? "draft"] ?? EVENT_STATUS.draft;
                return (
                  <div key={ev.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-black/[0.015] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1C1814] truncate">{ev.title}</p>
                      <p className="text-[11px] text-[#9E9890]">
                        {new Date(ev.startsAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sc.color}`}>{sc.label}</span>
                    <span className="text-xs font-semibold text-[#6B5E54] shrink-0">{ev.attendeeCount} aanm.</span>
                  </div>
                );
              })}
              {events.length > 10 && (
                <p className="text-xs text-[#9E9890] text-center py-3">{events.length - 10} meer...</p>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Org info */}
          <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest mb-4">Organisatie-info</p>
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Type", value: org.orgType },
                { label: "Events/jaar", value: org.eventsPerYear },
                { label: "Rol contact", value: org.contactRole },
                { label: "Telefoon", value: org.phone },
                { label: "Aangesloten", value: formatDate(org.createdAt) },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[#9E9890] shrink-0">{label}</span>
                  <span className="font-medium text-[#1C1814] text-right truncate">{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Subscription history */}
          <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest mb-4">Abonnementshistorie</p>
            {subscriptionHistory.length === 0 ? (
              <p className="text-sm text-[#9E9890]">Geen abonnementen</p>
            ) : (
              <div className="space-y-2.5">
                {subscriptionHistory.slice(0, 5).map((sub, i) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1C1814]">{PLAN_LABELS[sub.plan] ?? sub.plan}</p>
                      <p className="text-[10px] text-[#9E9890]">{formatDate(sub.startsAt)} → {formatDate(sub.expiresAt)}</p>
                    </div>
                    {sub.amountPaid ? (
                      <span className="text-xs font-bold text-emerald-600 shrink-0">€{(sub.amountPaid / 100).toFixed(0)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit trail */}
          {auditLog.length > 0 && (
            <div className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-[#9E9890] uppercase tracking-widest mb-4">Admin activiteit</p>
              <div className="space-y-2.5">
                {auditLog.slice(0, 5).map(entry => (
                  <div key={entry.id} className="flex items-start gap-2">
                    <Shield size={11} className="text-[#9E9890] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-[#1C1814] font-medium">{entry.action.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-[#9E9890]">{formatDate(entry.createdAt)} · {entry.adminEmail.split("@")[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showMail && <MailModal orgName={org.name} onClose={() => setShowMail(false)} />}
    </div>
  );
}
