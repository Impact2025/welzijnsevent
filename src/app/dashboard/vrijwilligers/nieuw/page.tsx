"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, HandHeart, Loader2, X, Plus, CheckCircle2,
} from "lucide-react";

export default function NieuweVrijwilligerPage() {
  const router = useRouter();

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [availability, setAvailability] = useState("");
  const [bio,          setBio]          = useState("");
  const [skills,       setSkills]       = useState<string[]>([]);
  const [skillInput,   setSkillInput]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [done,         setDone]         = useState(false);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills((prev) => [...prev, s]);
    }
    setSkillInput("");
  }

  function onSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vrijwilligers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         name.trim(),
          email:        email.trim(),
          phone:        phone.trim() || null,
          skills,
          availability: availability.trim() || null,
          bio:          bio.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Opslaan mislukt");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-ink mb-1">Vrijwilliger toegevoegd</h1>
        <p className="text-sm text-ink-muted mb-6">{name} staat nu in de pool.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setName(""); setEmail(""); setPhone(""); setAvailability("");
              setBio(""); setSkills([]); setSkillInput(""); setDone(false);
            }}
            className="w-full py-3 bg-terra-500 text-white rounded-2xl text-sm font-bold hover:bg-terra-600 transition-colors"
          >
            Nog een toevoegen
          </button>
          <Link
            href="/dashboard/vrijwilligers"
            className="w-full py-3 bg-sand text-ink rounded-2xl text-sm font-bold hover:bg-sand/80 transition-colors text-center"
          >
            Naar vrijwilligerspool
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 sm:py-8">

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/vrijwilligers"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4 transition-colors"
        >
          <ArrowLeft size={14} />
          Vrijwilligerspool
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-terra-50 border border-terra-100 flex items-center justify-center">
            <HandHeart size={18} className="text-terra-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink tracking-tight">Vrijwilliger toevoegen</h1>
            <p className="text-xs text-ink-muted mt-0.5">Voeg handmatig een vrijwilliger toe aan de pool</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="card-base p-5 space-y-4">

        {/* Naam */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            Naam <span className="text-red-400">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan de Vries"
            className="w-full text-sm bg-cream border border-sand rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow"
          />
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">
            E-mailadres <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@voorbeeld.nl"
            className="w-full text-sm bg-cream border border-sand rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow"
          />
        </div>

        {/* Telefoon */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">Telefoon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 12345678"
            className="w-full text-sm bg-cream border border-sand rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow"
          />
        </div>

        {/* Vaardigheden */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">Vaardigheden</label>
          <div className="min-h-[42px] w-full bg-cream border border-sand rounded-xl px-3 py-2 flex flex-wrap gap-1.5 focus-within:ring-2 focus-within:ring-terra-300 transition-shadow">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 text-xs font-medium bg-terra-50 text-terra-700 border border-terra-100 px-2 py-0.5 rounded-full"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSkills((prev) => prev.filter((x) => x !== s))}
                  className="hover:text-terra-900 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={onSkillKeyDown}
              onBlur={addSkill}
              placeholder={skills.length === 0 ? "Typ en druk op Enter (bijv. EHBO, rijbewijs)" : ""}
              className="flex-1 min-w-[120px] text-sm bg-transparent text-ink placeholder:text-ink-muted/50 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-ink-muted mt-1">Druk op Enter of komma om een vaardigheid toe te voegen</p>
        </div>

        {/* Beschikbaarheid */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">Beschikbaarheid</label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Bijv. weekenden, doordeweeks avonden"
            className="w-full text-sm bg-cream border border-sand rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow"
          />
        </div>

        {/* Bio / notitie */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5">Notitie</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Achtergrond, motivatie of andere relevante informatie..."
            rows={3}
            className="w-full text-sm bg-cream border border-sand rounded-xl px-3.5 py-2.5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-terra-300 transition-shadow resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <Link
          href="/dashboard/vrijwilligers"
          className="flex-1 py-3 text-center text-sm font-bold text-ink-muted bg-sand/60 rounded-2xl hover:bg-sand transition-colors"
        >
          Annuleren
        </Link>
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !email.trim()}
          className="flex-1 py-3 text-sm font-bold text-white bg-terra-500 rounded-2xl hover:bg-terra-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          {loading ? "Opslaan…" : "Toevoegen"}
        </button>
      </div>
    </div>
  );
}
