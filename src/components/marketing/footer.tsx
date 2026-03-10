import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { href: "/functies",  label: "Functies"      },
    { href: "/prijzen",   label: "Prijzen"        },
    { href: "/sign-in",   label: "Inloggen"       },
    { href: "/sign-up",   label: "Gratis starten" },
  ],
  Bedrijf: [
    { href: "/over-ons",             label: "Over ons"       },
    { href: "/over-ons#contact",     label: "Contact"        },
    { href: "/over-ons#weareimpact", label: "WeAreImpact.nl" },
  ],
  Contact: [
    { href: "mailto:hallo@bijeen.nl", label: "hallo@bijeen.nl"  },
    { href: "/over-ons#demo",         label: "Demo aanvragen"   },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-cream border-t border-ink/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <Image src="/Bijeen-logo-footer.png" alt="Bijeen" width={110} height={34} className="h-8 w-auto" />
            </Link>
            <p className="text-ink/45 text-sm leading-relaxed">
              Eventplatform voor de welzijnssector. Gebouwd door WeAreImpact.nl.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-ink/35 text-[11px] font-bold uppercase tracking-widest mb-4">
                {section}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-ink/55 hover:text-ink text-sm transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink/30 text-sm">
            © {new Date().getFullYear()} Bijeen — een concept van WeAreImpact.nl
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-ink/30 hover:text-ink/60 text-xs transition-colors">Privacy</Link>
            <Link href="#" className="text-ink/30 hover:text-ink/60 text-xs transition-colors">AVG-compliant</Link>
            <Link href="#" className="text-ink/30 hover:text-ink/60 text-xs transition-colors">Verwerkersovereenkomst</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
