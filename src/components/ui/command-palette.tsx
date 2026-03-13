"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Users, LayoutDashboard, Settings, Plus, ExternalLink, X } from "lucide-react";

interface Result {
  id:       string;
  label:    string;
  sub?:     string;
  href:     string;
  icon:     React.ReactNode;
  external?: boolean;
}

const STATIC_COMMANDS: Result[] = [
  { id: "dash",      label: "Dashboard",           href: "/dashboard",             icon: <LayoutDashboard size={15} /> },
  { id: "events",    label: "Evenementen",          href: "/dashboard/events",      icon: <Calendar size={15} /> },
  { id: "new-event", label: "Nieuw evenement",      href: "/dashboard/events/new",  icon: <Plus size={15} /> },
  { id: "settings",  label: "Instellingen",         href: "/dashboard/instellingen",icon: <Settings size={15} /> },
  { id: "ontdek",    label: "Ontdek evenementen",   href: "/ontdek",                icon: <ExternalLink size={15} />, external: true },
];

export function CommandPalette() {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Result[]>(STATIC_COMMANDS);
  const [active,  setActive]  = useState(0);
  const [events,  setEvents]  = useState<Result[]>([]);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Laad events eenmalig
  useEffect(() => {
    fetch("/api/events?limit=50")
      .then(r => r.json())
      .then(data => {
        if (!data.events) return;
        setEvents(
          (data.events as { id: string; title: string; location?: string }[]).map(e => ({
            id:    e.id,
            label: e.title,
            sub:   e.location ?? undefined,
            href:  `/dashboard/events/${e.id}`,
            icon:  <Calendar size={15} />,
          }))
        );
      })
      .catch(() => {});
  }, []);

  // Filter op query
  useEffect(() => {
    const q = query.toLowerCase().trim();
    const pool = [...STATIC_COMMANDS, ...events];
    if (!q) {
      setResults(STATIC_COMMANDS);
    } else {
      setResults(
        pool.filter(
          r =>
            r.label.toLowerCase().includes(q) ||
            (r.sub?.toLowerCase().includes(q) ?? false)
        )
      );
    }
    setActive(0);
  }, [query, events]);

  // ⌘K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback((result: Result) => {
    setOpen(false);
    if (result.external) {
      window.open(result.href, "_blank");
    } else {
      router.push(result.href);
    }
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      navigate(results[active]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-sand"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-sand">
          <Search size={16} className="text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Zoek evenement of actie…"
            className="flex-1 text-sm text-ink outline-none bg-transparent placeholder-ink-muted/50"
          />
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 p-1 rounded-lg text-ink-muted hover:bg-sand transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted text-center">Geen resultaten</p>
          ) : (
            results.map((result, i) => (
              <button
                key={result.id}
                onClick={() => navigate(result)}
                onMouseEnter={() => setActive(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-terra-50" : "hover:bg-sand/40"
                }`}
              >
                <div className={`shrink-0 ${i === active ? "text-terra-600" : "text-ink-muted"}`}>
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${i === active ? "text-terra-700" : "text-ink"}`}>
                    {result.label}
                  </p>
                  {result.sub && (
                    <p className="text-xs text-ink-muted truncate">{result.sub}</p>
                  )}
                </div>
                {result.external && <ExternalLink size={11} className="text-ink-muted shrink-0" />}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-sand bg-cream/50 flex items-center gap-4">
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <kbd className="bg-sand px-1 py-0.5 rounded text-[9px] font-mono border border-sand/80">↑↓</kbd>
            navigeren
          </span>
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <kbd className="bg-sand px-1 py-0.5 rounded text-[9px] font-mono border border-sand/80">↵</kbd>
            openen
          </span>
          <span className="text-[10px] text-ink-muted flex items-center gap-1">
            <kbd className="bg-sand px-1 py-0.5 rounded text-[9px] font-mono border border-sand/80">Esc</kbd>
            sluiten
          </span>
          <span className="ml-auto text-[10px] text-ink-muted/60">⌘K</span>
        </div>
      </div>
    </div>
  );
}
