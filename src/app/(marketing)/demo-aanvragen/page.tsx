import type { Metadata } from "next";
import { DemoRequestForm } from "./demo-request-form";

export const metadata: Metadata = {
  title: "Plan een gratis demo — Bijeen",
  description:
    "Plan een gratis demo van 30 minuten met Bijeen. Persoonlijke rondleiding, " +
    "jouw use case centraal, geen verkooppraatje. ANBI/WMO-gefinancierd? 15% Sociaal Tarief.",
  alternates: { canonical: "/demo-aanvragen" },
  openGraph: {
    title: "Plan een gratis demo — Bijeen",
    description: "Plan een gratis demo van 30 minuten. We lopen samen door de tool en kijken eerlijk of het bij jullie past.",
    url: "/demo-aanvragen",
    type: "website",
  },
  twitter: {
    title: "Plan een gratis demo — Bijeen",
    description: "Plan een gratis demo van 30 minuten met Bijeen.",
  },
};

export default function DemoAanvragenPage() {
  return <DemoRequestForm />;
}
