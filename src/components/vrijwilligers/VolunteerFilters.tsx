"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "",         label: "Alle" },
  { value: "pending",  label: "Wacht op review" },
  { value: "accepted", label: "Geaccepteerd" },
  { value: "nieuw",    label: "Geen aanmelding" },
];

export function VolunteerFilters({ allSkills }: { allSkills: string[] }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const params      = useSearchParams();

  const q      = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const skill  = params.get("skill") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const hasFilters = q || status || skill;

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/50" />
        <input
          type="search"
          value={q}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Zoek op naam, email of skill…"
          className="w-full bg-white border border-sand rounded-xl pl-9 pr-3 py-2.5 text-sm text-ink placeholder-ink-muted/40 outline-none focus:border-terra-300 transition-colors"
        />
      </div>

      {/* Status + skill filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("status", opt.value)}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
                status === opt.value
                  ? "bg-terra-500 text-white border-terra-500"
                  : "bg-white text-ink-muted border-sand hover:border-terra-300 hover:text-ink"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Skill filter */}
        {allSkills.length > 0 && (
          <select
            value={skill}
            onChange={(e) => update("skill", e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-sand bg-white text-ink-muted outline-none focus:border-terra-300 transition-colors"
          >
            <option value="">Alle skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => router.replace(pathname)}
            className="flex items-center gap-1 text-xs text-ink-muted/60 hover:text-ink-muted transition-colors px-2 py-1.5"
          >
            <X size={12} />
            Wis filters
          </button>
        )}
      </div>
    </div>
  );
}
