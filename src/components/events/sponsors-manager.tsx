"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, ExternalLink, ChevronUp } from "lucide-react";
import type { Sponsor } from "@/db/schema";

interface Props {
  eventId: string;
  initialSponsors: Sponsor[];
}

const TIERS: { value: Sponsor["tier"]; label: string; color: string }[] = [
  { value: "gold",   label: "Goud",   color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  { value: "silver", label: "Zilver", color: "bg-gray-50 text-gray-600 border-gray-200"       },
  { value: "bronze", label: "Brons",  color: "bg-orange-50 text-orange-600 border-orange-200" },
];

const EMPTY_FORM = { name: "", logoUrl: "", websiteUrl: "", tier: "silver" as Sponsor["tier"] };

export function SponsorsManager({ eventId, initialSponsors }: Props) {
  const [sponsorList, setSponsorList] = useState<Sponsor[]>(initialSponsors);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId, sortOrder: sponsorList.length }),
      });
      if (!res.ok) throw new Error(await res.text());
      const sponsor: Sponsor = await res.json();
      setSponsorList((prev) => [...prev, sponsor]);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch {
      setError("Opslaan mislukt. Probeer opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
      setSponsorList((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const byTier = (tier: Sponsor["tier"]) => sponsorList.filter((s) => s.tier === tier);

  return (
    <div className="space-y-6">
      {sponsorList.length === 0 && !open ? (
        <div className="py-12 text-center text-ink-muted">
          <div className="w-14 h-14 rounded-full bg-sand mx-auto mb-3 flex items-center justify-center text-2xl">🏅</div>
          <p className="text-sm font-semibold mb-1">Nog geen sponsors</p>
          <p className="text-xs opacity-60">Voeg je eerste sponsor toe</p>
        </div>
      ) : (
        TIERS.map(({ value, label, color }) =>
          byTier(value).length > 0 ? (
            <div key={value}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}>
                  {label}
                </span>
                <div className="flex-1 h-px bg-sand" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {byTier(value).map((sp) => (
                  <div
                    key={sp.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-sand bg-white hover:border-terra-200 transition-colors group"
                  >
                    {/* Logo */}
                    <div className="w-16 h-10 flex items-center justify-center">
                      {sp.logoUrl ? (
                        <Image
                          src={sp.logoUrl}
                          alt={sp.name}
                          width={64}
                          height={40}
                          className="object-contain max-h-10"
                        />
                      ) : (
                        <div className="w-full h-full bg-sand rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-ink-muted">
                            {sp.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-ink text-center truncate w-full">{sp.name}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {sp.websiteUrl && (
                        <a
                          href={sp.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg text-ink-muted hover:text-terra-500 hover:bg-terra-50 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(sp.id)}
                        disabled={deleting === sp.id}
                        className="p-1 rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )
      )}

      {/* Add form */}
      {open ? (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-terra-200 bg-terra-50/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-ink">Nieuwe sponsor</h3>
            <button
              type="button"
              onClick={() => { setOpen(false); setForm(EMPTY_FORM); setError(null); }}
              className="text-ink-muted hover:text-ink"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          {[
            { key: "name",       label: "Naam *",       placeholder: "Stichting Welzijn", type: "text", required: true  },
            { key: "logoUrl",    label: "Logo-URL",      placeholder: "https://...",       type: "url",  required: false },
            { key: "websiteUrl", label: "Website-URL",   placeholder: "https://...",       type: "url",  required: false },
          ].map(({ key, label, placeholder, type, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-ink mb-1">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2 rounded-xl border border-sand bg-white text-sm focus:outline-none focus:border-terra-400"
              />
            </div>
          ))}

          {/* Tier picker */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Tier</label>
            <div className="flex gap-2">
              {TIERS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tier: value }))}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                    form.tier === value ? color + " ring-2 ring-terra-400" : "border-sand text-ink-muted hover:border-terra-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-terra-500 text-white text-sm font-bold hover:bg-terra-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Sponsor toevoegen"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-sand text-ink-muted text-sm font-semibold hover:border-terra-300 hover:text-terra-500 transition-colors"
        >
          <Plus size={16} />
          Sponsor toevoegen
        </button>
      )}
    </div>
  );
}
