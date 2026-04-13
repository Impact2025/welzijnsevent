"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/actions/auth";
import { LogOut,
  LayoutDashboard, Calendar, Settings, Plus, Search, ExternalLink, Users,
} from "lucide-react";

import { cn, getInitials, avatarColor } from "@/lib/utils";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";
import { PLAN_LIMITS } from "@/lib/plans";

const BASE_NAV = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Overzicht"    },
  { href: "/dashboard/events",       icon: Calendar,        label: "Evenementen"  },
];

const SETTINGS_NAV = [
  { href: "/dashboard/instellingen", icon: Settings,        label: "Instellingen" },
];

interface SidebarProps {
  orgName: string;
  orgLogo: string | null;
  plan: string | null;
  subscriptionActive: boolean;
  showCrm?: boolean;
}

export function Sidebar({ orgName, orgLogo, plan, subscriptionActive, showCrm = false }: SidebarProps) {
  const navItems = [
    ...BASE_NAV,
    ...(showCrm ? [{ href: "/dashboard/crm", icon: Users, label: "CRM" }] : []),
    ...SETTINGS_NAV,
  ];
  const path = usePathname();
  const initials = getInitials(orgName);
  const color = avatarColor(orgName);
  const planLabel = plan ? PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.label ?? plan : null;

  return (
    <>
    <aside className="hidden md:flex w-[220px] min-h-screen bg-[#12100E] flex-col py-5 px-3 shrink-0">
      {/* Logo */}
      <div className="px-2 mb-7">
        <Link href="/dashboard" className="inline-flex items-center px-1 py-1">
          <BijeenWordmark variant="light" size="md" />
        </Link>
      </div>

      {/* New event CTA */}
      <Link
        href="/dashboard/events/new"
        data-tour="new-event"
        className="flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white rounded-xl px-3 py-2.5 text-sm font-semibold mb-6 transition-all duration-150 shadow-lg shadow-terra-500/25"
      >
        <Plus size={15} />
        Nieuw evenement
      </Link>

      {/* Search / Command palette trigger */}
      <button
        onClick={() => {
          const e = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
          window.dispatchEvent(e);
        }}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/35 hover:text-white/60 hover:bg-white/5 text-xs mb-2 transition-colors border border-white/8"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Zoeken…</span>
        <kbd className="text-[9px] bg-white/8 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      {/* Navigation */}
      <nav data-tour="nav" className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white/75 hover:bg-white/5"
              )}
            >
              <Icon
                size={17}
                className={cn(active ? "text-terra-400" : "text-current")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
        {/* Ontdek link */}
        <a
          href="/ontdek"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/35 hover:text-white/60 hover:bg-white/5 transition-all duration-150 mt-auto"
        >
          <ExternalLink size={17} strokeWidth={2} />
          Ontdek
        </a>
      </nav>

      {/* User / Org footer */}
      <div className="border-t border-white/8 pt-4 mt-2">
        <div className="flex items-center gap-2.5 px-2">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-[11px] font-bold">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">{orgName}</p>
            {planLabel && (
              <p className={cn(
                "text-[10px] truncate font-medium",
                subscriptionActive ? "text-terra-400" : "text-amber-400"
              )}>
                {planLabel}{!subscriptionActive && " — verlopen"}
              </p>
            )}
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title="Uitloggen"
              className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </div>
    </aside>

    {/* Mobile bottom navigation */}
    <nav data-tour="nav-mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#12100E]/95 backdrop-blur-xl border-t border-white/8 flex items-center justify-around px-1 pb-safe">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = path === href || (href !== "/dashboard" && path.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => { if (navigator.vibrate) navigator.vibrate(8); }}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center rounded-xl transition-all duration-200 active:scale-90",
              active ? "text-terra-400" : "text-white/40"
            )}
          >
            <div className={cn(
              "w-10 h-6 rounded-full flex items-center justify-center transition-all duration-200",
              active ? "bg-terra-500/15" : ""
            )}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={cn("text-[10px] font-semibold tracking-tight", active ? "text-terra-400" : "text-white/35")}>
              {label}
            </span>
          </Link>
        );
      })}
      <Link
        href="/dashboard/events/new"
        data-tour="new-event-mobile"
        onClick={() => { if (navigator.vibrate) navigator.vibrate(10); }}
        className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center rounded-xl transition-all duration-200 active:scale-90"
      >
        <div className="w-10 h-10 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/40 transition-transform">
          <Plus size={18} className="text-white" />
        </div>
        <span className="text-[10px] font-semibold text-white/35 tracking-tight">Nieuw</span>
      </Link>
    </nav>
    </>
  );
}
