"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Radio, Users, MessageSquare } from "lucide-react";

const tabs = [
  { label: "Programma", href: (slug: string) => `/e/${slug}`,           icon: Calendar,      exact: true },
  { label: "Live",      href: (slug: string) => `/e/${slug}/live`,      icon: Radio          },
  { label: "Wall",      href: (slug: string) => `/e/${slug}/wall`,      icon: MessageSquare  },
  { label: "Community", href: (slug: string) => `/e/${slug}/community`, icon: Users          },
];

export function EventNav({
  slug,
  eventTitle,
  primaryColor = "#C8522A",
}: {
  slug: string;
  eventTitle: string;
  primaryColor?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <div className="px-4 pt-2 pb-0">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">
            {eventTitle}
          </p>
        </div>
        {/* Scrollable tabs — no clipping on small screens */}
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {tabs.map((tab) => {
            const href = tab.href(slug);
            const isActive = tab.exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className="flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-3 text-[12px] font-bold transition-colors relative whitespace-nowrap"
                style={{ color: isActive ? primaryColor : "#9ca3af" }}
              >
                <tab.icon size={13} />
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
