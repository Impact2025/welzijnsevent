import type { Metadata } from "next";

/**
 * Inlogpagina's horen niet in de zoekresultaten. Ze stonden wél in robots.txt
 * als "Disallow: /sign-in/" — mét trailing slash, waardoor /sign-in en
 * /sign-in?new=true er niet onder vielen en alsnog geïndexeerd raakten
 * (samen ~49 impressies in Search Console).
 *
 * Een crawl-blokkade is hier het verkeerde middel: een pagina die Google niet
 * mag ophalen kan hij ook niet uit de index halen. Daarom staan /sign-in en
 * /sign-up bewust wél open voor de crawler (zie src/app/robots.ts) en zetten we
 * hier noindex, zodat Google ze daadwerkelijk laat vallen.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
