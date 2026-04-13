"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Calendar, Users, Mic2, Building2, Ticket,
  Radio, Network, BarChart3, Globe, MoreHorizontal, X,
} from "lucide-react";

// ── Tab definitions ────────────────────────────────────────────────────────
const ALL_TABS = [
  { label: "Programma",    segment: "",           icon: Calendar  },
  { label: "Deelnemers",   segment: "deelnemers", icon: Users     },
  { label: "Live",         segment: "live",       icon: Radio     },
  { label: "Statistieken", segment: "analytics",  icon: BarChart3 },
  { label: "Sprekers",     segment: "sprekers",   icon: Mic2      },
  { label: "Sponsors",     segment: "sponsors",   icon: Building2 },
  { label: "Tickets",      segment: "tickets",    icon: Ticket    },
  { label: "Netwerk",      segment: "netwerk",    icon: Network   },
  { label: "Website",      segment: "website",    icon: Globe     },
] as const;

// ── Which tabs are visible per event type ─────────────────────────────────
const TABS_BY_TYPE: Record<string, string[]> = {
  klein:       ["", "deelnemers", "analytics"],
  programma:   ["", "deelnemers", "live", "sprekers", "analytics"],
  netwerk:     ["", "deelnemers", "live", "netwerk", "analytics"],
  conferentie: ["", "deelnemers", "live", "analytics", "sprekers", "sponsors", "tickets", "netwerk", "website"],
};

// On mobile, show this many tabs before collapsing the rest into "Meer"
const MOBILE_MAX_PRIMARY = 3;

// ── Component ─────────────────────────────────────────────────────────────
export function EventTabs({
  eventId,
  eventType = "programma",
}: {
  eventId: string;
  eventType?: string | null;
}) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;
  const [meerOpen, setMeerOpen] = useState(false);

  const allowedSegments = TABS_BY_TYPE[eventType ?? "programma"] ?? TABS_BY_TYPE.programma;
  const visibleTabs = ALL_TABS.filter((t) => allowedSegments.includes(t.segment));

  const mobilePrimary = visibleTabs.slice(0, MOBILE_MAX_PRIMARY);
  const mobileMore    = visibleTabs.slice(MOBILE_MAX_PRIMARY);
  const hasMobileMore = mobileMore.length > 0;

  function isActive(segment: string) {
    if (segment === "") return pathname === base;
    return pathname.startsWith(`${base}/${segment}`);
  }

  const anyMoreActive = mobileMore.some((t) => isActive(t.segment));

  return (
    <>
      <div className="border-b border-sand relative">

        {/* Desktop: all visible tabs in one row */}
        <div className="hidden md:flex overflow-x-auto scrollbar-hide px-6">
          {visibleTabs.map(({ label, segment, icon: Icon }) => {
            const href   = segment ? `${base}/${segment}` : base;
            const active = isActive(segment);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                  active
                    ? "text-terra-500 border-terra-500"
                    : "text-ink-muted border-transparent hover:text-ink"
                )}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile: primary tabs + optional "Meer" */}
        <div className="md:hidden flex overflow-x-auto scrollbar-hide px-4 pr-10">
          {mobilePrimary.map(({ label, segment, icon: Icon }) => {
            const href   = segment ? `${base}/${segment}` : base;
            const active = isActive(segment);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                  active
                    ? "text-terra-500 border-terra-500"
                    : "text-ink-muted border-transparent hover:text-ink"
                )}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}

          {hasMobileMore && (
            <button
              onClick={() => setMeerOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0",
                anyMoreActive
                  ? "text-terra-500 border-terra-500"
                  : "text-ink-muted border-transparent hover:text-ink"
              )}
            >
              <MoreHorizontal size={14} />
              Meer
            </button>
          )}
        </div>

        {/* Fade right as scroll hint (mobile) */}
        <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* "Meer" bottom sheet — mobile only */}
      {meerOpen && hasMobileMore && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMeerOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
              <p className="text-sm font-bold text-ink">Meer</p>
              <button
                onClick={() => setMeerOpen(false)}
                className="p-1.5 rounded-xl hover:bg-sand transition-colors"
              >
                <X size={16} className="text-ink-muted" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {mobileMore.map(({ label, segment, icon: Icon }) => {
                const href   = `${base}/${segment}`;
                const active = isActive(segment);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMeerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors",
                      active ? "bg-terra-50 text-terra-600" : "text-ink hover:bg-sand/50"
                    )}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-terra-500" : "text-ink-muted"}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span className="text-sm font-semibold">{label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-terra-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
