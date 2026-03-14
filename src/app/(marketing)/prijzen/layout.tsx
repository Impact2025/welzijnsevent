import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Prijzen",
  description: "Transparante prijzen voor eventplatform Bijeen. Gratis starten, betaal per event of kies een voordelig jaarabonnement. Subsidie-compatible en AVG-proof.",
  alternates: { canonical: "/prijzen" },
  openGraph: {
    title: "Prijzen — Bijeen",
    description: "Transparante prijzen voor eventplatform Bijeen. Gratis starten, betaal per event of kies een jaarabonnement.",
    url: "/prijzen",
    type: "website",
  },
  twitter: {
    title: "Prijzen — Bijeen",
    description: "Gratis starten, betaal per event of kies een jaarabonnement. Geen verborgen kosten.",
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Bijeen",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://bijeen.nl",
  description: "Eventplatform voor de Nederlandse welzijnssector. Van aanmelding tot WMO-rapportage.",
  offers: [
    {
      "@type": "Offer",
      name: "Community",
      price: "0",
      priceCurrency: "EUR",
      description: "Gratis plan: max 75 deelnemers, max 2 events per jaar.",
    },
    {
      "@type": "Offer",
      name: "Welzijn Starter",
      price: "29",
      priceCurrency: "EUR",
      description: "Per event: onbeperkt deelnemers, eigen branding, WMO-rapportage.",
    },
    {
      "@type": "Offer",
      name: "Welzijn Pro",
      price: "599",
      priceCurrency: "EUR",
      description: "Jaarabonnement: onbeperkt events, AI-netwerkkoppeling, white-label.",
    },
  ],
};

export default function PrijzenLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={softwareSchema} />
      {children}
    </>
  );
}
