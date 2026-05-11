"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  context?: Record<string, string>;
  className?: string;
}

export function SkillTagsInput({ value, onChange, context, className }: Props) {
  const [input,      setInput]      = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(tag: string) {
    const t = tag.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
  }

  function remove(tag: string) {
    onChange(value.filter((v) => v !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      add(input);
      setInput("");
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      remove(value[value.length - 1]);
    }
  }

  async function suggestSkills() {
    if (!context?.title) return;
    setSuggesting(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "vacancy_skills", context }),
      });
      const data = await res.json();
      if (data.text) {
        const skills = data.text
          .split("\n")
          .map((s: string) => s.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean)
          .slice(0, 8);
        setSuggestions(skills);
      }
    } catch { /* ignore */ } finally {
      setSuggesting(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tag field */}
      <div
        className="flex flex-wrap gap-1.5 min-h-[44px] rounded-xl border border-sand bg-white px-3 py-2 cursor-text focus-within:border-terra-300 focus-within:ring-1 focus-within:ring-terra-200 transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-terra-50 text-terra-700 border border-terra-200 rounded-lg text-xs font-semibold px-2 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove(tag); }}
              className="hover:text-terra-900 transition-colors"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (input.trim()) { add(input); setInput(""); } }}
          placeholder={value.length === 0 ? "bijv. EHBO-diploma, rijbewijs B…" : "Voeg toe…"}
          className="flex-1 min-w-[140px] text-sm text-ink outline-none placeholder-ink-muted/40 bg-transparent"
        />
      </div>

      {/* AI suggestie knop */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={suggestSkills}
          disabled={suggesting || !context?.title}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-terra-50 text-terra-600 border border-terra-200 hover:bg-terra-100 disabled:opacity-40 transition-all"
        >
          {suggesting ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {suggesting ? "Bezig…" : "Suggereer met AI"}
        </button>
        <span className="text-[11px] text-ink-muted">
          Druk Enter of komma om toe te voegen
        </span>
      </div>

      {/* AI suggestions chips */}
      {suggestions.length > 0 && (
        <div className="p-3 bg-terra-50/60 rounded-xl border border-terra-100 space-y-2">
          <p className="text-[11px] font-bold text-terra-700 uppercase tracking-wider">
            AI-suggesties — klik om toe te voegen
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => {
              const added = value.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => { if (!added) { add(s); } }}
                  disabled={added}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg text-xs font-semibold px-2.5 py-1 border transition-all",
                    added
                      ? "bg-terra-100 text-terra-500 border-terra-200 cursor-default"
                      : "bg-white text-terra-700 border-terra-200 hover:bg-terra-100 cursor-pointer"
                  )}
                >
                  {!added && <Plus size={10} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
