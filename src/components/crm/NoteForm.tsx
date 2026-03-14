"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
}

export function NoteForm({ email }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/crm/contacts/${encodeURIComponent(email)}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      setNote("");
      router.refresh();
    } catch {
      setError("Kon notitie niet opslaan. Probeer opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-terra-50 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare size={13} className="text-terra-500" />
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Voeg een notitie toe..."
          rows={2}
          maxLength={2000}
          className="flex-1 text-sm bg-sand/50 border border-sand rounded-xl px-3 py-2.5 outline-none resize-none focus:border-terra-400 focus:bg-white transition-all font-medium text-ink placeholder-ink-muted/50"
        />
      </div>
      {error && <p className="text-xs text-red-500 pl-10">{error}</p>}
      <div className="flex justify-end pl-10">
        <button
          type="submit"
          disabled={saving || !note.trim()}
          className="flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Toevoegen
        </button>
      </div>
    </form>
  );
}
