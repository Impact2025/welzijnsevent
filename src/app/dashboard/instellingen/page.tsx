"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Palette, CreditCard, Bell, Check, ExternalLink, Loader2, Globe, Upload, X, LogOut, Users, Mail, Trash2, UserPlus, Crown, Shield, User } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { PLAN_FEATURES, PLAN_LIMITS, PLAN_PRICES_CENTS } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

const PRESET_COLORS = ["#C8522A", "#2D5A3D", "#1C4ED8", "#7C3AED", "#B45309"];

const DEFAULT_NOTIFICATIONS = [
  { key: "newRegistration", label: "Nieuwe registratie", desc: "E-mail bij aanmelding", on: true },
  { key: "checkin",         label: "Check-in melding",   desc: "Live notificatie bij inchecken", on: true },
  { key: "weeklyReport",    label: "Wekelijks rapport",  desc: "Samenvatting elke maandag", on: false },
];

const UPGRADE_PLANS = ["welzijn", "netwerk", "organisatie"] as const;

interface Subscription {
  id: string;
  plan: string;
  status: string | null;
  expiresAt: string | null;
  amountPaid: number | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  name: string | null;
  email: string | null;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

export default function InstellingenPage() {
  const [orgId, setOrgId]           = useState<string | null>(null);
  const [name, setName]             = useState("");
  const [logo, setLogo]             = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError]   = useState<string | null>(null);
  const [primaryColor, setColor]    = useState("#C8522A");
  const [customDomain, setDomain]   = useState("");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [subscription, setSubscription]   = useState<Subscription | null>(null);
  const [saved, setSaved]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [upgrading, setUpgrading]   = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  // Team state
  const [members, setMembers]         = useState<Member[]>([]);
  const [invites, setInvites]         = useState<Invite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("member");
  const [inviting, setInviting]       = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/organizations").then(r => r.json()),
      fetch("/api/subscriptions").then(r => r.json()),
      fetch("/api/organizations/members").then(r => r.json()),
    ]).then(([orgData, subData, teamData]) => {
      if (orgData.organization) {
        setOrgId(orgData.organization.id);
        setName(orgData.organization.name ?? "");
        setLogo(orgData.organization.logo ?? "");
        setColor(orgData.organization.primaryColor ?? "#C8522A");
        setDomain(orgData.organization.customDomain ?? "");
      }
      if (subData.subscription) {
        setSubscription(subData.subscription);
      }
      if (teamData.members) setMembers(teamData.members);
      if (teamData.invites) setInvites(teamData.invites);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSent(false);
    try {
      const res = await fetch("/api/organizations/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInviteError(data.error ?? "Uitnodiging mislukt");
      } else {
        setInviteSent(true);
        setInviteEmail("");
        setInvites(prev => [...prev, data.invite]);
        setTimeout(() => setInviteSent(false), 3000);
      }
    } catch {
      setInviteError("Netwerkfout — probeer opnieuw");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Teamlid verwijderen?")) return;
    await fetch("/api/organizations/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleRevokeInvite = async (inviteId: string) => {
    await fetch("/api/organizations/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    setInvites(prev => prev.filter(i => i.id !== inviteId));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogo(data.url);
    } catch (err: unknown) {
      setLogoError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setLogoUploading(false);
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev =>
      prev.map(n => n.key === key ? { ...n, on: !n.on } : n)
    );
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          logo: logo || null,
          primaryColor,
          customDomain: customDomain.trim() || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setUpgrading(plan);
    setUpgradeError(null);
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
        const detail = data.details?.error_code
          ? `MSP fout ${data.details.error_code}: ${data.details.error_info ?? data.error}`
          : (data.error ?? "Betaallink aanmaken mislukt");
        setUpgradeError(detail);
      }
    } catch {
      setUpgradeError("Netwerkfout — probeer opnieuw");
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="h-8 w-40 bg-sand rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-56 bg-sand rounded-xl animate-pulse" />
      </div>
    );
  }

  const currentPlan = subscription?.plan ?? "trial";
  const isActive = subscription?.status === "active";
  const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt < new Date() : false;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Instellingen</h1>
        <p className="text-ink-muted text-sm">Beheer je organisatie en abonnement</p>
      </div>

      <div className="space-y-5">
        {/* Organisation */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <Building2 size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Organisatie</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                Naam organisatie
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                Logo
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
              {logo ? (
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl object-contain bg-sand border border-sand" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-terra-500 font-semibold hover:underline"
                  >
                    Vervangen
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="text-xs text-ink-muted hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                  className="w-full flex items-center justify-center gap-2 bg-sand border border-dashed border-sand-dark hover:border-terra-300 rounded-xl px-4 py-4 text-sm text-ink-muted hover:text-ink transition-colors disabled:opacity-60"
                >
                  {logoUploading ? (
                    <><Loader2 size={15} className="animate-spin" /> Uploaden...</>
                  ) : (
                    <><Upload size={15} /> Klik om een logo te uploaden <span className="text-xs opacity-60">PNG, JPG, SVG · max 2 MB</span></>
                  )}
                </button>
              )}
              {logoError && <p className="text-xs text-red-500 mt-1">{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <Users size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Team</h2>
            <span className="ml-auto text-xs text-ink-muted">{members.length} {members.length === 1 ? "lid" : "leden"}</span>
          </div>

          {/* Member list */}
          {members.length > 0 && (
            <div className="divide-y divide-sand">
              {members.map((m) => {
                const RoleIcon = m.role === "owner" ? Crown : m.role === "admin" ? Shield : User;
                const roleColor = m.role === "owner" ? "text-amber-500" : m.role === "admin" ? "text-blue-500" : "text-ink-muted";
                return (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-xs flex-shrink-0">
                      {(m.name ?? m.email ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{m.name ?? m.email}</p>
                      {m.name && <p className="text-xs text-ink-muted truncate">{m.email}</p>}
                    </div>
                    <div className={`flex items-center gap-1 ${roleColor}`}>
                      <RoleIcon size={12} />
                      <span className="text-[11px] font-semibold capitalize">{m.role}</span>
                    </div>
                    {m.role !== "owner" && (
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 text-ink-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Verwijderen"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending invites */}
          {invites.length > 0 && (
            <div className="px-5 py-3 border-t border-sand">
              <p className="text-[10px] font-black uppercase tracking-widest text-ink-muted mb-2">Openstaande uitnodigingen</p>
              <div className="space-y-2">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-2 bg-sand/50 rounded-xl px-3 py-2">
                    <Mail size={12} className="text-ink-muted flex-shrink-0" />
                    <span className="text-xs text-ink flex-1 truncate">{inv.email}</span>
                    <span className="text-[10px] text-ink-muted capitalize">{inv.role}</span>
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="p-1 text-ink-muted hover:text-red-500 transition-colors"
                      title="Intrekken"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite form */}
          <div className="p-5 border-t border-sand space-y-3">
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Teamlid uitnodigen</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
                placeholder="naam@organisatie.nl"
                className="flex-1 bg-sand rounded-xl px-4 py-2.5 text-sm text-ink outline-none placeholder-ink-muted/50 focus:ring-2 focus:ring-terra-500/30 transition"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="bg-sand rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
              >
                <option value="member">Lid</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {inviteError && <p className="text-xs text-red-500">{inviteError}</p>}
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                inviteSent ? "bg-green-500 text-white" : "bg-terra-500 hover:bg-terra-600 text-white"
              }`}
            >
              {inviting ? (
                <><Loader2 size={14} className="animate-spin" /> Versturen...</>
              ) : inviteSent ? (
                <><Check size={14} /> Uitnodiging verstuurd!</>
              ) : (
                <><UserPlus size={14} /> Uitnodigen per e-mail</>
              )}
            </button>
          </div>
        </div>

        {/* White-label domein */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <Globe size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">White-label domein</h2>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                Eigen domein
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={e => setDomain(e.target.value.toLowerCase().trim())}
                placeholder="evenementen.mijnorganisatie.nl"
                className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none placeholder-ink-muted/50 focus:ring-2 focus:ring-terra-500/30 transition"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-800 mb-1">DNS instelling vereist</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Voeg een CNAME-record toe bij je DNS-provider:
              </p>
              <code className="block text-xs bg-blue-100 text-blue-900 rounded-lg px-3 py-2 mt-2 font-mono">
                CNAME → cname.vercel-dns.com
              </code>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <Palette size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Huisstijl</h2>
          </div>
          <div className="p-5">
            <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
              Primaire kleur
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setColor(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-sand shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-ink">{primaryColor.toUpperCase()}</p>
                <p className="text-xs text-ink-muted">Accent- en knopkleur</p>
              </div>
              <div className="flex gap-2 ml-auto">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: primaryColor === c ? "#1C1814" : "white" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <Bell size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Meldingen</h2>
          </div>
          <div className="divide-y divide-sand">
            {notifications.map(({ key, label, desc, on }) => (
              <div key={key} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-muted">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${on ? "bg-terra-500" : "bg-sand"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${on ? "right-1" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <CreditCard size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Abonnement</h2>
          </div>

          {/* Current plan status */}
          {subscription && (
            <div className={`mx-4 mt-4 rounded-xl p-4 border-2 ${
              isActive && !isExpired ? "border-terra-500 bg-terra-50" : "border-amber-300 bg-amber-50"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-ink text-sm">
                  {PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS]?.label ?? currentPlan}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive && !isExpired
                    ? "text-terra-600 bg-terra-100"
                    : "text-amber-700 bg-amber-100"
                }`}>
                  {isActive && !isExpired ? "ACTIEF" : isExpired ? "VERLOPEN" : "IN AFWACHTING"}
                </span>
              </div>
              {expiresAt && (
                <p className="text-xs text-ink-muted">
                  {isExpired ? "Verlopen op" : "Geldig t/m"} {formatDate(expiresAt)}
                </p>
              )}
              {subscription.amountPaid && (
                <p className="text-xs text-ink-muted mt-0.5">
                  Betaald: €{(subscription.amountPaid / 100).toLocaleString("nl-NL")}
                </p>
              )}
            </div>
          )}

          {/* Upgrade options */}
          <div className="p-4 space-y-3">
            {upgradeError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-red-700">{upgradeError}</p>
              </div>
            )}
            {UPGRADE_PLANS.filter(p => p !== currentPlan || !isActive || isExpired).map(plan => {
              const features = PLAN_FEATURES[plan] ?? [];
              const price = PLAN_PRICES_CENTS[plan];
              const isCurrent = plan === currentPlan && isActive && !isExpired;

              return (
                <div
                  key={plan}
                  className={`rounded-xl p-4 border-2 ${isCurrent ? "border-terra-500 bg-terra-50" : "border-sand"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink text-sm">
                        {PLAN_LIMITS[plan]?.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-terra-600 bg-terra-100 px-2 py-0.5 rounded-full">
                          HUIDIG
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-terra-600 text-sm">
                      €{(price / 100).toLocaleString("nl-NL")}/jaar
                    </span>
                  </div>
                  <ul className="space-y-1 mb-3">
                    {features.map(f => (
                      <li key={f} className="text-xs text-ink-muted flex items-center gap-1.5">
                        <Check size={10} className="text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading === plan}
                      className="w-full flex items-center justify-center gap-1.5 bg-terra-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-terra-600 transition-colors disabled:opacity-60"
                    >
                      {upgrading === plan ? (
                        <><Loader2 size={12} className="animate-spin" /> Doorsturen...</>
                      ) : (
                        <><ExternalLink size={12} /> Upgraden via MultiSafePay</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Uitloggen — zichtbaar op mobiel (desktop heeft sidebar-knop) */}
        <form action={signOutAction} className="md:hidden">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 border border-sand text-ink-muted font-semibold py-3.5 rounded-2xl text-sm hover:bg-sand/60 transition-colors mb-3"
          >
            <LogOut size={15} />
            Uitloggen
          </button>
        </form>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !orgId}
          className={`w-full font-bold py-3.5 rounded-2xl text-sm transition-colors disabled:opacity-60 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-terra-500 hover:bg-terra-600 text-white"
          }`}
        >
          {saving ? "Opslaan..." : saved ? "✓ Opgeslagen!" : "Wijzigingen opslaan"}
        </button>
      </div>
    </div>
  );
}
