"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Settings, Bell, Plus, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Overzicht"    },
  { href: "/dashboard/events",       icon: Calendar,        label: "Evenementen"  },
  { href: "/dashboard/instellingen", icon: Settings,        label: "Instellingen" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <>
    <aside className="hidden md:flex w-[220px] min-h-screen bg-[#12100E] flex-col py-5 px-3 shrink-0">
      {/* Logo */}
      <div className="px-2 mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shrink-0 shadow-lg shadow-terra-500/30">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">Bijeen</span>
        </div>
      </div>

      {/* New event CTA */}
      <Link
        href="/dashboard/events/new"
        className="flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white rounded-xl px-3 py-2.5 text-sm font-semibold mb-6 transition-all duration-150 shadow-lg shadow-terra-500/25"
      >
        <Plus size={15} />
        Nieuw evenement
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
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
      </nav>

      {/* Divider */}
      <div className="border-t border-white/8 pt-4 mt-2">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-terra-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold">H</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">Humanitas Utrecht</p>
            <p className="text-[11px] text-white/35 truncate">Organisator</p>
          </div>
          <Bell size={13} className="text-white/25 shrink-0 hover:text-white/60 cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>

    {/* Mobile bottom navigation */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#12100E] border-t border-white/10 flex items-center justify-around px-2 pb-safe">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = path === href || (href !== "/dashboard" && path.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center rounded-xl transition-all duration-150",
              active ? "text-terra-400" : "text-white/40"
            )}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[11px] font-semibold">{label}</span>
          </Link>
        );
      })}
      <Link
        href="/dashboard/events/new"
        className="flex flex-col items-center gap-1 flex-1 py-2 min-h-[56px] justify-center rounded-xl transition-all duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/30">
          <Plus size={18} className="text-white" />
        </div>
        <span className="text-[11px] font-semibold text-white/40">Nieuw</span>
      </Link>
    </nav>
    </>
  );
}
