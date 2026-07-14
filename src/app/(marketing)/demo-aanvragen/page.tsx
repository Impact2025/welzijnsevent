import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
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

const demoSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Plan een gratis demo — Bijeen",
  url: "https://bijeen.app/demo-aanvragen",
  description:
    "Plan een gratis, vrijblijvende demo van 30 minuten met Bijeen: een persoonlijke rondleiding door het eventplatform voor de welzijnssector, met jouw use case centraal.",
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

const demoBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bijeen.app" },
    { "@type": "ListItem", position: 2, name: "Demo aanvragen", item: "https://bijeen.app/demo-aanvragen" },
  ],
};

export default function DemoAanvragenPage() {
  return (
    <>
      <JsonLd data={demoSchema} />
      <JsonLd data={demoBreadcrumb} />
      <DemoRequestForm />
    </>
  );
}
