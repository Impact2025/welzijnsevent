"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const links = [
  { href: "/functies", label: "Functies" },
  { href: "/prijzen",  label: "Prijzen"  },
  { href: "/over-ons", label: "Over ons" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-cream/95 backdrop-blur-md border-b border-ink/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/Bijeen-logo.png" alt="Bijeen" width={120} height={36} className="h-9 w-auto" priority />
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
                  ? "text-ink bg-ink/8"
                  : "text-ink/55 hover:text-ink hover:bg-ink/5"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {!isSignedIn ? (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-ink/55 hover:text-ink transition-colors rounded-xl hover:bg-ink/5"
              >
                Inloggen
              </Link>
              <Link
                href="/sign-in"
                className="flex items-center gap-1.5 bg-terra-500 hover:bg-terra-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-terra-500/25"
              >
                Gratis starten
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-ink/55 hover:text-ink transition-colors rounded-xl hover:bg-ink/5"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="px-4 py-2 text-sm font-medium text-ink/55 hover:text-ink transition-colors rounded-xl hover:bg-ink/5"
              >
                Uitloggen
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-ink/60 hover:text-ink p-2 -mr-2 rounded-xl hover:bg-ink/5 transition-colors"
          aria-label={open ? "Sluit menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-ink/8 bg-cream px-4 pb-4 pt-2 space-y-0.5 animate-fade-in">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                path.startsWith(href)
                  ? "text-ink bg-ink/8"
                  : "text-ink/60 hover:text-ink hover:bg-ink/5"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-ink/8 space-y-2 mt-2">
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
                  className="block px-3 py-3 text-sm font-medium text-ink/50 text-center rounded-xl hover:bg-ink/5 transition-colors"
                >
                  Inloggen
                </Link>
                <Link
                  href="/sign-in"
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
