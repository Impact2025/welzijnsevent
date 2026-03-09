"use client";

import { useState, useEffect } from "react";
import { Building2, Palette, CreditCard, Bell, Check } from "lucide-react";

const PLANS = [
  {
    id: "basis",
    name: "Basis",
    price: "Gratis",
    features: ["5 evenementen/jaar", "100 deelnemers", "Basis rapportage"],
    current: false,
  },
  {
    id: "welzijn",
    name: "Welzijn Pro",
    price: "€49/mnd",
    features: ["Onbeperkte evenementen", "1.000 deelnemers", "Netwerk matching", "Live Q&A & Polls"],
    current: true,
  },
  {
    id: "congres",
    name: "Congres",
    price: "€149/mnd",
    features: ["Onbeperkte deelnemers", "White-label", "API toegang", "Prioriteit support"],
    current: false,
  },
];

const PRESET_COLORS = ["#C8522A", "#2D5A3D", "#1C4ED8", "#7C3AED", "#B45309"];

const DEFAULT_NOTIFICATIONS = [
  { key: "newRegistration", label: "Nieuwe registratie", desc: "E-mail bij aanmelding", on: true },
  { key: "checkin",         label: "Check-in melding",   desc: "Live notificatie bij inchecken", on: true },
  { key: "weeklyReport",    label: "Wekelijks rapport",  desc: "Samenvatting elke maandag", on: false },
];

export default function InstellingenPage() {
  const [orgId, setOrgId]        = useState<string | null>(null);
  const [name, setName]          = useState("");
  const [logo, setLogo]          = useState("");
  const [primaryColor, setColor] = useState("#C8522A");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [saved, setSaved]        = useState(false);
  const [saving, setSaving]      = useState(false);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    fetch("/api/organizations")
      .then(r => r.json())
      .then(d => {
        if (d.organization) {
          setOrgId(d.organization.id);
          setName(d.organization.name ?? "");
          setLogo(d.organization.logo ?? "");
          setColor(d.organization.primaryColor ?? "#C8522A");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          id: orgId,
          name,
          logo: logo || null,
          primaryColor,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
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

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Instellingen</h1>
        <p className="text-ink-muted text-sm">Beheer je organisatie en account</p>
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
                Logo (URL)
              </label>
              <input
                type="text"
                value={logo}
                onChange={e => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none placeholder-ink-muted/50 focus:ring-2 focus:ring-terra-500/30 transition"
              />
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
                    style={{
                      backgroundColor: c,
                      borderColor: primaryColor === c ? "#1C1814" : "white",
                    }}
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

        {/* Plans */}
        <div className="card-base overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-sand bg-sand/30">
            <CreditCard size={16} className="text-terra-500" />
            <h2 className="font-bold text-ink text-sm">Betalingsplan</h2>
          </div>
          <div className="p-4 space-y-3">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`rounded-xl p-4 border-2 transition-colors ${
                  plan.current ? "border-terra-500 bg-terra-50" : "border-sand"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">{plan.name}</span>
                    {plan.current && (
                      <span className="text-[10px] font-bold text-terra-600 bg-terra-100 px-2 py-0.5 rounded-full">
                        HUIDIG
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-terra-600 text-sm">{plan.price}</span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-ink-muted flex items-center gap-1.5">
                      <Check size={10} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <button className="mt-3 w-full bg-terra-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-terra-600 transition-colors">
                    Upgraden
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

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

        {!orgId && (
          <p className="text-xs text-ink-muted text-center -mt-3">
            Geen organisatie gevonden in de database. Voer eerst{" "}
            <code className="font-mono bg-sand px-1 rounded">npx tsx src/db/seed.ts</code> uit.
          </p>
        )}
      </div>
    </div>
  );
}
