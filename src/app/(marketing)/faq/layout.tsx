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
    { "@type": "Question", name: "Wat is Bijeen precies?", acceptedAnswer: { "@type": "Answer", text: "Bijeen is een volledig eventplatform gebouwd voor de Nederlandse welzijnssector. Van aanmelden en check-in tot live Q&A, AI-netwerkkoppeling en impactrapportages voor subsidiegevers — alles in één tool. Geen losse tools meer samenknopen." } },
    { "@type": "Question", name: "Voor wie is Bijeen geschikt?", acceptedAnswer: { "@type": "Answer", text: "Voor welzijnsorganisaties, zorgnetwerken, buurtteams, gemeenten en iedereen die professionele bijeenkomsten organiseert in het sociaal domein. Of je nu 30 of 600 mensen uitnodigt." } },
    { "@type": "Question", name: "Kan ik Bijeen gratis uitproberen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Je eerste event is volledig gratis — tot 50 deelnemers, met alle basisfuncties. Geen creditcard nodig, geen tijdslimiet. Je upgradet pas als je meer nodig hebt." } },
    { "@type": "Question", name: "Hoeveel tijd kost het om een event op te zetten?", acceptedAnswer: { "@type": "Answer", text: "Gemiddeld 15 minuten. Kies een template, pas de details aan, deel de link. Dat is alles. Geen technische kennis vereist." } },
    { "@type": "Question", name: "Is er een gratis proefperiode?", acceptedAnswer: { "@type": "Answer", text: "Je eerste event is gratis tot 50 deelnemers. Nieuwe organisaties krijgen daarnaast een 14-daagse trial op het Starter-abonnement, zodat je alle betaalde functies kunt verkennen." } },
    { "@type": "Question", name: "Zijn er verborgen kosten of transactiekosten?", acceptedAnswer: { "@type": "Answer", text: "Nee. De prijs op de prijzenpagina is wat je betaalt. Bij ticketverkoop betaal je de standaard transactiekosten van Stripe, niet aan ons." } },
    { "@type": "Question", name: "Zijn er contracten of opzegtermijnen?", acceptedAnswer: { "@type": "Answer", text: "Nee. Jaarabonnementen lopen 12 maanden en zijn daarna maandelijks opzegbaar. Pay-per-event heeft helemaal geen verplichtingen." } },
    { "@type": "Question", name: "Kan ik tussentijds upgraden of downgraden?", acceptedAnswer: { "@type": "Answer", text: "Upgraden kan altijd direct via het dashboard. Downgraden gaat in aan het einde van de lopende periode. Je verliest nooit data bij een plan-switch." } },
    { "@type": "Question", name: "Hoe werkt de facturatie?", acceptedAnswer: { "@type": "Answer", text: "Pay-per-event: je betaalt vooraf per event via iDEAL of creditcard. Abonnement: jaarlijkse factuur via Stripe. Je ontvangt een BTW-factuur per e-mail." } },
    { "@type": "Question", name: "Kan ik betaalde tickets verkopen aan deelnemers?", acceptedAnswer: { "@type": "Answer", text: "Ja. Je kunt per event meerdere tickettypes aanmaken met eigen prijzen. Deelnemers betalen via Stripe en worden automatisch ingeschreven na geslaagde betaling." } },
    { "@type": "Question", name: "Is Bijeen AVG-proof?", acceptedAnswer: { "@type": "Answer", text: "Ja. Bijeen is ontworpen met privacy by design. We verwerken alleen de gegevens die strikt noodzakelijk zijn. Je krijgt standaard een verwerkersovereenkomst die voldoet aan de AVG." } },
    { "@type": "Question", name: "Waar worden mijn data opgeslagen?", acceptedAnswer: { "@type": "Answer", text: "Alle data staat op servers binnen de EU via Neon Postgres met datacenters in Frankfurt en Amsterdam. Er vindt geen doorgifte naar landen buiten de EER plaats." } },
    { "@type": "Question", name: "Wie heeft toegang tot mijn deelnemersdata?", acceptedAnswer: { "@type": "Answer", text: "Alleen jij en je teamleden hebben toegang tot data van jouw organisatie. Bijeen-medewerkers hebben alleen toegang voor support-doeleinden met jouw expliciete toestemming." } },
    { "@type": "Question", name: "Hoe verwijder ik data na een event?", acceptedAnswer: { "@type": "Answer", text: "In het dashboard kun je een event archiveren of volledig verwijderen. Bij verwijdering worden alle gekoppelde deelnemersgegevens permanent en onomkeerbaar gewist." } },
    { "@type": "Question", name: "Kan ik mijn eigen huisstijl toevoegen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Je kunt een eigen kleur, logo en bannerafbeelding instellen per event. De publieke eventpagina past zich automatisch aan jouw huisstijl aan. Op het Welzijn Pro-plan is er een volledig white-label optie." } },
    { "@type": "Question", name: "Hoe werkt de AI-netwerkkoppeling?", acceptedAnswer: { "@type": "Answer", text: "Bijeen analyseert de interesses, rollen en organisaties van deelnemers via Google Gemini. Het genereert matchparen met een score en gespreksstarter. De AI ziet nooit naam of e-mailadres, alleen geanonimiseerde profieldata." } },
    { "@type": "Question", name: "Ondersteunt Bijeen hybride events?", acceptedAnswer: { "@type": "Answer", text: "Ja. Live Q&A, polls en de Q&A-wall werken real-time voor zowel fysieke als online deelnemers. Streaming is beschikbaar in het Congres-plan." } },
    { "@type": "Question", name: "Kan ik deelnemerslijsten importeren?", acceptedAnswer: { "@type": "Answer", text: "Ja. Upload een Excel of CSV-bestand en deelnemers worden automatisch aangemaakt, inclusief bevestigingsmail." } },
    { "@type": "Question", name: "Wat is de impactrapportage?", acceptedAnswer: { "@type": "Answer", text: "Een print-ready PDF met KPI's, doelgroepverdeling, sessieoverzicht en een WMO/IZA-verantwoordingstekst. Speciaal ontworpen om mee te sturen met subsidieaanvragen of jaarverslagen." } },
    { "@type": "Question", name: "Welke ondersteuning krijg ik?", acceptedAnswer: { "@type": "Answer", text: "Alle plannen hebben e-mailsupport binnen 1 werkdag. Het Groei-plan en hoger krijgen prioriteit support. Het Organisatie-plan heeft een dedicated contactpersoon en SLA." } },
    { "@type": "Question", name: "Kan ik een demo aanvragen?", acceptedAnswer: { "@type": "Answer", text: "Ja. Stuur een e-mail naar hallo@bijeen.nl of vul het formulier in op de Over ons-pagina. We plannen een demo van 30 minuten met een live walk-through van jouw use case." } },
    { "@type": "Question", name: "Is er onboarding begeleiding beschikbaar?", acceptedAnswer: { "@type": "Answer", text: "Ja, als betaalde optie. Een Bijeen-specialist helpt bij de inrichting van je eerste event, templates, deelnemersimport en het instellen van de impactrapportage." } },
    { "@type": "Question", name: "Bieden jullie maatwerk of API-koppelingen aan?", acceptedAnswer: { "@type": "Answer", text: "Ja. We bouwen koppelingen met CRM-systemen, ledenregistratie of interne portals. Tarieven vanaf 95 euro per uur." } },
    { "@type": "Question", name: "Wat als Bijeen stopt met bestaan?", acceptedAnswer: { "@type": "Answer", text: "Je kunt op elk moment al je data exporteren: deelnemerslijsten, eventgegevens en impactrapporten. Je bent nooit afhankelijk van ons voor je eigen data." } },
    { "@type": "Question", name: "In welke talen is Bijeen beschikbaar?", acceptedAnswer: { "@type": "Answer", text: "Het dashboard is volledig in het Nederlands. Publieke eventpagina's zijn beschikbaar in Nederlands en Engels." } },
    { "@type": "Question", name: "Moet ik een verwerkersovereenkomst tekenen?", acceptedAnswer: { "@type": "Answer", text: "Onze standaard verwerkersovereenkomst is direct beschikbaar op bijeen.app/verwerkersovereenkomst. Voor maatwerk-DPA's neem je contact op via hallo@bijeen.nl." } },
    { "@type": "Question", name: "Hoeveel parallelle sessies kan ik aanmaken?", acceptedAnswer: { "@type": "Answer", text: "Op het Basis-plan één sessieruimte. Op Welzijn Pro meerdere sessies achter elkaar. Parallelle sessietracks zijn beschikbaar in het Congres-plan." } },
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
