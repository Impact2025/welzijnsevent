"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2, FileText, X } from "lucide-react";

type Row = { name: string; email: string; organization: string; role: string };
type ParseResult = { rows: Row[]; errors: string[] };

function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["Bestand heeft geen data-rijen."] };

  const header = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g, ""));
  const nameIdx  = header.findIndex(h => ["naam", "name", "volledige naam", "full name"].includes(h));
  const emailIdx = header.findIndex(h => ["email", "e-mail", "e-mailadres"].includes(h));
  const orgIdx   = header.findIndex(h => ["organisatie", "organization", "bedrijf", "company"].includes(h));
  const roleIdx  = header.findIndex(h => ["functie", "role", "titel", "title"].includes(h));

  const errors: string[] = [];
  if (nameIdx === -1) errors.push("Kolom 'naam' niet gevonden.");
  if (emailIdx === -1) errors.push("Kolom 'email' niet gevonden.");
  if (errors.length) return { rows: [], errors };

  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));
    const email = cols[emailIdx]?.trim();
    const name  = cols[nameIdx]?.trim();
    if (!email || !name) continue;
    rows.push({
      name,
      email,
      organization: orgIdx >= 0 ? (cols[orgIdx] ?? "") : "",
      role:         roleIdx >= 0 ? (cols[roleIdx] ?? "") : "",
    });
  }

  return { rows, errors: rows.length === 0 ? ["Geen geldige rijen gevonden."] : [] };
}

export default function ImportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [parsed,   setParsed]   = useState<ParseResult | null>(null);
  const [filename, setFilename] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{ created: number; skipped: number } | null>(null);
  const [error,    setError]    = useState("");

  function handleFile(file: File) {
    setFilename(file.name);
    setParsed(null);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      setParsed(parseCSV(text));
    };
    reader.readAsText(file, "utf-8");
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/attendees/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: params.id, rows: parsed.rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import mislukt");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      <div className="bg-terra-500 text-white px-4 pt-10 pb-5">
        <Link href={`/dashboard/events/${params.id}/deelnemers`} className="flex items-center gap-1.5 text-white/80 text-sm mb-4 hover:text-white">
          <ArrowLeft size={16} />
          Deelnemers
        </Link>
        <h1 className="text-xl font-bold">CSV importeren</h1>
        <p className="text-white/70 text-xs mt-1">Meerdere deelnemers tegelijk toevoegen</p>
      </div>

      <div className="px-4 pt-6 space-y-5">
        {/* Format hint */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-bold text-blue-700 mb-2">Vereist CSV-formaat</p>
          <p className="text-xs text-blue-600 font-mono">naam, email, organisatie, functie</p>
          <p className="text-xs text-blue-500 mt-1">
            Eerste rij = kolomkoppen. Alleen naam en email zijn verplicht.
          </p>
        </div>

        {/* Upload area */}
        {!parsed ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            className="aspect-[3/1] rounded-2xl border-2 border-dashed border-sand hover:border-terra-300 hover:bg-terra-50/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center">
              <Upload size={20} className="text-ink-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-ink">Sleep een CSV-bestand</p>
              <p className="text-xs text-ink-muted">of klik om te selecteren</p>
            </div>
          </div>
        ) : (
          /* Parsed preview */
          <div className="border border-sand rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-sand/30 border-b border-sand">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-ink-muted" />
                <span className="text-sm font-semibold text-ink truncate max-w-[200px]">{filename}</span>
              </div>
              <button
                onClick={() => { setParsed(null); setFilename(""); setResult(null); }}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X size={14} />
              </button>
            </div>

            {parsed.errors.length > 0 ? (
              <div className="p-4 space-y-2">
                {parsed.errors.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={14} />
                    {e}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="px-4 py-2 bg-green-50 border-b border-sand">
                  <p className="text-xs font-semibold text-green-700">
                    {parsed.rows.length} deelnemer{parsed.rows.length !== 1 ? "s" : ""} gevonden
                  </p>
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-sand/60">
                  {parsed.rows.slice(0, 50).map((row, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{row.name}</p>
                        <p className="text-xs text-ink-muted truncate">{row.email}{row.organization ? ` · ${row.organization}` : ""}</p>
                      </div>
                    </div>
                  ))}
                  {parsed.rows.length > 50 && (
                    <p className="px-4 py-2.5 text-xs text-ink-muted">
                      + {parsed.rows.length - 50} meer...
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={onInputChange} className="hidden" />

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {result ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-green-800">{result.created} toegevoegd</p>
            {result.skipped > 0 && (
              <p className="text-sm text-green-600 mt-1">{result.skipped} overgeslagen (al aanwezig)</p>
            )}
            <button
              onClick={() => router.push(`/dashboard/events/${params.id}/deelnemers`)}
              className="mt-4 px-5 py-2.5 bg-terra-500 text-white rounded-xl text-sm font-bold hover:bg-terra-600 transition-colors"
            >
              Naar deelnemers
            </button>
          </div>
        ) : (
          parsed && parsed.errors.length === 0 && (
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full py-3.5 bg-terra-500 text-white rounded-2xl text-sm font-bold hover:bg-terra-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {loading ? "Importeren…" : `${parsed.rows.length} deelnemers importeren`}
            </button>
          )
        )}
      </div>
    </div>
  );
}
