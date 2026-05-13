import type { Metadata } from "next";
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

export default function GratisImpactrapportPage() {
  return <RapportGenerator />;
}
