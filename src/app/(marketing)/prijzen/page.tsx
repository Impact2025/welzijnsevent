"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, X, ChevronDown, Zap, ArrowRight,
  BookOpen, MessageCircle, Shield, Wrench,
  FileText, Receipt, BadgePercent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

// Note: metadata export won't work in "use client" — use layout or separate page
// Keep here as reference for static generation
// export const metadata: Metadata = { title: "Prijzen — Bijeen" };

// ── Per-event tiers ──────────────────────────────────────────────────────────
const perEventTiers = [
  {
    key: "community",
    name: "Community",
    price: 0,
    priceLabel: "Gratis",
    desc: "Max 75 deelnemers · max 2 events/jaar",
    cta: "Gratis starten",
    ctaHref: "/sign-up",
    highlight: false,
    features: [
      { text: "Eventpagina + inschrijving", included: true },
      { text: "QR check-in", included: true },
      { text: "Deelnemersexport", included: true },
      { text: "Eigen branding", included: false },
      { text: "AI-netwerkkoppeling", included: false },
      { text: "WMO Impactrapportage", included: false },
      { text: "Live Q&A en polls", included: false },
    ],
  },
  {
    key: "welzijn",
    name: "Welzijn",
    price: 89,
    priceLabel: "€89",
    desc: "Max 300 deelnemers per event",
    cta: "Start gratis proef",
    ctaHref: "/sign-up",
    highlight: false,
    features: [
      { text: "Eventpagina + inschrijving", included: true },
      { text: "QR check-in", included: true },
      { text: "Deelnemersexport", included: true },
      { text: "Eigen branding (white-label)", included: true },
      { text: "AI-netwerkkoppeling", included: true },
      { text: "WMO Impactrapportage PDF", included: true },
      { text: "Live Q&A en polls", included: true },
    ],
  },
  {
    key: "netwerk",
    name: "Netwerk",
    price: 249,
    priceLabel: "€249",
    desc: "Max 750 deelnemers per event",
    cta: "Start gratis proef",
    ctaHref: "/sign-up",
    highlight: true,
    badge: "Populairste keuze",
    features: [
      { text: "Alles uit Welzijn", included: true },
      { text: "Hybride / streaming", included: true },
      { text: "Parallelle sessies", included: true },
      { text: "WMO-verantwoordingsexport", included: true },
      { text: "Prioriteit support", included: true },
      { text: "Betaalde tickets mogelijk", included: true },
      { text: "API-toegang", included: false },
    ],
  },
  {
    key: "platform",
    name: "Platform",
    price: null,
    priceLabel: "Op aanvraag",
    desc: "Koepels & gemeenten",
    cta: "Neem contact op",
    ctaHref: "mailto:hallo@bijeen.nl?subject=Platform aanvraag",
    highlight: false,
    features: [
      { text: "Onbeperkt events + deelnemers", included: true },
      { text: "Custom integraties + API", included: true },
      { text: "Dedicated accountmanager", included: true },
      { text: "SLA-garantie", included: true },
      { text: "Co-branding partners", included: true },
      { text: "Maatwerk implementatie", included: true },
      { text: "Volume-korting", included: true },
    ],
  },
];

// ── Jaarabonnement tiers ─────────────────────────────────────────────────────
const jaarTiers = [
  {
    key: "community",
    name: "Community",
    price: 0,
    priceLabel: "Gratis",
    period: "voor altijd",
    desc: "Max 75 deelnemers · max 2 events/jaar",
    perEvent: null,
    saving: null,
    cta: "Gratis starten",
    ctaHref: "/sign-up",
    highlight: false,
    features: [
      { text: "Eventpagina + inschrijving", included: true },
      { text: "QR check-in", included: true },
      { text: "Deelnemersexport", included: true },
      { text: "Eigen branding", included: false },
      { text: "AI-netwerkkoppeling", included: false },
      { text: "WMO Impactrapportage", included: false },
      { text: "Live Q&A en polls", included: false },
    ],
  },
  {
    key: "welzijn",
    name: "Welzijn",
    price: 490,
    priceLabel: "€490",
    period: "/jaar",
    desc: "6 events · max 300 deelnemers",
    perEvent: "€82 per event",
    saving: "8%",
    cta: "Start gratis proef",
    ctaHref: "/sign-up",
    highlight: false,
    features: [
      { text: "6 events per jaar", included: true },
      { text: "Max 300 deelnemers per event", included: true },
      { text: "Eigen branding (white-label)", included: true },
      { text: "AI-netwerkkoppeling", included: true },
      { text: "WMO Impactrapportage PDF", included: true },
      { text: "Live Q&A en polls", included: true },
      { text: "Betaalde tickets mogelijk", included: true },
    ],
  },
  {
    key: "netwerk",
    name: "Netwerk",
    price: 1290,
    priceLabel: "€1.290",
    period: "/jaar",
    desc: "24 events · max 750 deelnemers",
    perEvent: "~€54 per event",
    saving: "38%",
    cta: "Start gratis proef",
    ctaHref: "/sign-up",
    highlight: true,
    badge: "Beste waarde",
    features: [
      { text: "24 events per jaar", included: true },
      { text: "Max 750 deelnemers per event", included: true },
      { text: "Hybride / streaming", included: true },
      { text: "Parallelle sessies", included: true },
      { text: "WMO-verantwoordingsexport", included: true },
      { text: "Prioriteit support", included: true },
      { text: "Alles uit Welzijn", included: true },
    ],
  },
  {
    key: "organisatie",
    name: "Organisatie",
    price: 2890,
    priceLabel: "€2.890",
    period: "/jaar",
    desc: "Onbeperkt events + deelnemers",
    perEvent: null,
    saving: null,
    cta: "Start gratis proef",
    ctaHref: "/sign-up",
    highlight: false,
    features: [
      { text: "Onbeperkte events", included: true },
      { text: "Onbeperkte deelnemers", included: true },
      { text: "Custom integraties", included: true },
      { text: "Dedicated accountmanager", included: true },
      { text: "API-toegang", included: true },
      { text: "Co-branding partners", included: true },
      { text: "Alles uit Netwerk", included: true },
    ],
  },
];

// ── Comparison: Bijeen vs. Eventbrite vs. EventMobi ──────────────────────────
const comparison = [
  { feature: "Prijs per event (100 deeln.)",   bijeen: "€89",         eventbrite: "~€180–500", eventmobi: "€2.700+" },
  { feature: "Nederlandstalige interface",       bijeen: true,          eventbrite: false,       eventmobi: false },
  { feature: "WMO Impactrapportage",             bijeen: true,          eventbrite: false,       eventmobi: false },
  { feature: "AI-netwerkkoppeling",              bijeen: true,          eventbrite: false,       eventmobi: false },
  { feature: "Transparante vaste prijs",         bijeen: true,          eventbrite: false,       eventmobi: false },
  { feature: "Verwerkersovereenkomst inbegrepen",bijeen: true,          eventbrite: false,       eventmobi: true  },
  { feature: "Subsidie-eligible framing",        bijeen: true,          eventbrite: false,       eventmobi: false },
  { feature: "Nederlandse servers (AVG)",        bijeen: true,          eventbrite: false,       eventmobi: false },
];

// ── Extras ───────────────────────────────────────────────────────────────────
const extras = [
  { icon: BookOpen,     title: "Onboarding begeleiding", desc: "Wij helpen je bij de inrichting van je eerste event.", price: "Eenmalig €350" },
  { icon: MessageCircle,title: "WhatsApp integratie",   desc: "Automatische herinneringen via WhatsApp.",              price: "€15 / maand" },
  { icon: Shield,       title: "Premium support",        desc: "Directe lijn met je vaste contactpersoon.",            price: "€99 / maand" },
  { icon: Wrench,       title: "Maatwerk & API",         desc: "Koppeling met je eigen CRM of ledenregistratie.",       price: "€95 / uur" },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Is er een gratis versie?",
    a: "Ja — de Community-tier is permanent gratis voor gratis events tot 75 deelnemers (max 2 events per jaar). Geen creditcard, geen tijdslimiet.",
  },
  {
    q: "Kan ik dit opvoeren als subsidie-uitgave?",
    a: "Ja. Bijeen is volledig subsidiabel als IT-post binnen WMO-, IZA- en AZWA-projectbudgetten. We sturen een factuur op naam met projectcode op verzoek. Kwartaalfacturatie is beschikbaar voor jaarabonnements­houders.",
  },
  {
    q: "Wat is de WMO Impactrapportage?",
    a: "De WMO Impactrapportage is een automatisch gegenereerd PDF-document na elk event, met KPI's, doelgroepverdeling, verbindingen en een verantwoordingstekst die je direct kunt uploaden bij je subsidieaanvraag.",
  },
  {
    q: "Is mijn data veilig en AVG-proof?",
    a: "Ja. Alle data staat op Nederlandse servers. We leveren standaard een verwerkersovereenkomst. Privacy by design — deelnemersdata verlaat nooit onze infrastructuur.",
  },
  {
    q: "Heb ik technische kennis nodig?",
    a: "Nee. Bijeen is gebouwd voor welzijnsprofessionals, niet voor IT-ers. Als je een e-mail kunt sturen, kun je een event aanmaken.",
  },
  {
    q: "Zijn er contracten of opzegtermijnen?",
    a: "Nee. Jaarabonnementen lopen 12 maanden en zijn daarna maandelijks opzegbaar. Pay-per-event heeft geen verplichtingen.",
  },
  {
    q: "Is er een WMO/nonprofit-korting?",
    a: "Organisaties die uitsluitend met gemeentelijke subsidies (WMO/Participatiewet) worden gefinancierd, kunnen aanspraak maken op 15% korting. Stuur een mail naar hallo@bijeen.nl met je subsidiebeschikking.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PrijzenPage() {
  const [billing, setBilling] = useState<"event" | "jaar">("jaar");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const tiers = billing === "event" ? perEventTiers : jaarTiers;

  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-20 pb-24 sm:pt-24 sm:pb-28 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
            Prijzen
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
            Transparant. Eerlijk.
            <br />
            <span className="text-terra-400">Subsidie-compatible.</span>
          </h1>
          <p className="text-white/65 text-lg leading-relaxed max-w-xl mx-auto mb-6">
            Betaal per evenement als je incidenteel organiseert, of kies een jaarabonnement
            dat aansluit op uw subsidiecyclus.
          </p>
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white/8 border border-white/12 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setBilling("jaar")}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                billing === "jaar"
                  ? "bg-terra-500 text-white shadow-lg shadow-terra-500/30"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              Jaarabonnement
            </button>
            <button
              onClick={() => setBilling("event")}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                billing === "event"
                  ? "bg-terra-500 text-white shadow-lg shadow-terra-500/30"
                  : "text-white/50 hover:text-white/80"
              )}
            >
              Per evenement
            </button>
          </div>
          {billing === "jaar" && (
            <p className="text-white/35 text-xs mt-3">
              Kwartaalfacturatie beschikbaar · Subsidie-eligible · WMO-factuur op verzoek
            </p>
          )}
        </div>
      </section>

      {/* ── PLAN CARDS ────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {tiers.map((tier) => (
              <div
                key={tier.key}
                className={cn(
                  "relative rounded-2xl flex flex-col",
                  tier.highlight
                    ? "bg-[#12100E] shadow-2xl ring-1 ring-terra-500/40"
                    : "bg-white border border-sand/60 shadow-sm"
                )}
              >
                {"badge" in tier && tier.badge && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="bg-terra-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-terra-500/30">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-6">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest mb-3",
                      tier.highlight ? "text-terra-400" : "text-terra-500"
                    )}>
                      {tier.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className={cn(
                        "text-4xl font-extrabold tracking-tight",
                        tier.highlight ? "text-white" : "text-ink"
                      )}>
                        {tier.priceLabel}
                      </span>
                      {"period" in tier && tier.period && (
                        <span className={cn("text-sm", tier.highlight ? "text-white/45" : "text-ink/40")}>
                          {tier.period}
                        </span>
                      )}
                    </div>
                    <p className={cn("text-xs", tier.highlight ? "text-white/45" : "text-ink/45")}>
                      {tier.desc}
                    </p>
                    {"perEvent" in tier && tier.perEvent && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {tier.perEvent} gem. · {(tier as typeof jaarTiers[number]).saving} goedkoper
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map(({ text, included }) => (
                      <li key={text} className={cn(
                        "flex items-start gap-2.5 text-sm",
                        included
                          ? tier.highlight ? "text-white/80" : "text-ink/70"
                          : tier.highlight ? "text-white/25 line-through" : "text-ink/25 line-through"
                      )}>
                        {included
                          ? <Check size={14} className={cn("mt-0.5 shrink-0", tier.highlight ? "text-terra-400" : "text-terra-500")} />
                          : <X size={14} className="mt-0.5 shrink-0 text-current" />
                        }
                        {text}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <a
                    href={tier.ctaHref}
                    className={cn(
                      "block text-center py-3 rounded-xl text-sm font-bold transition-all",
                      tier.highlight
                        ? "bg-terra-500 hover:bg-terra-600 text-white shadow-lg shadow-terra-500/25 hover:-translate-y-0.5"
                        : tier.key === "platform"
                        ? "bg-ink/6 hover:bg-ink/12 text-ink/70 border border-ink/12"
                        : "bg-terra-50 hover:bg-terra-100 text-terra-700 border border-terra-200"
                    )}
                  >
                    {tier.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Platform callout for yearly view */}
          {billing === "jaar" && (
            <div className="mt-5 bg-white border border-sand/60 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-ink text-sm mb-1">Platform — Gemeente & Koepel</p>
                <p className="text-sm text-ink/55">
                  Meer dan 30 events per jaar? Onbeperkt events, SLA-garantie, maatwerk contract — vanaf ~€3.500/jaar.
                </p>
              </div>
              <a
                href="mailto:hallo@bijeen.nl?subject=Platform aanvraag"
                className="shrink-0 inline-flex items-center gap-2 bg-[#12100E] hover:bg-[#2a2420] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Offerte aanvragen
                <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── SUBSIDIE SECTION ──────────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Subsidie-compatible
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-4 leading-tight">
                Bijeen past binnen uw
                <br />WMO- en IZA-budget.
              </h2>
              <p className="text-ink/60 text-lg leading-relaxed mb-6">
                Welzijnsorganisaties betalen niet uit eigen zak — ze alloceren vanuit geoormerkte
                subsidiebudgetten. Bijeen is volledig opvoerbaar als IT-post binnen WMO-, IZA- en
                AZWA-projectbudgetten.
              </p>
              <a
                href="mailto:hallo@bijeen.nl?subject=Subsidie factuur aanvragen"
                className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
              >
                Vraag een subsidie-factuur aan
                <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: FileText,
                  title: "WMO-factuur",
                  desc: "Factuur met projectcode en WMO-dossier­kenmerk — direct inzetbaar voor subsidie­verantwoording.",
                },
                {
                  icon: Receipt,
                  title: "Kwartaalfacturatie",
                  desc: "Sluit aan bij uw subsidiecyclus — kwartaalrekening van ~€123–€723 i.p.v. een jaarnota.",
                },
                {
                  icon: BadgePercent,
                  title: "15% WMO-korting",
                  desc: "Uitsluitend WMO-gefinancierde organisaties ontvangen 15% korting. Mail uw subsidie­beschikking.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-cream rounded-2xl border border-sand/60 p-4 sm:p-5">
                  <div className="w-9 h-9 rounded-xl bg-terra-50 flex items-center justify-center text-terra-500 mb-3">
                    <Icon size={17} strokeWidth={2} />
                  </div>
                  <p className="font-bold text-ink text-sm mb-1.5">{title}</p>
                  <p className="text-xs text-ink/55 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VERGELIJKING ──────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Vergelijking
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
              Bijeen vs. de alternatieven
            </h2>
            <p className="text-ink/55 text-base max-w-lg mx-auto">
              Eventbrite rekent tot €500 aan variabele kosten per 100 deelnemers.
              EventMobi begint bij €2.700 per event. Bijeen: een vast tarief, inclusief
              de impactrapportage die u nodig heeft voor uw subsidieaanvraag.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-sand/60 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 bg-sand/40 px-5 py-3.5">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest col-span-1" />
              {[
                { name: "Bijeen", highlight: true },
                { name: "Eventbrite", highlight: false },
                { name: "EventMobi", highlight: false },
              ].map(({ name, highlight }) => (
                <span
                  key={name}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-widest text-center",
                    highlight ? "text-terra-500" : "text-ink/35"
                  )}
                >
                  {name}
                </span>
              ))}
            </div>

            {comparison.map(({ feature, bijeen, eventbrite, eventmobi }, i) => (
              <div
                key={feature}
                className={cn(
                  "grid grid-cols-4 items-center px-5 py-3.5",
                  i % 2 === 0 ? "bg-white" : "bg-cream/50",
                  i !== comparison.length - 1 && "border-b border-sand/40"
                )}
              >
                <span className="text-sm text-ink/70 col-span-1 pr-2">{feature}</span>
                {[bijeen, eventbrite, eventmobi].map((val, idx) => (
                  <div key={idx} className="flex justify-center">
                    {typeof val === "boolean" ? (
                      val
                        ? <Check size={16} className={idx === 0 ? "text-terra-500" : "text-ink/20"} />
                        : <X size={16} className="text-red-300" />
                    ) : (
                      <span className={cn(
                        "text-sm font-semibold",
                        idx === 0 ? "text-terra-600" : "text-ink/40"
                      )}>
                        {val as string}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXTRAS ────────────────────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">Extra&apos;s</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Optionele uitbreidingen</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extras.map(({ icon: Icon, title, desc, price }) => (
              <div key={title} className="bg-cream rounded-2xl border border-sand/60 p-5 sm:p-6">
                <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center text-terra-500 mb-4">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <p className="font-bold text-ink text-sm mb-1.5">{title}</p>
                <p className="text-sm text-ink/55 leading-relaxed mb-3">{desc}</p>
                <p className="text-xs font-bold text-terra-500">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Veelgestelde vragen</h2>
          </div>
          <div className="bg-white rounded-2xl border border-sand/60 px-5 sm:px-7 shadow-sm">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-ink/6 last:border-b-0">
                <button
                  onClick={() => setOpenFaq(prev => prev === q ? null : q)}
                  className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                  aria-expanded={openFaq === q}
                >
                  <span className={cn(
                    "text-sm font-semibold leading-snug transition-colors",
                    openFaq === q ? "text-terra-500" : "text-ink group-hover:text-terra-500"
                  )}>
                    {q}
                  </span>
                  <ChevronDown
                    size={17}
                    className={cn("mt-0.5 shrink-0 text-ink/30 transition-transform duration-200", openFaq === q && "rotate-180 text-terra-500")}
                  />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-200",
                  openFaq === q ? "max-h-96 opacity-100 pb-5" : "max-h-0 opacity-0"
                )}>
                  <p className="text-sm text-ink/60 leading-relaxed">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#12100E] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,82,42,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Begin vandaag. Gratis.
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Community-tier permanent gratis. Upgrade wanneer je klaar bent.
            Geen creditcard, geen verplichting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-xl shadow-terra-500/30"
            >
              <Zap size={16} className="fill-white" />
              Maak gratis account aan
            </Link>
            <Link
              href="/over-ons#demo"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl transition-all text-sm"
            >
              Plan een demo
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
