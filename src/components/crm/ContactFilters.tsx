"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";

const LIFECYCLE_OPTIONS = [
  { value: "",          label: "Alle" },
  { value: "contact",   label: "Contact" },
  { value: "betrokken", label: "Betrokken" },
  { value: "actief",    label: "Actief" },
  { value: "vip",       label: "VIP" },
  { value: "inactief",  label: "Inactief" },
];

const SORT_OPTIONS = [
  { value: "last_seen", label: "Laatste activiteit" },
  { value: "name",      label: "Naam A–Z" },
  { value: "events",    label: "Meeste events" },
  { value: "score",     label: "Hoogste score" },
];

export function ContactFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q         = searchParams.get("q")         ?? "";
  const lifecycle = searchParams.get("lifecycle") ?? "";
  const sort      = searchParams.get("sort")      ?? "last_seen";

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }, [searchParams, pathname, router]);

  const hasFilters = q || lifecycle || sort !== "last_seen";

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-sand rounded-xl px-4 py-2.5">
          <Search size={14} className="text-ink-muted shrink-0" />
          <input
            type="text"
            placeholder="Zoek op naam, e-mail of organisatie..."
            defaultValue={q}
            onChange={e => update("q", e.target.value)}
            className="bg-transparent flex-1 text-sm outline-none text-ink placeholder-ink-muted/50 font-medium"
          />
          {q && (
            <button onClick={() => update("q", "")} className="text-ink-muted hover:text-ink">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => update("sort", e.target.value)}
          className="bg-white border border-sand rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted outline-none cursor-pointer hover:bg-sand transition-colors"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Lifecycle tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {LIFECYCLE_OPTIONS.map(o => (
          <button
            key={o.value}
            onClick={() => update("lifecycle", o.value)}
            className={cn(
              "text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all",
              lifecycle === o.value
                ? "bg-ink text-white border-ink"
                : "bg-white text-ink-muted border-sand hover:border-ink/20 hover:text-ink"
            )}
          >
            {o.label}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={() => {
              const params = new URLSearchParams();
              startTransition(() => router.push(pathname));
            }}
            className="text-xs font-semibold px-3 py-1.5 text-terra-500 hover:text-terra-600 flex items-center gap-1"
          >
            <X size={11} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
