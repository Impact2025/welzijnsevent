import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Over ons — Bijeen",
  description: "Gebouwd door mensen die de welzijnssector kennen. Een concept van WeAreImpact.nl.",
};

const products = [
  {
    icon: "🗺️",
    name: "IctusGo",
    desc: "GPS-gebaseerde teambuilding app die buitenactiviteiten combineert met maatschappelijke impact. Gebruikt door gemeenten en welzijnsorganisaties.",
  },
  {
    icon: "❤️",
    name: "VrijwilligersAssistent.nl",
    desc: "AI-gedreven platform dat vrijwilligers matcht met organisaties op basis van passie en beschikbaarheid.",
  },
  {
    icon: "🤖",
    name: "WelzijnsAssistent.AI",
    desc: "Intelligente intake-tool voor welzijnsorganisaties die administratie vermindert en contactmomenten vergroot.",
  },
  {
    icon: "🎯",
    name: "DatingAssistent.nl",
    desc: "Datingsplatform voor mensen met een bijzonder verhaal, ondersteund door AI coaching.",
  },
];

const values = [
  {
    icon: "🌱",
    title: "Sector eerst",
    desc: "We bouwen voor welzijn — niet voor profit. Onze prijzen zijn eerlijk en onze features zijn relevant voor jouw werk.",
  },
  {
    icon: "🔗",
    title: "Verbinding boven technologie",
    desc: "De technologie dient de mens. Niet andersom. Elk feature begint met de vraag: helpt dit mensen dichter bij elkaar brengen?",
  },
  {
    icon: "📊",
    title: "Impact meetbaar maken",
    desc: "Goed werk verdient zichtbaarheid. We geven jou de data om aan te tonen wat jij al wist: jouw evenementen maken verschil.",
  },
  {
    icon: "🔒",
    title: "Privacy en vertrouwen",
    desc: "Deelnemersdata is heilig. Nederlandse servers, AVG-compliant, verwerkersovereenkomst standaard inbegrepen.",
  },
];

const contact = [
  {
    icon: "📧",
    title: "E-mail",
    desc: "hallo@bijeen.nl",
    sub: "We reageren binnen 1 werkdag",
    href: "mailto:hallo@bijeen.nl",
  },
  {
    icon: "💬",
    title: "Demo aanvragen",
    desc: "Gratis 30-minuten demo",
    sub: "Plan via bijeen.nl/demo",
    href: "#demo",
  },
  {
    icon: "📞",
    title: "Bel ons",
    desc: "Liever bellen?",
    sub: "Stuur een mail, we plannen een belafspraak",
    href: "mailto:hallo@bijeen.nl",
  },
  {
    icon: "🌐",
    title: "WeAreImpact",
    desc: "Meer over ons",
    sub: "weareimpact.nl",
    href: "https://weareimpact.nl",
  },
];

export default function OverOnsPage() {
  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-16 pb-20 sm:pt-20 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
            Ons verhaal
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Gebouwd door mensen
            <br /> die de sector kennen.
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">
            Bijeen is geen generiek softwareproduct dat toevallig ook werkt voor welzijn. Het is
            gebouwd vánuit de sector, vóór de sector.
          </p>
        </div>
      </section>

      {/* ── VERHAAL ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-6">
            <p className="text-lg text-ink-muted leading-relaxed">
              Bijeen is gebouwd door mensen die zelf weten hoe het voelt om een vrijwilligersdag te
              organiseren met een te-kleine begroting en te-grote ambities.
            </p>
            <p className="text-lg text-ink-muted leading-relaxed">
              We zagen hoe hardwerkende coördinatoren uren verloren aan registratielijsten, hoe
              netwerkbijeenkomsten eindigden zonder dat mensen de juiste mensen hadden ontmoet, en
              hoe impactvolle evenementen onzichtbaar bleven omdat de data er nooit was.
            </p>
            <p className="text-lg font-semibold text-ink leading-relaxed">
              Dat wilden we veranderen.
            </p>
          </div>
        </div>
      </section>

      {/* ── WEAREIMPACT ──────────────────────────────────────── */}
      <section id="weareimpact" className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              WeAreImpact.nl
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
              De holding achter Bijeen
            </h2>
            <p className="text-ink-muted max-w-2xl text-lg leading-relaxed">
              Bijeen is een concept van WeAreImpact.nl — een Nederlands social tech bedrijf dat
              digitale producten ontwikkelt voor de welzijns- en zorgsector. Onze missie: de waarde
              van menselijke verbinding meetbaar en zichtbaar maken.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {products.map(({ icon, name, desc }) => (
              <div key={name} className="bg-cream rounded-2xl border border-sand/60 p-5 sm:p-6">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-ink mb-2">{name}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAARDEN ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Onze waarden
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Waar we voor staan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {values.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-sand/60 p-6 sm:p-8 shadow-sm"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-ink mb-2 text-lg">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="bg-[#12100E] py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-2">
              Contact
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Praat met ons
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              We zijn geen anoniem softwarebedrijf. We kennen jouw uitdagingen en we zijn
              bereikbaar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {contact.map(({ icon, title, desc, sub, href }) => (
              <a
                key={title}
                href={href}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/8 transition-colors group"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <p className="font-bold text-white text-sm mb-1">{title}</p>
                <p className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                  {desc}
                </p>
                <p className="text-white/30 text-xs mt-1">{sub}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CTA ─────────────────────────────────────────── */}
      <section id="demo" className="py-16 sm:py-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-ink tracking-tight mb-4">
            Benieuwd wat Bijeen voor
            <br className="hidden sm:block" /> jouw organisatie kan doen?
          </h2>
          <p className="text-ink-muted text-lg mb-8">
            Plan een gratis demo van 30 minuten. We lopen samen door de tool en kijken of het bij
            jullie past.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-terra-500/20 hover:-translate-y-0.5"
          >
            <Zap size={15} className="fill-white" />
            Plan een gratis demo
          </Link>
        </div>
      </section>
    </div>
  );
}
