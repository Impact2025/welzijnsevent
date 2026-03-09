"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function NewAttendeePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: params.id,
          name,
          email,
          organization: organization || null,
          role: role || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Kon deelnemer niet toevoegen");
      }

      router.push(`/dashboard/events/${params.id}/deelnemers`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link
          href={`/dashboard/events/${params.id}/deelnemers`}
          className="flex items-center gap-1 text-white/70 text-sm mb-3 hover:text-white"
        >
          <ArrowLeft size={14} />
          Terug
        </Link>
        <div className="flex items-center gap-2">
          <UserPlus size={18} />
          <h1 className="text-lg font-bold">Deelnemer toevoegen</h1>
        </div>
        <p className="text-white/70 text-xs mt-0.5">Voeg handmatig een deelnemer toe</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Naam <span className="text-terra-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Jan de Vries"
            className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            E-mailadres <span className="text-terra-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="jan@organisatie.nl"
            className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Organisatie
          </label>
          <input
            type="text"
            value={organization}
            onChange={e => setOrganization(e.target.value)}
            placeholder="Humanitas Utrecht"
            className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
            Functie / Rol
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Vrijwilliger"
            className="w-full bg-sand rounded-xl px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-terra-500/30 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-terra-500 hover:bg-terra-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors mt-2"
        >
          {loading ? "Toevoegen..." : "Deelnemer toevoegen"}
        </button>

        <Link
          href={`/dashboard/events/${params.id}/deelnemers`}
          className="block text-center text-sm text-ink-muted hover:text-ink py-2"
        >
          Annuleren
        </Link>
      </form>
    </div>
  );
}
