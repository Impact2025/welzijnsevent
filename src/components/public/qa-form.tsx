"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle } from "lucide-react";

export function QAForm({
  eventId,
  primaryColor,
}: {
  eventId: string;
  primaryColor: string;
}) {
  const [content, setContent]   = useState("");
  const [name, setName]         = useState("");
  const [anon, setAnon]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          content,
          authorName:  anon ? null : name || null,
          isAnonymous: anon,
        }),
      });
      setContent("");
      setSent(true);
      router.refresh();
      setTimeout(() => setSent(false), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-terra-500" />
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Stel een vraag</p>
      </div>

      {sent ? (
        <div className="py-8 text-center px-4">
          <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-800">Vraag ingediend!</p>
          <p className="text-xs text-gray-400 mt-1">Je vraag wordt beoordeeld door de organisatie</p>
        </div>
      ) : (
        <form onSubmit={submit} className="p-4 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Wat wil je vragen aan de spreker?"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 outline-none resize-none focus:border-terra-400 focus:ring-2 focus:ring-terra-100 transition-all placeholder:text-gray-300"
          />
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {!anon && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jouw naam"
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-terra-400 w-36 transition-colors"
                />
              )}
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-terra-500"
                />
                Anoniem
              </label>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-xl disabled:opacity-40 transition-opacity active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={11} />
              Verstuur
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
