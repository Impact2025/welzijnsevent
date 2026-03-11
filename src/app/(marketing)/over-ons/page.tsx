import Link from "next/link";
import {
  Leaf, Link2, BarChart3, Lock,
  Check, ArrowRight, Mail, MessageCircle,
  Calendar, Navigation, Heart, Bot, Target,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Over ons — Bijeen",
  description: "Bijeen is gebouwd door WeAreImpact.nl — een Nederlands social tech bedrijf dat digitale producten ontwikkelt voor de welzijns- en zorgsector.",
};

const stats = [
  { value: "AVG", label: "Compliant" },
  { value: "NL", label: "Servers" },
  { value: "14", label: "Dagen gratis" },
  { value: "100%", label: "Welzijnsfocus" },
];

const products = [
  { icon: Navigation,  name: "IctusGo",                desc: "GPS-gebaseerde teambuilding die buitenactiviteiten combineert met maatschappelijke impact." },
  { icon: Heart,       name: "VrijwilligersAssistent.nl", desc: "AI-platform dat vrijwilligers matcht met organisaties op basis van passie en beschikbaarheid." },
  { icon: Bot,         name: "WelzijnsAssistent.AI",   desc: "Intelligente intake-tool die administratie vermindert en contactmomenten vergroot." },
  { icon: Target,      name: "DatingAssistent.nl",     desc: "Datingsplatform voor mensen met een bijzonder verhaal, ondersteund door AI coaching." },
];

const values = [
  { icon: Leaf,      title: "Sector eerst",              desc: "We bouwen voor welzijn — niet voor profit. Onze prijzen zijn eerlijk en onze features relevant voor jouw werk." },
  { icon: Link2,     title: "Verbinding boven tech",     desc: "De technologie dient de mens. Elk feature begint met: helpt dit mensen dichter bij elkaar brengen?" },
  { icon: BarChart3, title: "Impact meetbaar maken",     desc: "Goed werk verdient zichtbaarheid. We geven je de data om aan te tonen wat jij al wist: jouw evenementen maken verschil." },
  { icon: Lock,      title: "Privacy en vertrouwen",     desc: "Deelnemersdata is heilig. Nederlandse servers, AVG-compliant, verwerkersovereenkomst standaard inbegrepen." },
];

const demoExpect = [
  "Persoonlijke rondleiding door de tool (~30 min)",
  "Jouw specifieke use case centraal",
  "Eerlijk antwoord of Bijeen bij jullie past",
  "Geen verkooppraatje, geen verplichtingen",
];

const team = [
  { initials: "MO", name: "Michiel", role: "Oprichter & developer", color: "#C8522A" },
  { initials: "TM", name: "Team",    role: "Welzijn & implementatie", color: "#2D5A3D" },
];

export default function OverOnsPage() {
  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-20 pb-24 sm:pt-28 sm:pb-32 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
            Ons verhaal
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Gebouwd door mensen
            <br />
            <span className="text-terra-400">die de sector kennen.</span>
          </h1>
          <p className="text-white/65 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            Bijeen is geen generiek softwareproduct dat toevallig ook werkt voor welzijn.
            Het is gebouwd <em>vánuit</em> de sector, <em>vóór</em> de sector.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:hallo@bijeen.nl?subject=Demo aanvragen"
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-terra-500/25"
            >
              <Calendar size={16} />
              Plan een gratis demo
            </a>
            <Link
              href="/functies"
              className="inline-flex items-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Bekijk alle functies
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-sand/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-sand/60">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center first:pl-0 pl-6">
                <p className="text-2xl font-extrabold text-terra-500 tracking-tight">{value}</p>
                <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERHAAL ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">Het waarom</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight leading-tight">
                  We zagen een gat dat gedicht moest worden.
                </h2>
              </div>
              <p className="text-lg text-ink/65 leading-relaxed">
                We zagen hoe hardwerkende coördinatoren uren verloren aan registratielijsten in Excel.
                Hoe netwerkbijeenkomsten eindigden zonder dat mensen de juiste mensen hadden ontmoet.
                Hoe impactvolle evenementen onzichtbaar bleven omdat de data er nooit was.
              </p>
              <p className="text-lg text-ink/65 leading-relaxed">
                Bestaande event-tools zijn gebouwd voor muziekfestivals en congressen — niet voor de
                buurtcoördinator die 60 vrijwilligers wil verbinden met 40 mantelzorgers.
              </p>
              <p className="text-lg font-semibold text-ink leading-relaxed">
                Dat wilden we veranderen. Dus bouwden we Bijeen.
              </p>
            </div>

            {/* Pull-quote */}
            <div className="lg:pt-8">
              <div className="bg-[#12100E] rounded-2xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-terra-500/10 rounded-full blur-2xl" />
                <p className="text-[60px] leading-none font-serif text-terra-500/40 mb-4">"</p>
                <p className="text-white/85 text-lg sm:text-xl leading-relaxed font-medium relative">
                  Elke welzijnsevenement heeft een verhaal. Bijeen zorgt ervoor dat dat verhaal
                  verteld kan worden — met data, met impact, met trots.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-terra-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">WI</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold">Team Bijeen</p>
                    <p className="text-white/35 text-xs">WeAreImpact.nl</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">De mensen</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
              Wie zit er achter Bijeen?
            </h2>
            <p className="text-ink/55 text-lg max-w-xl mx-auto">
              Geen anoniem techbedrijf. Mensen met een missie.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {team.map(({ initials, name, role, color }) => (
              <div key={name} className="flex items-center gap-4 bg-cream rounded-2xl border border-sand/60 p-5 hover:border-terra-200 hover:shadow-sm transition-all">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-white text-base font-bold">{initials}</span>
                </div>
                <div>
                  <p className="font-bold text-ink">{name}</p>
                  <p className="text-sm text-ink/55">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEAREIMPACT ──────────────────────────────────────────── */}
      <section id="weareimpact" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">WeAreImpact.nl</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
              De holding achter Bijeen
            </h2>
            <p className="text-ink/55 text-lg leading-relaxed max-w-2xl">
              Bijeen is een concept van WeAreImpact.nl — een Nederlands social tech bedrijf dat
              digitale producten ontwikkelt voor de welzijns- en zorgsector.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {products.map(({ icon: Icon, name, desc }) => (
              <div key={name} className="group bg-white rounded-2xl border border-sand/60 p-5 sm:p-6 hover:border-terra-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink mb-1.5">{name}</h3>
                <p className="text-sm text-ink/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAARDEN ──────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">Onze waarden</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Waar we voor staan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-sand/60 bg-cream p-6 sm:p-8 hover:border-terra-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ─────────────────────────────────────────────── */}
      <section id="demo" className="bg-[#12100E] py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,82,42,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: headline + what to expect */}
            <div>
              <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-4">Gratis demo</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-5">
                Benieuwd wat Bijeen
                <br />voor jouw organisatie kan doen?
              </h2>
              <p className="text-white/60 text-lg mb-8">
                Plan een gratis demo van 30 minuten. We lopen samen door de tool
                en kijken eerlijk of het bij jullie past.
              </p>
              <ul className="space-y-3">
                {demoExpect.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-terra-500/20 border border-terra-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-terra-400" />
                    </div>
                    <span className="text-white/70 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: contact cards */}
            <div className="space-y-4">
              <a
                href="mailto:hallo@bijeen.nl?subject=Demo aanvragen"
                className="group flex items-center gap-5 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-terra-500/40 rounded-2xl p-5 sm:p-6 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-terra-500/20 group-hover:bg-terra-500/30 flex items-center justify-center text-terra-400 shrink-0 transition-colors">
                  <Mail size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm mb-0.5">Mail ons direct</p>
                  <p className="text-white/50 text-sm">hallo@bijeen.nl</p>
                  <p className="text-white/30 text-xs mt-1">Reactie binnen 1 werkdag</p>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-terra-400 transition-colors shrink-0" />
              </a>

              <a
                href="https://wa.me/31612345678?text=Hoi,%20ik%20wil%20graag%20een%20demo%20van%20Bijeen%20aanvragen."
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 bg-white/6 hover:bg-white/10 border border-white/10 hover:border-[#25D366]/40 rounded-2xl p-5 sm:p-6 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366]/15 group-hover:bg-[#25D366]/25 flex items-center justify-center shrink-0 transition-colors">
                  <MessageCircle size={20} className="text-[#25D366]" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm mb-0.5">WhatsApp</p>
                  <p className="text-white/50 text-sm">Snel even overleggen?</p>
                  <p className="text-white/30 text-xs mt-1">Direct contact met het team</p>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-[#25D366] transition-colors shrink-0" />
              </a>

              <div className="flex items-center gap-5 bg-white/3 border border-white/6 rounded-2xl p-5 sm:p-6">
                <div className="w-12 h-12 rounded-xl bg-white/6 flex items-center justify-center text-white/30 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-bold text-white/50 text-sm mb-0.5">Gratis · 30 minuten · Vrijblijvend</p>
                  <p className="text-white/30 text-xs">
                    We sturen je een Zoom-link na bevestiging
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
