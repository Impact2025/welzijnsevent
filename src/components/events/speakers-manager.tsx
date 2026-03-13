"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Linkedin, ExternalLink, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import type { Speaker } from "@/db/schema";

interface Props {
  eventId: string;
  initialSpeakers: Speaker[];
}

const EMPTY_FORM = {
  name: "", bio: "", company: "", photoUrl: "", linkedinUrl: "",
};

export function SpeakersManager({ eventId, initialSpeakers }: Props) {
  const [speakerList, setSpeakerList] = useState<Speaker[]>(initialSpeakers);
  const [form, setForm]   = useState(EMPTY_FORM);
  const [open, setOpen]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, eventId, sortOrder: speakerList.length }),
      });
      if (!res.ok) throw new Error(await res.text());
      const speaker: Speaker = await res.json();
      setSpeakerList((prev) => [...prev, speaker]);
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
      await fetch(`/api/speakers/${id}`, { method: "DELETE" });
      setSpeakerList((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Speaker list */}
      {speakerList.length === 0 && !open ? (
        <div className="py-12 text-center text-ink-muted">
          <div className="w-14 h-14 rounded-full bg-sand mx-auto mb-3 flex items-center justify-center text-2xl">🎤</div>
          <p className="text-sm font-semibold mb-1">Nog geen sprekers</p>
          <p className="text-xs opacity-60">Voeg je eerste spreker toe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {speakerList.map((sp) => (
            <div
              key={sp.id}
              className="flex items-start gap-3 p-4 rounded-2xl border border-sand bg-white hover:border-terra-200 transition-colors"
            >
              <GripVertical size={16} className="text-ink-muted/40 mt-1 shrink-0" />

              {/* Avatar */}
              <div className="w-11 h-11 rounded-full overflow-hidden bg-terra-100 flex items-center justify-center shrink-0">
                {sp.photoUrl ? (
                  <Image
                    src={sp.photoUrl}
                    alt={sp.name}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-terra-600 text-sm font-bold">
                    {sp.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink">{sp.name}</p>
                {sp.company && (
                  <p className="text-xs text-ink-muted">{sp.company}</p>
                )}
                {sp.bio && (
                  <p className="text-xs text-ink-muted/80 mt-1 line-clamp-2">{sp.bio}</p>
                )}
                {sp.linkedinUrl && (
                  <a
                    href={sp.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-blue-600 hover:underline"
                  >
                    <Linkedin size={10} />
                    LinkedIn
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(sp.id)}
                disabled={deleting === sp.id}
                className="p-1.5 rounded-lg text-ink-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {open ? (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-terra-200 bg-terra-50/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-ink">Nieuwe spreker</h3>
            <button
              type="button"
              onClick={() => { setOpen(false); setForm(EMPTY_FORM); setError(null); }}
              className="text-ink-muted hover:text-ink"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          {[
            { key: "name",        label: "Naam *",             placeholder: "Jan de Vries",             required: true  },
            { key: "company",     label: "Organisatie",        placeholder: "Welzijn NL",               required: false },
            { key: "bio",         label: "Bio",                placeholder: "Korte beschrijving...",     required: false },
            { key: "photoUrl",    label: "Foto-URL",           placeholder: "https://...",              required: false },
            { key: "linkedinUrl", label: "LinkedIn-URL",       placeholder: "https://linkedin.com/in/", required: false },
          ].map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-ink mb-1">{label}</label>
              {key === "bio" ? (
                <textarea
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-sand bg-white text-sm focus:outline-none focus:border-terra-400 resize-none"
                />
              ) : (
                <input
                  type={key.includes("Url") ? "url" : "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={required}
                  className="w-full px-3 py-2 rounded-xl border border-sand bg-white text-sm focus:outline-none focus:border-terra-400"
                />
              )}
            </div>
          ))}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-terra-500 text-white text-sm font-bold hover:bg-terra-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Opslaan..." : "Spreker toevoegen"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-sand text-ink-muted text-sm font-semibold hover:border-terra-300 hover:text-terra-500 transition-colors"
        >
          <Plus size={16} />
          Spreker toevoegen
        </button>
      )}
    </div>
  );
}
