import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Zap, QrCode, Network,
  MessageSquareMore, BarChart3, Mic,
  BarChart2, Share2, Download, Mail, Globe,
  Check, X, Users, Clock, Shield,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Functies",
  description: "Alles wat je nodig hebt voor wereldklasse evenementen in de welzijnssector. QR check-in, AI-netwerkkoppeling, live Q&A, polls en WMO-rapportage.",
  alternates: { canonical: "/functies" },
  openGraph: {
    title: "Functies — Bijeen",
    description: "Alles wat je nodig hebt voor wereldklasse evenementen in de welzijnssector.",
    url: "/functies",
    type: "website",
  },
  twitter: {
    title: "Functies — Bijeen",
    description: "QR check-in, AI-netwerkkoppeling, WMO-rapportage en meer — gebouwd voor welzijn.",
  },
};

/* ─── Phone frame wrapper ─────────────────────────────────────── */
function PhoneFrame({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-[#1C1814]/80 bg-[#1C1814] ${className}`}
      style={{ maxWidth: 220 }}
    >
      <Image
        src={src}
        alt={alt}
        width={335}
        height={730}
        className="w-full h-auto block"
        unoptimized
      />
    </div>
  );
}



/* ─── Stats strip ─────────────────────────────────────────────── */
const stats = [
  { val: "5 min", label: "om live te gaan" },
  { val: "94%", label: "gem. opkomst" },
  { val: "3×", label: "minder admin" },
  { val: "AVG", label: "100% compliant" },
];

/* ─── Comparison data ─────────────────────────────────────────── */
const comparisonRows = [
  { feature: "Event aanmaken in minuten", bijeen: true, excel: false, generic: false },
  { feature: "Automatische e-mails (herinnering + dank)", bijeen: true, excel: false, generic: "deels" },
  { feature: "QR check-in met realtime overzicht", bijeen: true, excel: false, generic: false },
  { feature: "Sessiekeuze & wachtlijst", bijeen: true, excel: false, generic: "deels" },
  { feature: "Live Q&A, polls & sociale wall", bijeen: true, excel: false, generic: "deels" },
  { feature: "AI netwerkkoppeling (AVG-proof)", bijeen: true, excel: false, generic: false },
  { feature: "Impactrapport voor subsidie (PDF)", bijeen: true, excel: false, generic: false },
  { feature: "White-label (jouw merk)", bijeen: true, excel: false, generic: false },
  { feature: "Welzijnssector-specifiek", bijeen: true, excel: false, generic: false },
];

function CompareCell({ val }: { val: boolean | string }) {
  if (val === true)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-terra-100 flex items-center justify-center">
          <Check size={13} className="text-terra-600" strokeWidth={2.5} />
        </div>
      </div>
    );
  if (val === false)
    return (
      <div className="flex justify-center">
        <div className="w-6 h-6 rounded-full bg-ink/5 flex items-center justify-center">
          <X size={12} className="text-ink/30" strokeWidth={2.5} />
        </div>
      </div>
    );
  return (
    <div className="flex justify-center">
      <span className="text-[11px] text-ink-muted font-medium">gedeeltelijk</span>
    </div>
  );
}

/* ─── Testimonials ────────────────────────────────────────────── */
const testimonials = [
  {
    quote: "We deden alles in Excel en WhatsApp-groepen. Nu zit het in Bijeen en heb ik eindelijk tijd voor de inhoud.",
    name: "Fatima Osman",
    role: "Programmaleider, Welzijnswerk Midden-Holland",
  },
  {
    quote: "De impactrapportage bespaart me uren schrijfwerk voor de subsidieaanvraag. Goud waard.",
    name: "Pieter van Beek",
    role: "Directeur, Sociaal Fonds Amsterdam",
  },
  {
    quote: "Onze deelnemers waren verrast hoe professioneel alles was. En het was ons kleinste budget ooit.",
    name: "Nadia Berkhout",
    role: "Coördinator netwerkevenementen, Humanitas",
  },
];

export default function FunctiesPage() {
  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-16 pb-0 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-terra-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
              Functies
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
              Alles wat je nodig hebt.
              <br />
              <span className="text-terra-400">Niets wat je niet nodig hebt.</span>
            </h1>
            <p className="text-white/65 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
              Bijeen is gebouwd voor welzijnsorganisaties die grote impact maken met kleine teams.
              Geen feature-fabriek — wél de tools die het verschil maken.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5"
              >
                <Zap size={15} className="fill-white" />
                Gratis starten
              </Link>
              <Link
                href="/prijzen"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors border border-white/10"
              >
                Bekijk prijzen <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero visual — echte app screenshots */}
          <div className="flex items-end justify-center lg:justify-start gap-4 overflow-hidden pb-0">
            <div className="hidden lg:block translate-y-8 opacity-80">
              <PhoneFrame src="/screenshots/nieuw_event.png" alt="Nieuw evenement aanmaken" />
            </div>
            <div className="translate-y-4 opacity-100 mx-auto lg:mx-0" style={{ maxWidth: 240 }}>
              <PhoneFrame src="/screenshots/Dashboard.png" alt="Bijeen dashboard" />
            </div>
            <div className="hidden lg:block translate-y-8 opacity-80">
              <PhoneFrame src="/screenshots/event_pagina.png" alt="Evenement programma" />
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/8 mt-6 bg-white/4 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ val, label }) => (
              <div key={label} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-0.5">{val}</div>
                <div className="text-[11px] text-white/50 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FASE 1: VOOR HET EVENEMENT ───────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Phase label */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-full bg-terra-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              1
            </div>
            <div>
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest">
                Fase 1 · Voor het evenement
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Van idee naar uitverkocht in 5 minuten
              </h2>
            </div>
          </div>

          {/* Big spotlight: Event aanmaken */}
          <div className="bg-white rounded-3xl border border-sand/60 overflow-hidden mb-6 shadow-sm">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center text-terra-500 mb-5">
                  <Zap size={18} strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-ink mb-3 tracking-tight">
                  Event aanmaken in 5 minuten
                </h3>
                <p className="text-ink-muted leading-relaxed mb-6">
                  Kies een template, vul je details in en deel de link. Geen technische kennis,
                  geen IT-afdeling, geen lange onboarding.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Eigen registratiepagina met jouw branding",
                    "Sessiekeuze & parallelle programmalijnen",
                    "Capaciteitslimieten met automatische wachtlijst",
                    "Eigen vragen toevoegen aan het formulier",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <div className="w-4 h-4 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={9} className="text-terra-600" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-cream/60 border-l border-sand/40 p-8 sm:p-10 flex items-center justify-center">
                <PhoneFrame src="/screenshots/nieuw_event.png" alt="Sector-templates kiezen" />
              </div>
            </div>
          </div>

          {/* Secondary features grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Mail,
                title: "Automatische communicatie",
                desc: "Bevestigingsmail, herinnering 24u van tevoren, dag-van-update en dank-je-wel — allemaal automatisch op het juiste moment.",
              },
              {
                icon: Globe,
                title: "White-label",
                desc: "Jouw domeinnaam, jouw logo, jouw kleuren. Deelnemers zien jouw organisatie — niet Bijeen.",
              },
              {
                icon: Shield,
                title: "AVG & Beveiliging",
                desc: "Nederlandse servers, versleutelde data, verwerkersovereenkomst standaard. Volledig AVG-proof.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-sand/60 p-6 hover:border-terra-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink mb-1.5">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL 1 ────────────────────────────────────────── */}
      <div className="bg-terra-500/6 border-y border-terra-200/40 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg sm:text-xl text-ink font-medium leading-relaxed mb-4 italic">
            &ldquo;{testimonials[0].quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terra-200 flex items-center justify-center text-terra-700 font-bold text-sm">
              F
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-ink">{testimonials[0].name}</div>
              <div className="text-xs text-ink-muted">{testimonials[0].role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FASE 2: TIJDENS HET EVENEMENT ───────────────────────── */}
      <section className="bg-[#12100E] py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terra-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-full bg-terra-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              2
            </div>
            <div>
              <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest">
                Fase 2 · Tijdens het evenement
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Jij hebt de regie. Deelnemers voelen de energie.
              </h2>
            </div>
          </div>

          {/* Big spotlight: QR check-in */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1">
                <div className="w-10 h-10 rounded-xl bg-terra-500/20 flex items-center justify-center text-terra-400 mb-5">
                  <QrCode size={18} strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-3 tracking-tight">
                  QR check-in zonder chaos
                </h3>
                <p className="text-white/60 leading-relaxed mb-6">
                  Scan bij de ingang, zie realtime wie er is. Geen papieren lijsten, geen wachtrijen,
                  geen handmatig bijhouden. Altijd up-to-date op elk apparaat.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Scan met elk apparaat — geen speciale hardware",
                    "Realtime aanwezigheidsoverzicht voor je team",
                    "Naamkaartjes afdrukken per deelnemer met QR",
                    "Latekomers en no-shows direct zichtbaar",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                      <div className="w-4 h-4 rounded-full bg-terra-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={9} className="text-terra-400" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-l border-white/8 p-8 sm:p-10 flex items-center justify-center bg-white/3 order-1 lg:order-2">
                <PhoneFrame src="/screenshots/deelnemersbeheer.png" alt="Deelnemersbeheer met QR scanner" />
              </div>
            </div>
          </div>

          {/* Live interaction grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Mic,
                title: "Live Q&A",
                desc: "Deelnemers sturen vragen via hun telefoon. Jij keurt goed welke op het scherm verschijnen. Geen chaos, wel betrokkenheid.",
              },
              {
                icon: BarChart2,
                title: "Live polls",
                desc: "Stel realtime vragen aan je publiek. Resultaten verschijnen direct op het scherm. Ideaal voor workshops en keynotes.",
              },
              {
                icon: Share2,
                title: "Sociale wall",
                desc: "Deelnemers plaatsen berichten en reacties — zichtbaar op groot scherm. Energie en verbinding in de zaal.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-terra-500/20 group-hover:bg-terra-500/30 flex items-center justify-center text-terra-400 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Live Q&A mockup callout */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live voorbeeld</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">Zo ziet het er voor jou uit</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Jij modereert vanuit één scherm. Deelnemers doen mee via hun telefoon.
                  Geen app nodig — gewoon de browser.
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <PhoneFrame src="/screenshots/live_control.png" alt="Live control panel sessies" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL 2 ────────────────────────────────────────── */}
      <div className="bg-terra-500/6 border-y border-terra-200/40 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg sm:text-xl text-ink font-medium leading-relaxed mb-4 italic">
            &ldquo;{testimonials[2].quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terra-200 flex items-center justify-center text-terra-700 font-bold text-sm">
              N
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-ink">{testimonials[2].name}</div>
              <div className="text-xs text-ink-muted">{testimonials[2].role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI NETWERKKOPPELING ──────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-[#12100E] to-[#1e1a17] rounded-3xl overflow-hidden border border-white/5 relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-terra-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-terra-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative p-8 sm:p-12 lg:p-16 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-terra-500/20 text-terra-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5">
                  <Zap size={11} />
                  AI-functie
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                  De technologie die mensen écht verbindt
                </h2>
                <p className="text-white/60 text-lg leading-relaxed mb-8">
                  Vóór het evenement analyseert het systeem de profielen van alle deelnemers.
                  Elke deelnemer krijgt 3–5 persoonlijke matches — met uitleg waarom.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: Users, text: "Matches op basis van rol, organisatie, interesse en regio" },
                    { icon: Shield, text: "AVG-proof: deelnemers kiezen zelf of ze meedoen" },
                    { icon: BarChart3, text: "Na het event: zie hoeveel matches echt gesprekken hebben gehad" },
                    { icon: Network, text: "Jij behoudt volledige controle over welke data gebruikt wordt" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-terra-500/20 flex items-center justify-center text-terra-400 shrink-0 mt-0.5">
                        <Icon size={13} />
                      </div>
                      <span className="text-white/60 text-[15px] leading-relaxed">{text}</span>
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

              {/* AI matching screenshot */}
              <div className="flex justify-center">
                <PhoneFrame src="/screenshots/ai-matching.png" alt="AI netwerk matches" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FASE 3: NA HET EVENEMENT ─────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-8 h-8 rounded-full bg-terra-500 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              3
            </div>
            <div>
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest">
                Fase 3 · Na het evenement
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                Impact zichtbaar maken
              </h2>
            </div>
          </div>

          {/* Big spotlight: Impactrapportage */}
          <div className="bg-cream rounded-3xl border border-sand/60 overflow-hidden mb-6">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1">
                <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center text-terra-500 mb-5">
                  <BarChart3 size={18} strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-ink mb-3 tracking-tight">
                  Impactrapportage — automatisch
                </h3>
                <p className="text-ink-muted leading-relaxed mb-6">
                  Elk event genereert automatisch een volledig rapport: opkomst, tevredenheid per
                  sessie, netwerkmatches, engagement. Exporteer als PDF voor je subsidieaanvraag —
                  klaar in seconden.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Opkomst, no-show en wachtlijststatistieken",
                    "Tevredenheid per sessie én per spreker",
                    "Netwerkoverzicht: hoeveel matches zijn gemaakt",
                    "PDF-export voor subsidie- en verantwoordingsrapportages",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <div className="w-4 h-4 rounded-full bg-terra-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={9} className="text-terra-600" strokeWidth={3} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-l border-sand/40 p-8 sm:p-10 flex items-center justify-center order-1 lg:order-2">
                <PhoneFrame src="/screenshots/impact_statistieken.png" alt="Impact en statistieken" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: MessageSquareMore,
                title: "Tevredenheidsonderzoek",
                desc: "Deelnemers ontvangen automatisch een korte enquête. Resultaten per sessie en per spreker, direct beschikbaar.",
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
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white border border-sand/60 rounded-2xl p-6 hover:border-terra-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink mb-1.5">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL 3 ────────────────────────────────────────── */}
      <div className="bg-terra-500/6 border-y border-terra-200/40 py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg sm:text-xl text-ink font-medium leading-relaxed mb-4 italic">
            &ldquo;{testimonials[1].quote}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terra-200 flex items-center justify-center text-terra-700 font-bold text-sm">
              P
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-ink">{testimonials[1].name}</div>
              <div className="text-xs text-ink-muted">{testimonials[1].role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VERGELIJKING ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
              Vergelijking
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-4">
              Bijeen vs. de alternatieven
            </h2>
            <p className="text-ink-muted">
              Excel werkt. WhatsApp ook. Maar niet voor 80 deelnemers, 6 sessies en een subsidieaanvraag.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-sand/60 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-sand/60">
              <div className="p-4 sm:p-5 col-span-1">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Functie</span>
              </div>
              {[
                { label: "Bijeen", highlight: true },
                { label: "Excel / e-mail", highlight: false },
                { label: "Generiek platform", highlight: false },
              ].map(({ label, highlight }) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 text-center border-l border-sand/60 ${highlight ? "bg-terra-50" : ""}`}
                >
                  <span className={`text-xs font-extrabold ${highlight ? "text-terra-600" : "text-ink-muted"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {/* Rows */}
            {comparisonRows.map(({ feature, bijeen, excel, generic }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-4 border-b last:border-0 border-sand/40 ${i % 2 === 1 ? "bg-cream/40" : ""}`}
              >
                <div className="p-3.5 sm:p-4 col-span-1 flex items-center">
                  <span className="text-xs sm:text-sm text-ink-muted">{feature}</span>
                </div>
                <div className="p-3.5 sm:p-4 border-l border-sand/60 bg-terra-50/50 flex items-center justify-center">
                  <CompareCell val={bijeen} />
                </div>
                <div className="p-3.5 sm:p-4 border-l border-sand/60 flex items-center justify-center">
                  <CompareCell val={excel} />
                </div>
                <div className="p-3.5 sm:p-4 border-l border-sand/60 flex items-center justify-center">
                  <CompareCell val={generic} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-[#12100E] py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-terra-500/20 text-terra-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6">
            <Clock size={11} />
            5 minuten om live te gaan
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Klaar om jouw volgende event
            <br />
            <span className="text-terra-400">écht goed te organiseren?</span>
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Jouw eerste event is gratis. Geen creditcard, geen verplichtingen, geen verborgen kosten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5 text-base"
            >
              <Zap size={16} className="fill-white" />
              Maak gratis account aan
            </Link>
            <Link
              href="/prijzen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/10 text-base"
            >
              Bekijk prijzen <ArrowRight size={16} />
            </Link>
          </div>
          <p className="text-white/30 text-xs mt-6">
            Gebruikt door welzijnsorganisaties in heel Nederland · AVG-compliant · Nederlandse servers
          </p>
        </div>
      </section>
    </div>
  );
}
