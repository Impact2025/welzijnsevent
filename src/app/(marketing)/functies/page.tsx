import Link from "next/link";
import {
  ArrowRight, Zap, ClipboardList, QrCode, Network,
  MessageSquareMore, BarChart3, Smartphone, Mic,
  BarChart2, Share2, Download, Calendar, Mail, Globe,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Functies — Bijeen",
  description: "Alles wat je nodig hebt voor wereldklasse evenementen in de welzijnssector.",
};

const forOrganizer = [
  {
    icon: Zap,
    title: "Event aanmaken in 5 minuten",
    desc: "Kies een template, vul je details in en deel de link. Geen technische kennis nodig.",
  },
  {
    icon: ClipboardList,
    title: "Slimme inschrijfformulieren",
    desc: "Stel eigen vragen, maak sessiekeuzes mogelijk, stel capaciteitslimieten in en activeer de wachtlijst automatisch.",
  },
  {
    icon: Calendar,
    title: "Programmabeheer",
    desc: "Parallelle sessies, sprekerprofielen, locaties per zaal. Alles in één duidelijke tijdlijn.",
  },
  {
    icon: Mail,
    title: "Automatische communicatie",
    desc: "Bevestigingsmail, herinnering, dag-van-update en dank-je-wel — automatisch verstuurd op het juiste moment.",
  },
  {
    icon: QrCode,
    title: "QR check-in",
    desc: "Scan bij de ingang, zie realtime wie er is. Geen papieren lijsten, geen wachtrijen.",
  },
  {
    icon: Globe,
    title: "White-label",
    desc: "Jouw domeinnaam, jouw logo, jouw kleuren. Deelnemers zien jouw organisatie.",
  },
];

const duringEvent = [
  {
    icon: Mic,
    title: "Live Q&A",
    desc: "Deelnemers sturen vragen via de app. Jij keurt goed welke op het scherm verschijnen. Geen chaos, wel betrokkenheid.",
  },
  {
    icon: BarChart2,
    title: "Live polls",
    desc: "Stel realtime vragen aan je publiek. Zie resultaten direct op het scherm verschijnen. Ideaal voor workshops en keynotes.",
  },
  {
    icon: Share2,
    title: "Sociale wall",
    desc: "Deelnemers plaatsen berichten, foto's en reacties — zichtbaar op groot scherm. Energie en verbinding.",
  },
  {
    icon: Smartphone,
    title: "Control panel",
    desc: "Alles beheer je vanuit één scherm: sessies starten en stoppen, Q&A modereren, polls activeren.",
  },
];

const afterEvent = [
  {
    icon: BarChart3,
    title: "Impactrapportage",
    desc: "Automatisch rapport na elk event: opkomst, tevredenheid, sessie-engagement, netwerkmatches. Exporteer als PDF voor je subsidieaanvraag.",
  },
  {
    icon: MessageSquareMore,
    title: "Tevredenheidsonderzoek",
    desc: "Deelnemers ontvangen automatisch een korte enquête. Resultaten per sessie en per spreker.",
  },
  {
    icon: Network,
    title: "Netwerkoverzicht",
    desc: "Hoeveel matches zijn er gemaakt? Wie heeft wie ontmoet? Zie de verbindingen die jij mogelijk maakte.",
  },
  {
    icon: Download,
    title: "Data-export",
    desc: "Alle data exporteerbaar naar Excel of CSV. Koppel met je eigen CRM of ledenregistratie via de API.",
  },
];

function FeatureGrid({
  features,
}: {
  features: { icon: React.ElementType; title: string; desc: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {features.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="group bg-white rounded-2xl border border-sand/60 p-5 sm:p-6 hover:border-terra-200 hover:shadow-md transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
            <Icon size={18} strokeWidth={2} />
          </div>
          <h3 className="font-bold text-ink mb-1.5">{title}</h3>
          <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function FunctiesPage() {
  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-16 pb-20 sm:pt-20 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
            Functies
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Alles wat je nodig hebt.
            <br /> Niets wat je niet nodig hebt.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto">
            Bijeen is geen feature-fabriek. We bouwen wat welzijnsorganisaties écht gebruiken. Hier
            is wat er in zit.
          </p>
        </div>
      </section>

      {/* ── VOOR DE ORGANISATOR ──────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Voor de organisator
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Jij hebt regie
            </h2>
          </div>
          <FeatureGrid features={forOrganizer} />
        </div>
      </section>

      {/* ── TIJDENS HET EVENEMENT ────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Tijdens het evenement
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Live in control
            </h2>
          </div>
          <FeatureGrid features={duringEvent} />
        </div>
      </section>

      {/* ── NA HET EVENEMENT ─────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Na het evenement
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Impact zichtbaar maken
            </h2>
          </div>
          <FeatureGrid features={afterEvent} />
        </div>
      </section>

      {/* ── AI NETWERKKOPPELING ──────────────────────────────── */}
      <section className="bg-[#12100E] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
              AI Netwerkkoppeling
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
              De technologie die mensen verbindt
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-10">
              Vóór het evenement analyseert het systeem de profielen van alle deelnemers — rol,
              organisatie, interessegebied, regio — en stelt matchvoorstellen op.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Deelnemers ontvangen 3–5 netwerkmatches met uitleg waarom ze interessant zijn voor elkaar",
                "Jij behoudt volledige controle over welke profieldata gebruikt wordt",
                "Na het evenement zie je hoeveel matches daadwerkelijk gesprekken hebben gehad",
                "AVG-proof: deelnemers kiezen zelf of ze meedoen aan de netwerkkoppeling",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/60 text-[15px]">
                  <span className="text-terra-400 font-black mt-0.5 shrink-0 text-lg leading-none">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5"
            >
              <Zap size={15} className="fill-white" />
              Probeer gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight mb-4">
            Klaar om te starten?
          </h2>
          <p className="text-ink-muted text-lg mb-8">
            Jouw eerste event is gratis. Geen creditcard, geen verplichtingen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-terra-500/20"
            >
              <Zap size={15} className="fill-white" />
              Maak gratis account aan
            </Link>
            <Link
              href="/prijzen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-sand text-ink font-semibold px-6 py-3.5 rounded-xl hover:bg-sand transition-colors"
            >
              Bekijk prijzen <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
