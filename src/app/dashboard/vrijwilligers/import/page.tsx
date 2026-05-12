"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2,
  FileSpreadsheet, X, Download,
} from "lucide-react";

type ParsedRow = {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
};

type ParseResult = {
  rows: ParsedRow[];
  errors: string[];
};

// ── CSV parser ───────────────────────────────────────────────
function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], errors: ["Bestand heeft geen data-rijen."] };

  const raw = lines[0].split(/[,;]/).map((h) =>
    h.trim().toLowerCase().replace(/['"]/g, "")
  );

  const col = (aliases: string[]) =>
    raw.findIndex((h) => aliases.includes(h));

  const nameIdx  = col(["naam", "name", "volledige naam", "full name"]);
  const emailIdx = col(["email", "e-mail", "e-mailadres", "emailadres"]);
  const phoneIdx = col(["telefoon", "phone", "tel", "mobiel"]);
  const skillIdx = col(["vaardigheden", "skills", "competenties"]);
  const availIdx = col(["beschikbaarheid", "availability", "beschikbaar"]);

  const errors: string[] = [];
  if (nameIdx === -1)  errors.push("Kolom 'naam' niet gevonden.");
  if (emailIdx === -1) errors.push("Kolom 'email' niet gevonden.");
  if (errors.length)   return { rows: [], errors };

  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const sep = lines[i].includes(";") ? ";" : ",";
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const email = cols[emailIdx]?.trim();
    const name  = cols[nameIdx]?.trim();
    if (!email || !name) continue;

    const rawSkills = skillIdx >= 0 ? (cols[skillIdx] ?? "") : "";
    const skills = rawSkills
      ? rawSkills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
      : [];

    rows.push({
      name,
      email,
      phone:        phoneIdx >= 0 ? (cols[phoneIdx] ?? "") : "",
      skills,
      availability: availIdx >= 0 ? (cols[availIdx] ?? "") : "",
    });
  }

  return {
    rows,
    errors: rows.length === 0 ? ["Geen geldige rijen gevonden."] : [],
  };
}

// ── Excel parser (dynamic import to keep bundle small) ───────
async function parseExcel(buffer: ArrayBuffer): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const wb   = XLSX.read(buffer, { type: "array" });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
    defval: "",
    raw: false,
  });

  if (json.length === 0) return { rows: [], errors: ["Spreadsheet heeft geen data."] };

  const headers = Object.keys(json[0]).map((h) => h.toLowerCase().trim());

  const col = (aliases: string[]) =>
    Object.keys(json[0]).find((k) => aliases.includes(k.toLowerCase().trim())) ?? null;

  const nameKey  = col(["naam", "name", "volledige naam", "full name"]);
  const emailKey = col(["email", "e-mail", "e-mailadres", "emailadres"]);
  const phoneKey = col(["telefoon", "phone", "tel", "mobiel"]);
  const skillKey = col(["vaardigheden", "skills", "competenties"]);
  const availKey = col(["beschikbaarheid", "availability", "beschikbaar"]);

  void headers;

  const errors: string[] = [];
  if (!nameKey)  errors.push("Kolom 'naam' niet gevonden.");
  if (!emailKey) errors.push("Kolom 'email' niet gevonden.");
  if (errors.length) return { rows: [], errors };

  const rows: ParsedRow[] = [];
  for (const row of json) {
    const name  = nameKey  ? (row[nameKey]  ?? "").trim() : "";
    const email = emailKey ? (row[emailKey] ?? "").trim() : "";
    if (!name || !email) continue;

    const rawSkills = skillKey ? (row[skillKey] ?? "").trim() : "";
    const skills = rawSkills
      ? rawSkills.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
      : [];

    rows.push({
      name,
      email,
      phone:        phoneKey ? (row[phoneKey] ?? "").trim() : "",
      skills,
      availability: availKey ? (row[availKey] ?? "").trim() : "",
    });
  }

  return {
    rows,
    errors: rows.length === 0 ? ["Geen geldige rijen gevonden."] : [],
  };
}

// ── Template download ────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([
    ["naam", "email", "telefoon", "vaardigheden", "beschikbaarheid"],
    ["Jan de Vries", "jan@voorbeeld.nl", "06 12345678", "EHBO, rijbewijs", "weekenden"],
    ["Lisa Bakker",  "lisa@voorbeeld.nl", "",           "communicatie",    "doordeweeks avonden"],
  ]);
  ws["!cols"] = [{ wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 30 }, { wch: 22 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vrijwilligers");
  XLSX.writeFile(wb, "vrijwilligers-template.xlsx");
}

// ── Page ─────────────────────────────────────────────────────
export default function ImportVrijwilligersPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [parsed,   setParsed]   = useState<ParseResult | null>(null);
  const [filename, setFilename] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{ created: number; skipped: number } | null>(null);
  const [error,    setError]    = useState("");

  async function handleFile(file: File) {
    setFilename(file.name);
    setParsed(null);
    setResult(null);
    setError("");

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type.includes("spreadsheet") ||
      file.type.includes("excel");

    if (isExcel) {
      const buf = await file.arrayBuffer();
      setParsed(await parseExcel(buf));
    } else {
      const text = await file.text();
      setParsed(parseCSV(text));
    }
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
      const res = await fetch("/api/vrijwilligers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
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
            <FileSpreadsheet size={18} className="text-terra-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink tracking-tight">Importeren via Excel</h1>
            <p className="text-xs text-ink-muted mt-0.5">Meerdere vrijwilligers tegelijk toevoegen</p>
          </div>
        </div>
      </div>

      {/* Format info + template */}
      <div className="card-base p-4 mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-ink mb-1">Ondersteunde kolommen</p>
          <p className="text-xs text-ink-muted font-mono leading-relaxed">
            naam · email · telefoon · vaardigheden · beschikbaarheid
          </p>
          <p className="text-[11px] text-ink-muted mt-1">
            Alleen <strong>naam</strong> en <strong>email</strong> zijn verplicht.
            Vaardigheden: kommagescheiden in één cel.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-terra-600 bg-terra-50 hover:bg-terra-100 border border-terra-100 px-3 py-2 rounded-xl transition-colors"
        >
          <Download size={13} />
          Template
        </button>
      </div>

      {/* Upload zone */}
      {!parsed ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="card-base border-dashed border-2 border-sand hover:border-terra-300 hover:bg-terra-50/20 flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all mb-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-sand/60 flex items-center justify-center">
            <Upload size={24} className="text-ink-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">Sleep een bestand hierheen</p>
            <p className="text-xs text-ink-muted mt-0.5">of klik om te selecteren</p>
            <p className="text-[11px] text-ink-muted/70 mt-2">.xlsx · .xls · .csv</p>
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="card-base overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 bg-cream/60 border-b border-sand">
            <div className="flex items-center gap-2 min-w-0">
              <FileSpreadsheet size={14} className="text-ink-muted shrink-0" />
              <span className="text-sm font-semibold text-ink truncate">{filename}</span>
            </div>
            <button
              onClick={() => { setParsed(null); setFilename(""); setResult(null); setError(""); }}
              className="text-ink-muted hover:text-ink p-1 shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          {parsed.errors.length > 0 ? (
            <div className="p-4 space-y-2">
              {parsed.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-red-600 text-sm">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  {e}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="px-4 py-2.5 bg-green-50 border-b border-sand">
                <p className="text-xs font-semibold text-green-700">
                  {parsed.rows.length} vrijwilliger{parsed.rows.length !== 1 ? "s" : ""} gevonden
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-sand/60">
                {parsed.rows.slice(0, 100).map((row, i) => (
                  <div key={i} className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{row.name}</p>
                        <p className="text-xs text-ink-muted truncate">
                          {row.email}
                          {row.phone ? ` · ${row.phone}` : ""}
                        </p>
                      </div>
                      {row.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 shrink-0 max-w-[140px] justify-end">
                          {row.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] bg-terra-50 text-terra-700 border border-terra-100 px-1.5 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                          {row.skills.length > 3 && (
                            <span className="text-[10px] text-ink-muted">+{row.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {parsed.rows.length > 100 && (
                  <p className="px-4 py-2.5 text-xs text-ink-muted">
                    + {parsed.rows.length - 100} meer…
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        onChange={onInputChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center mb-4">
          <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-green-800">{result.created} toegevoegd</p>
          {result.skipped > 0 && (
            <p className="text-sm text-green-600 mt-1">
              {result.skipped} overgeslagen (e-mailadres al aanwezig)
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard/vrijwilligers")}
            className="mt-4 px-5 py-2.5 bg-terra-500 text-white rounded-xl text-sm font-bold hover:bg-terra-600 transition-colors"
          >
            Naar vrijwilligerspool
          </button>
        </div>
      )}

      {/* Import button */}
      {parsed && !result && parsed.errors.length === 0 && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full py-3.5 bg-terra-500 text-white rounded-2xl text-sm font-bold hover:bg-terra-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {loading
            ? "Importeren…"
            : `${parsed.rows.length} vrijwilliger${parsed.rows.length !== 1 ? "s" : ""} importeren`}
        </button>
      )}
    </div>
  );
}
