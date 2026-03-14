import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Veelgestelde vragen over Bijeen: prijzen, AVG, functies, support en meer. Alles wat je wilt weten over het eventplatform voor de welzijnssector.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Veelgestelde vragen — Bijeen",
    description: "Alles wat je wilt weten over Bijeen: prijzen, AVG, functies en meer.",
    url: "/faq",
    type: "website",
  },
  twitter: {
    title: "FAQ — Bijeen",
    description: "Veelgestelde vragen over prijzen, AVG, functies en support.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Wat is Bijeen precies?", acceptedAnswer: { "@type": "Answer", text: "Bijeen is een volledig eventplatform gebouwd voor de Nederlandse welzijnssector. Van aanmelden en check-in tot live Q&A, AI-netwerkkoppeling en impactrapportages voor subsidiegevers — alles in één tool." } },
    { "@type": "Question", name: "Kan ik Bijeen gratis uitproberen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Je eerste event is volledig gratis — tot 50 deelnemers, met alle basisfuncties. Geen creditcard nodig, geen tijdslimiet." } },
    { "@type": "Question", name: "Is er een gratis proefperiode?", acceptedAnswer: { "@type": "Answer", text: "Je eerste event is gratis (tot 50 deelnemers). Nieuwe organisaties krijgen daarnaast een 14-daagse trial op het Starter-abonnement." } },
    { "@type": "Question", name: "Zijn er verborgen kosten of transactiekosten?", acceptedAnswer: { "@type": "Answer", text: "Nee. De prijs op de prijzenpagina is wat je betaalt. Bij ticketverkoop betaal je de standaard transactiekosten van MultiSafePay (je eigen account), niet aan ons." } },
    { "@type": "Question", name: "Is Bijeen AVG-proof?", acceptedAnswer: { "@type": "Answer", text: "Ja. Bijeen is ontworpen met privacy by design. Je krijgt standaard een verwerkersovereenkomst (DPA) die voldoet aan de AVG. Alle data staat op servers binnen de EU." } },
    { "@type": "Question", name: "Hoe werkt de AI-netwerkkoppeling?", acceptedAnswer: { "@type": "Answer", text: "Bijeen analyseert de interesses, rollen en organisaties van deelnemers via Google Gemini. Het genereert matchparen met een score, uitleg en een gespreksstarter. De AI ziet nooit naam of e-mailadres." } },
    { "@type": "Question", name: "Wat is de impactrapportage?", acceptedAnswer: { "@type": "Answer", text: "Een print-ready PDF met KPI's, doelgroepverdeling, sessieoverzicht en een WMO/IZA-verantwoordingstekst. Speciaal ontworpen om mee te sturen met subsidieaanvragen of jaarverslagen." } },
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
