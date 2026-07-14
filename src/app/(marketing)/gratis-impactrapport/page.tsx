import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { RapportGenerator } from "./rapport-generator";

export const metadata: Metadata = {
  title: "Gratis WMO Impactrapport genereren — Bijeen",
  description:
    "Genereer in 2 minuten een professioneel WMO-impactrapport voor uw evenement. " +
    "Direct bruikbaar voor subsidieaanvraag bij gemeente of fonds. Gratis, geen account nodig.",
  alternates: { canonical: "/gratis-impactrapport" },
  openGraph: {
    title:       "Gratis WMO Impactrapport — Bijeen",
    description: "Genereer een professioneel WMO-impactrapport voor uw evenement. Direct inzetbaar voor subsidieaanvraag.",
    url:         "/gratis-impactrapport",
    type:        "website",
  },
  twitter: {
    title:       "Gratis WMO Impactrapport — Bijeen",
    description: "WMO-impactrapport in 2 minuten. Gratis, geen account, direct klaar voor de gemeente.",
  },
};

const rapportSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Gratis WMO Impactrapport genereren — Bijeen",
  url: "https://bijeen.app/gratis-impactrapport",
  description:
    "Genereer in 2 minuten een professioneel WMO-impactrapport voor je welzijnsevenement, direct bruikbaar voor subsidieverantwoording bij gemeente of fonds. Gratis en zonder account.",
  publisher: {
    "@type": "Organization",
    name: "Bijeen",
    url: "https://bijeen.app",
    parentOrganization: {
      "@type": "Organization",
      name: "WeAreImpact",
      url: "https://www.weareimpact.nl",
    },
  },
};

const rapportBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bijeen.app" },
    { "@type": "ListItem", position: 2, name: "Gratis impactrapport", item: "https://bijeen.app/gratis-impactrapport" },
  ],
};

export default function GratisImpactrapportPage() {
  return (
    <>
      <JsonLd data={rapportSchema} />
      <JsonLd data={rapportBreadcrumb} />
      <RapportGenerator />
    </>
  );
}
