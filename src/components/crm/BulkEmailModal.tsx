"use client";

import { useState } from "react";
import { X, Send, Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  recipientCount: number;
  filters: { q?: string; lifecycle?: string; tag?: string };
}

export function BulkEmailModal({ recipientCount, filters }: Props) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setSubject("");
    setBody("");
    setResult(null);
    setError(null);
  }

  function close() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  async function send() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/bulk-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, filters }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onbekende fout");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Versturen mislukt");
    } finally {
      setSending(false);
    }
  }

  const activeFilters = [
    filters.lifecycle && `lifecycle: ${filters.lifecycle}`,
    filters.tag && `tag: ${filters.tag}`,
    filters.q && `zoek: "${filters.q}"`,
  ].filter(Boolean);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        <Mail size={14} />
        Mailing versturen
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-sand">
              <div>
                <h2 className="text-base font-extrabold text-ink">Mailing versturen</h2>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Aan <span className="font-semibold text-ink">{recipientCount} contacten</span>
                  {activeFilters.length > 0 && (
                    <span className="ml-1 text-terra-500">({activeFilters.join(", ")})</span>
                  )}
                </p>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-sand text-ink-muted transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {result ? (
                <div className="text-center py-6">
                  <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
                  <p className="text-lg font-extrabold text-ink mb-1">Mailing verstuurd!</p>
                  <p className="text-sm text-ink-muted">
                    <span className="font-semibold text-green-600">{result.sent} e-mails</span> verzonden
                    {result.skipped > 0 && (
                      <>, <span className="font-semibold text-ink-muted">{result.skipped} overgeslagen</span> (opt-out)</>
                    )}
                  </p>
                  <button
                    onClick={close}
                    className="mt-5 px-5 py-2 rounded-xl bg-terra-500 text-white text-sm font-semibold hover:bg-terra-600 transition-colors"
                  >
                    Sluiten
                  </button>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">
                      Onderwerp
                    </label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Onderwerpregel van de e-mail"
                      className="w-full text-sm bg-cream border border-sand rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500 placeholder:text-ink-muted/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1.5">
                      Bericht
                    </label>
                    <textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder={"Schrijf hier je bericht...\n\nElke lege regel wordt een nieuwe alinea."}
                      rows={8}
                      className="w-full text-sm bg-cream border border-sand rounded-xl px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-500 placeholder:text-ink-muted/40 resize-none"
                    />
                    <p className="text-[11px] text-ink-muted mt-1">
                      Het bericht begint automatisch met "Hoi [voornaam]," en wordt verzonden met jouw organisatie-branding.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={close}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-ink-muted hover:bg-sand transition-colors"
                    >
                      Annuleren
                    </button>
                    <button
                      onClick={send}
                      disabled={sending || !subject.trim() || !body.trim()}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-terra-500 text-white hover:bg-terra-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {sending ? "Versturen..." : `Verstuur naar ${recipientCount}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
