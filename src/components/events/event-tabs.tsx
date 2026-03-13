"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Programma",    segment: ""           },
  { label: "Deelnemers",   segment: "deelnemers" },
  { label: "Sprekers",     segment: "sprekers"   },
  { label: "Sponsors",     segment: "sponsors"   },
  { label: "Tickets",      segment: "tickets"    },
  { label: "Netwerk",      segment: "netwerk"    },
  { label: "Statistieken", segment: "analytics"  },
  { label: "Website",      segment: "website"    },
];

export function EventTabs({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;

  return (
    <div className="border-b border-sand px-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {TABS.map(({ label, segment }) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = segment === ""
            ? pathname === base
            : pathname.startsWith(`${base}/${segment}`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors",
                active
                  ? "text-terra-500 border-terra-500"
                  : "text-ink-muted border-transparent hover:text-ink"
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
