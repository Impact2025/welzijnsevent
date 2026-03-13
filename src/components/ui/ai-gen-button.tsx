"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  type:      "description" | "tagline" | "bio" | "session" | "email_subject";
  context:   Record<string, string>;
  onResult:  (text: string) => void;
  disabled?: boolean;
  label?:    string;
}

export function AiGenButton({ type, context, onResult, disabled, label = "Genereer" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/ai/generate-content", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ type, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Mislukt");
      onResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fout");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generate}
      disabled={disabled || loading}
      title={error || `${label} met AI`}
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
        error
          ? "bg-red-50 text-red-500 border border-red-200"
          : "bg-terra-50 text-terra-600 border border-terra-200 hover:bg-terra-100 disabled:opacity-40"
      }`}
    >
      {loading
        ? <Loader2 size={11} className="animate-spin" />
        : <Sparkles size={11} />
      }
      {error ? "Fout" : loading ? "Bezig…" : label}
    </button>
  );
}
