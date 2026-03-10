"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Building2, Sparkles, ArrowLeft, Shield, Menu, X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin",              icon: LayoutDashboard, label: "Overzicht",    exact: true },
  { href: "/admin/organisaties", icon: Building2,       label: "Organisaties"              },
  { href: "/admin/ai-inzichten", icon: Sparkles,        label: "AI Inzichten"              },
  { href: "/admin/audit-log",    icon: Shield,          label: "Audit Log"                 },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const path = usePathname();

  return (
    <>
      {/* Logo + Admin Badge */}
      <div className="px-2 mb-6">
        <Link href="/admin" onClick={onClose}>
          <div className="bg-white rounded-xl px-3 py-2.5 inline-flex items-center shadow-sm">
            <Image src="/Bijeen-logo.png" alt="Bijeen" width={90} height={28} className="h-6 w-auto" priority />
          </div>
        </Link>
        <div className="mt-2.5 inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-red-500/25">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Admin Panel
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = exact ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/8"
              )}
            >
              <Icon
                size={17}
                className={cn(active ? "text-[#C8522A]" : "text-current")}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Back to app */}
      <div className="border-t border-white/10 pt-4 mt-2">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/8 transition-all"
        >
          <ArrowLeft size={16} />
          Terug naar app
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] min-h-screen bg-[#1C1814] flex-col py-5 px-3 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#1C1814] border-b border-white/10">
        <Link href="/admin">
          <div className="bg-white rounded-lg px-2.5 py-1.5 inline-flex items-center">
            <Image src="/Bijeen-logo.png" alt="Bijeen" width={70} height={22} className="h-5 w-auto" priority />
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-[260px] bg-[#1C1814] flex flex-col py-5 px-3 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-white/50 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Mobile top padding spacer */}
      <div className="md:hidden h-[53px] shrink-0" />
    </>
  );
}
