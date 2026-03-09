import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Product: [
    { href: "/functies", label: "Functies" },
    { href: "/prijzen", label: "Prijzen" },
    { href: "/dashboard", label: "Inloggen" },
    { href: "/dashboard", label: "Gratis starten" },
  ],
  Bedrijf: [
    { href: "/over-ons", label: "Over ons" },
    { href: "/over-ons#contact", label: "Contact" },
    { href: "/over-ons#weareimpact", label: "WeAreImpact.nl" },
  ],
  Contact: [
    { href: "mailto:hallo@bijeen.nl", label: "hallo@bijeen.nl" },
    { href: "/over-ons#demo", label: "Demo aanvragen" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[#12100E] border-t border-white/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-terra-500 flex items-center justify-center shadow-lg shadow-terra-500/30">
                <Zap size={14} className="text-white fill-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Bijeen</span>
            </Link>
            <p className="text-white/35 text-sm leading-relaxed">
              Eventplatform voor de welzijnssector. Gebouwd door WeAreImpact.nl.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest mb-4">
                {section}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-white/45 hover:text-white text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">
            © 2025 Bijeen — een concept van WeAreImpact.nl
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              AVG-compliant
            </Link>
            <Link href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Verwerkersovereenkomst
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
