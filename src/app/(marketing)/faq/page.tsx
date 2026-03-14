"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Zap, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Data ──────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "algemeen",
    label: "Algemeen",
    items: [
      {
        q: "Wat is Bijeen precies?",
        a: "Bijeen is een volledig eventplatform gebouwd voor de Nederlandse welzijnssector. Van aanmelden en check-in tot live Q&A, AI-netwerkkoppeling en impactrapportages voor subsidiegevers — alles in één tool. Geen losse tools meer samenknopen.",
      },
      {
        q: "Voor wie is Bijeen geschikt?",
        a: "Voor welzijnsorganisaties, zorgnetwerken, buurtteams, gemeenten en iedereen die professionele bijeenkomsten organiseert in het sociaal domein. Of je nu 30 of 600 mensen uitnodigt.",
      },
      {
        q: "Kan ik Bijeen gratis uitproberen?",
        a: "Ja. Je eerste event is volledig gratis — tot 50 deelnemers, met alle basisfuncties. Geen creditcard nodig, geen tijdslimiet. Je upgradet pas als je meer nodig hebt.",
      },
      {
        q: "Hoeveel tijd kost het om een event op te zetten?",
        a: "Gemiddeld 15 minuten. Kies een template (bijv. Vrijwilligersdag of Netwerkbijeenkomst), pas de details aan, deel de link. Dat is alles. Geen technische kennis vereist.",
      },
      {
        q: "In welke talen is Bijeen beschikbaar?",
        a: "Het dashboard is volledig in het Nederlands. Publieke eventpagina's zijn beschikbaar in Nederlands en Engels — deelnemers kiezen zelf hun taal via een ?lang=en parameter.",
      },
    ],
  },
  {
    id: "prijzen",
    label: "Prijzen & abonnement",
    items: [
      {
        q: "Is er een gratis proefperiode?",
        a: "Je eerste event is gratis (tot 50 deelnemers). Nieuwe organisaties krijgen daarnaast een 14-daagse trial op het Starter-abonnement, zodat je alle betaalde functies kunt verkennen.",
      },
      {
        q: "Zijn er verborgen kosten of transactiekosten?",
        a: "Nee. De prijs op de prijzenpagina is wat je betaalt. Bij ticketverkoop betaal je de standaard transactiekosten van MultiSafePay (je eigen account), niet aan ons.",
      },
      {
        q: "Zijn er contracten of opzegtermijnen?",
        a: "Nee. Jaarabonnementen lopen 12 maanden en zijn daarna maandelijks opzegbaar. Pay-per-event heeft helemaal geen verplichtingen — je betaalt per event.",
      },
      {
        q: "Kan ik tussentijds upgraden of downgraden?",
        a: "Upgraden kan altijd direct via het dashboard. Downgraden gaat in aan het einde van de lopende periode. Je verliest nooit data bij een plan-switch.",
      },
      {
        q: "Hoe werkt de facturatie?",
        a: "Pay-per-event: je betaalt vooraf per event via iDEAL of creditcard. Abonnement: jaarlijkse factuur via MultiSafePay. Je ontvangt een BTW-factuur per e-mail.",
      },
      {
        q: "Kan ik betaalde tickets verkopen aan deelnemers?",
        a: "Ja. Je kunt per event meerdere tickettypes aanmaken met eigen prijzen. Deelnemers betalen via MultiSafePay (iDEAL, creditcard, etc.) en worden automatisch ingeschreven na geslaagde betaling.",
      },
    ],
  },
  {
    id: "privacy",
    label: "AVG & privacy",
    items: [
      {
        q: "Is Bijeen AVG-proof?",
        a: "Ja. Bijeen is ontworpen met privacy by design. We verwerken alleen de gegevens die strikt noodzakelijk zijn. Je krijgt standaard een verwerkersovereenkomst (DPA) die voldoet aan de AVG.",
      },
      {
        q: "Waar worden mijn data opgeslagen?",
        a: "Alle data staat op servers binnen de EU (Neon Postgres, datacenters Frankfurt en Amsterdam). Er vindt geen doorgifte naar landen buiten de EER plaats.",
      },
      {
        q: "Wie heeft toegang tot mijn deelnemersdata?",
        a: "Alleen jij en je teamleden hebben toegang tot data van jouw organisatie. Bijeen-medewerkers hebben alleen toegang voor support-doeleinden met jouw expliciete toestemming.",
      },
      {
        q: "Hoe verwijder ik data na een event?",
        a: "In het dashboard kun je een event archiveren of volledig verwijderen. Bij verwijdering worden alle gekoppelde deelnemersgegevens permanent en onomkeerbaar gewist.",
      },
      {
        q: "Moet ik een verwerkersovereenkomst tekenen?",
        a: (
          <>
            Onze standaard verwerkersovereenkomst is direct beschikbaar op{" "}
            <Link href="/verwerkersovereenkomst" className="text-terra-500 underline underline-offset-2 hover:text-terra-600">
              bijeen.app/verwerkersovereenkomst
            </Link>
            . Voor maatwerk-DPA's neem je contact op via hallo@bijeen.nl.
          </>
        ),
      },
    ],
  },
  {
    id: "functies",
    label: "Functionaliteit",
    items: [
      {
        q: "Kan ik mijn eigen huisstijl toevoegen?",
        a: "Ja. Je kunt een eigen kleur, logo en bannerafbeelding instellen per event. De publieke eventpagina past zich automatisch aan jouw huisstijl aan. Op het Welzijn Pro-plan is er een volledig white-label optie.",
      },
      {
        q: "Hoe werkt de AI-netwerkkoppeling?",
        a: "Bijeen analyseert de interesses, rollen en organisaties van deelnemers via Google Gemini. Het genereert matchparen met een score, uitleg en een concrete gespreksstarter. Jij kiest welke matches je deelt. De AI ziet nooit naam of e-mailadres — alleen geanonimiseerde profieldata.",
      },
      {
        q: "Ondersteunt Bijeen hybride events?",
        a: "Ja. Live Q&A, polls en de Q&A-wall werken real-time voor zowel fysieke als online deelnemers. Streaming-integratie (bijv. YouTube Live of Teams) is beschikbaar in het Congres-plan.",
      },
      {
        q: "Kan ik deelnemerslijsten importeren?",
        a: "Ja. Upload een Excel (.xlsx) of CSV-bestand en deelnemers worden automatisch aangemaakt, inclusief bevestigingsmail. Handig als je een bestaand systeem hebt.",
      },
      {
        q: "Wat is de impactrapportage?",
        a: "Een print-ready PDF met KPI's, doelgroepverdeling, sessieoverzicht en een WMO/IZA-verantwoordingstekst. Speciaal ontworpen om mee te sturen met subsidieaanvragen of jaarverslagen. Eén klik, direct klaar.",
      },
      {
        q: "Hoeveel parallelle sessies kan ik aanmaken?",
        a: "Op het Basis-plan één sessieruimte. Op Welzijn Pro meerdere sessies achter elkaar. Parallelle sessietracks (tegelijk) zijn beschikbaar in het Congres-plan.",
      },
    ],
  },
  {
    id: "support",
    label: "Support & onboarding",
    items: [
      {
        q: "Welke ondersteuning krijg ik bij mijn abonnement?",
        a: "Alle plannen hebben e-mailsupport (reactie binnen 1 werkdag). Het Groei-plan en hoger krijgen prioriteit support. Het Organisatie-plan heeft een dedicated contactpersoon en SLA.",
      },
      {
        q: "Kan ik een demo aanvragen?",
        a: (
          <>
            Ja. Stuur een e-mail naar{" "}
            <a href="mailto:hallo@bijeen.nl" className="text-terra-500 underline underline-offset-2 hover:text-terra-600">
              hallo@bijeen.nl
            </a>{" "}
            of vul het formulier in op de{" "}
            <Link href="/over-ons#demo" className="text-terra-500 underline underline-offset-2 hover:text-terra-600">
              Over ons-pagina
            </Link>
            . We plannen een demo in van 30 minuten, inclusief live walk-through van jouw use case.
          </>
        ),
      },
      {
        q: "Is er onboarding begeleiding beschikbaar?",
        a: "Ja, als betaalde optie (eenmalig €350). Een Bijeen-specialist helpt je bij de inrichting van je eerste event, templates, deelnemersimport en het instellen van de impactrapportage.",
      },
      {
        q: "Bieden jullie maatwerk of API-koppelingen aan?",
        a: "Ja. We bouwen koppelingen met CRM-systemen, ledenregistratie of interne portals. Tarieven vanaf €95/uur. Neem contact op voor een vrijblijvende inschatting.",
      },
      {
        q: "Wat als Bijeen stopt met bestaan?",
        a: "Je kunt op elk moment al je data exporteren: deelnemerslijsten (CSV/Excel), eventgegevens (JSON) en impactrapporten (PDF). Je bent nooit afhankelijk van ons voor je eigen data.",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn("border-b border-ink/8 last:border-b-0")}>
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className={cn("text-sm sm:text-base font-semibold leading-snug transition-colors", open ? "text-terra-500" : "text-ink group-hover:text-terra-500")}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className={cn("mt-0.5 shrink-0 text-ink/40 transition-transform duration-200", open && "rotate-180 text-terra-500")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-[600px] opacity-100 pb-5" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-sm text-ink/65 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const [openItem, setOpenItem] = useState<string | null>(null);

  const currentCat = categories.find(c => c.id === activeCategory)!;

  function toggle(key: string) {
    setOpenItem(prev => (prev === key ? null : key));
  }

  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-16 pb-20 sm:pt-20 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
            Veelgestelde vragen
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            Alles wat je wilt weten
            <br />
            <span className="text-terra-400">over Bijeen</span>
          </h1>
          <p className="text-white/65 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto mb-8">
            Vind snel antwoord op je vraag. Staat het er niet bij?
            Mail ons op{" "}
            <a href="mailto:hallo@bijeen.nl" className="text-terra-400 hover:text-terra-300 underline underline-offset-2 transition-colors">
              hallo@bijeen.nl
            </a>
          </p>
        </div>
      </section>

      {/* ── BODY ───────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">

            {/* Sidebar — categorieën */}
            <aside className="sm:w-52 shrink-0">
              <p className="text-[10px] font-bold text-ink/35 uppercase tracking-widest mb-3 px-1">
                Categorieën
              </p>
              <nav className="flex sm:flex-col gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
                    className={cn(
                      "text-sm font-medium px-3 py-2 rounded-xl text-left transition-all duration-150 w-full sm:w-auto",
                      activeCategory === cat.id
                        ? "bg-terra-500 text-white shadow-lg shadow-terra-500/20"
                        : "text-ink/55 hover:text-ink hover:bg-ink/6"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Accordion */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                  {currentCat.label}
                </h2>
                <p className="text-sm text-ink/45 mt-1">
                  {currentCat.items.length} vragen
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-sand/60 shadow-sm px-5 sm:px-7">
                {currentCat.items.map((item) => {
                  const key = `${activeCategory}-${item.q}`;
                  return (
                    <AccordionItem
                      key={key}
                      q={item.q}
                      a={item.a}
                      open={openItem === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STILL QUESTIONS ────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-terra-50 flex items-center justify-center text-terra-500 mx-auto mb-5">
            <MessageCircle size={22} strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
            Staat je vraag er niet bij?
          </h2>
          <p className="text-ink/55 text-base leading-relaxed mb-8">
            We helpen je graag direct. Stuur een mailtje of vraag een demo aan — we reageren binnen één werkdag.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:hallo@bijeen.nl"
              className="inline-flex items-center gap-2 border border-ink/15 hover:border-ink/30 text-ink font-semibold px-5 py-3 rounded-xl transition-colors text-sm w-full sm:w-auto justify-center"
            >
              hallo@bijeen.nl
            </a>
            <Link
              href="/over-ons#demo"
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-terra-500/20 text-sm w-full sm:w-auto justify-center"
            >
              Demo aanvragen
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="bg-[#12100E] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-terra-500/7 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Begin gratis. Altijd.
          </h2>
          <p className="text-white/65 text-lg mb-8">
            Eerste event gratis tot 50 deelnemers. Geen creditcard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5"
          >
            <Zap size={16} className="fill-white" />
            Maak gratis account aan
          </Link>
        </div>
      </section>
    </div>
  );
}
