"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut,
  LayoutDashboard, Calendar, Settings, Plus,
} from "lucide-react";

import { cn, getInitials, avatarColor } from "@/lib/utils";
import { BijeenWordmark } from "@/components/ui/bijeen-wordmark";
import { PLAN_LIMITS } from "@/lib/plans";

const navItems = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Overzicht"    },
  { href: "/dashboard/events",       icon: Calendar,        label: "Evenementen"  },
  { href: "/dashboard/instellingen", icon: Settings,        label: "Instellingen" },
];

interface SidebarProps {
  orgName: string;
  orgLogo: string | null;
  plan: string | null;
  subscriptionActive: boolean;
}

export function Sidebar({ orgName, orgLogo, plan, subscriptionActive }: SidebarProps) {
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
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            title="Uitloggen"
            className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>

    {/* Mobile bottom navigation */}
    <nav data-tour="nav-mobile" className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#12100E] border-t border-white/10 flex items-center justify-around px-2 pb-safe">
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
        data-tour="new-event-mobile"
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
