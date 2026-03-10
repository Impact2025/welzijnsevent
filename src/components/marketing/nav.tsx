"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/functies", label: "Functies" },
  { href: "/prijzen",  label: "Prijzen"  },
  { href: "/over-ons", label: "Over ons" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#12100E]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/30">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">Bijeen</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                path.startsWith(href)
                  ? "text-white bg-white/10"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <SignedOut>
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm font-medium text-white/55 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              Inloggen
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-terra-500/25"
            >
              Gratis starten
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-white/55 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{ elements: { avatarBox: "w-8 h-8" } }}
            />
          </SignedIn>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/70 hover:text-white p-2 -mr-2 rounded-xl hover:bg-white/5 transition-colors"
          aria-label={open ? "Sluit menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/8 bg-[#12100E] px-4 pb-4 pt-2 space-y-0.5 animate-fade-in">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                path.startsWith(href)
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/8 space-y-2 mt-2">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-colors"
              >
                Naar dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 text-sm font-medium text-white/50 text-center rounded-xl hover:bg-white/5 transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="block bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-colors"
                >
                  Gratis starten
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
