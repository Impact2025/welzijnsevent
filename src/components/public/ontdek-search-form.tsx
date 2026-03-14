"use client";

import { useRef } from "react";
import { Search } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function OntdekSearchForm({ defaultValue }: { defaultValue: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const q = inputRef.current?.value.trim() ?? "";
    if (q) trackEvent("search", { search_term: q, search_location: "ontdek" });
  }

  return (
    <form className="max-w-lg mx-auto flex gap-2" onSubmit={handleSubmit}>
      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          ref={inputRef}
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder="Zoek op naam, locatie of organisatie…"
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-ink bg-white outline-none focus:ring-2 focus:ring-white/50"
        />
      </div>
      <button
        type="submit"
        className="bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors border border-white/20"
      >
        Zoeken
      </button>
    </form>
  );
}
