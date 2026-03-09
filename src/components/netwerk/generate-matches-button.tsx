"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  eventId: string;
  hasExistingMatches: boolean;
  attendeeCount: number;
}

export function GenerateMatchesButton({ eventId, hasExistingMatches, attendeeCount }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ generated: number; model: string; attendeesAnalyzed: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function generate() {
    if (attendeeCount < 2) return;
    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/generate-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onbekende fout");

      setResult(data);
      setStatus("success");

      // Herlaad na 2 seconden om nieuwe matches te tonen
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Er is iets misgegaan");
      setStatus("error");
    }
  }

  if (attendeeCount < 2) {
    return (
      <div className="bg-sand/60 rounded-2xl p-4 text-center">
        <p className="text-xs text-ink-muted">
          Voeg minimaal 2 deelnemers toe om AI-matching te gebruiken
        </p>
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={16} className="text-green-600" />
          <span className="text-sm font-bold text-green-700">{result.generated} matches gegenereerd</span>
        </div>
        <p className="text-xs text-green-600">
          {result.attendeesAnalyzed} deelnemers geanalyseerd · Pagina herlaadt...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={generate}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2.5 bg-terra-500 hover:bg-terra-600 active:bg-terra-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-sm"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>AI analyseert {attendeeCount} deelnemers...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>
              {hasExistingMatches ? "Matches opnieuw genereren" : "Genereer AI Matches"}
            </span>
          </>
        )}
      </button>

      {status === "loading" && (
        <div className="bg-terra-50 border border-terra-200/50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-terra-400 animate-pulse" />
            <p className="text-xs font-semibold text-terra-700">AI is aan het werk</p>
          </div>
          <p className="text-xs text-terra-600/80 leading-relaxed">
            Profielen worden geanalyseerd op overlappende expertise, complementaire rollen en gedeelde interesses...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-700 mb-0.5">Genereren mislukt</p>
            <p className="text-xs text-red-600">{errorMsg}</p>
            <button
              onClick={generate}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <RefreshCw size={11} />
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}

      {hasExistingMatches && status === "idle" && (
        <p className="text-center text-xs text-ink-muted">
          Bestaande matches worden vervangen door nieuwe AI-analyse
        </p>
      )}
    </div>
  );
}
