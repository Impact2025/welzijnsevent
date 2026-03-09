import Link from "next/link";
import {
  ArrowRight, Zap, BarChart3, QrCode,
  MessageSquare, Star, Network, FileText, Smartphone,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const features = [
  {
    icon: FileText,
    title: "Slimme registratie",
    desc: "Maatwerk inschrijfformulieren, sessiekeuze, wachtlijst en automatische herinneringen — in 5 minuten opgezet.",
  },
  {
    icon: QrCode,
    title: "QR check-in app",
    desc: "Deelnemers inchecken via QR code. Realtime overzicht op je scherm. Geen lijsten, geen gedoe.",
  },
  {
    icon: Network,
    title: "AI netwerkkoppeling",
    desc: "Het systeem koppelt deelnemers op rol, organisatie en interessegebied. Jij faciliteert verbinding.",
  },
  {
    icon: MessageSquare,
    title: "Live interactie",
    desc: "Polls, live Q&A en een sociale wall. Deelnemers worden deelnemers, geen publiek.",
  },
  {
    icon: BarChart3,
    title: "Impactrapportage",
    desc: "Automatisch rapport na elk event: opkomst, tevredenheid, matches. Klaar voor je subsidieaanvraag.",
  },
  {
    icon: Smartphone,
    title: "White-label app",
    desc: "Jouw naam, jouw kleuren, jouw domein. Deelnemers zien jouw organisatie — niet onze software.",
  },
];

const testimonials = [
  {
    quote: "We organiseerden onze vrijwilligersdag altijd met Excel en een hoop stress. Met Bijeen was alles vooraf geregeld en kregen we eindelijk data voor onze jaarverantwoording.",
    name: "Coördinator Vrijwilligerswerk",
    org: "Humanitas Utrecht",
    initial: "H",
  },
  {
    quote: "De netwerkkoppeling was een openbaring. Deelnemers spraken met mensen die ze anders nooit hadden ontmoet. En we konden het meten.",
    name: "Programmamanager",
    org: "Sociaal Werk Nederland",
    initial: "S",
  },
];

const plans = [
  {
    name: "Basis",
    price: "79",
    desc: "Per evenement · max. 150 deelnemers",
    features: ["Eventpagina + inschrijving", "QR check-in", "Basisprogramma", "Deelnemersexport"],
    highlight: false,
  },
  {
    name: "Welzijn Pro",
    price: "249",
    desc: "Per evenement · max. 600 deelnemers",
    features: ["Alles uit Basis", "AI netwerkkoppeling", "Live Q&A en polls", "Impactrapportage PDF", "White-label app"],
    highlight: true,
  },
  {
    name: "Congres",
    price: "699",
    desc: "Per evenement · onbeperkt deelnemers",
    features: ["Alles uit Welzijn Pro", "Parallelle sessies", "Hybrid/streaming", "Dedicated support"],
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="bg-[#12100E]">
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 sm:pt-48 sm:pb-36 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/6 border border-white/10 rounded-full px-3.5 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 bg-terra-400 rounded-full animate-pulse" />
            <span className="text-white/70 text-xs font-semibold tracking-wide">
              Vertrouwd door 120+ welzijnsorganisaties in Nederland
            </span>
          </div>

          <h1 className="text-[2.75rem] sm:text-6xl lg:text-[5rem] font-extrabold text-white tracking-tight leading-[1.04] mb-6">
            Evenementen die écht
            <br />
            <span className="text-terra-400">verbinding maken</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Het eerste eventplatform gebouwd voor de welzijnssector. Van vrijwilligersdag tot
            buurtfestival — organiseer met impact, meet wat je bereikt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5"
            >
              <Zap size={16} className="fill-white" />
              Start gratis proefperiode
            </Link>
            <Link
              href="/functies"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 text-white font-semibold text-base px-7 py-3.5 rounded-xl border border-white/15 transition-colors"
            >
              Bekijk een demo
              <ArrowRight size={16} />
            </Link>
          </div>

          <p className="text-white/40 text-sm">
            Geen creditcard nodig · Eerste event gratis · Klaar in 10 minuten
          </p>
        </div>
      </section>

      {/* ── PROBLEEM ──────────────────────────────────────────── */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
              Het probleem
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
              Excel, Mailchimp en een
              <br className="hidden sm:block" /> WhatsApp­groep. Dat kan beter.
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Welzijnsorganisaties organiseren tientallen evenementen per jaar. De impact is
              enorm — maar de tools zijn het niet.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                stat: "4,2 uur",
                label: "Voorbereiding per event",
                desc: "Handmatig bijhouden, deelnemers mailen, lijsten updaten. Keer op keer.",
              },
              {
                stat: "38%",
                label: "Deelnemers incheckt niet via mail",
                desc: "Papieren lijsten, lange rijen bij de ingang, incomplete aanwezigheidsdata.",
              },
              {
                stat: "0 data",
                label: "Voor impactrapportage subsidie",
                desc: "Na afloop is er geen bewijs van wat je bereikt hebt. Terwijl dat er wél was.",
              },
            ].map(({ stat, label, desc }) => (
              <div key={stat} className="bg-white rounded-2xl border border-sand/60 shadow-sm p-6 sm:p-8">
                <p className="text-5xl sm:text-6xl font-extrabold text-ink tracking-tight mb-3 leading-none">
                  {stat}
                </p>
                <p className="text-sm font-bold text-ink mb-2">{label}</p>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
              Wat Bijeen doet
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
              Alles op één plek.
              <br className="hidden sm:block" /> Van inschrijving tot impactrapport.
            </h2>
            <p className="text-ink-muted text-lg leading-relaxed">
              Bijeen combineert eventbeheer, slimme netwerkkoppeling en automatische
              impactmeting — speciaal voor de welzijnssector.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-cream rounded-2xl border border-sand/60 p-6 hover:border-terra-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-4 transition-colors">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/functies"
              className="inline-flex items-center gap-2 text-terra-500 hover:text-terra-600 font-semibold transition-colors"
            >
              Alle functies bekijken <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="bg-[#12100E] py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mx-auto text-center mb-14">
            <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
              Wat organisaties zeggen
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Minder stress.
              <br /> Meer impact. Betere data.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {testimonials.map(({ quote, name, org, initial }) => (
              <div
                key={org}
                className="bg-white/6 border border-white/12 rounded-2xl p-6 sm:p-8 flex flex-col"
              >
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-terra-400 fill-terra-400" />
                  ))}
                </div>
                <p className="text-white/80 text-[15px] leading-relaxed mb-6 flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-terra-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">{initial}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{name}</p>
                    <p className="text-white/50 text-xs">{org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIJZEN TEASER ───────────────────────────────────── */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mx-auto text-center mb-14">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
              Prijzen
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
              Transparant. Eerlijk.
              <br className="hidden sm:block" /> Zonder verrassingen.
            </h2>
            <p className="text-ink-muted text-lg">
              Betaal per event of kies een voordelig jaarabonnement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto mb-8">
            {plans.map(({ name, price, desc, features: planFeatures, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col ${
                  highlight
                    ? "bg-[#12100E] shadow-2xl ring-1 ring-terra-500/30"
                    : "bg-white border border-sand/60 shadow-sm"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="bg-terra-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg">
                      Populairste keuze
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${highlight ? "text-terra-400" : "text-terra-500"}`}>
                    {name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className={`text-5xl font-extrabold tracking-tight ${highlight ? "text-white" : "text-ink"}`}>
                      €{price}
                    </span>
                  </div>
                  <p className={`text-xs ${highlight ? "text-white/55" : "text-ink-muted"}`}>{desc}</p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {planFeatures.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${highlight ? "text-white/80" : "text-ink-muted"}`}>
                      <span className={`mt-0.5 font-bold text-xs shrink-0 ${highlight ? "text-terra-400" : "text-terra-500"}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    highlight
                      ? "bg-terra-500 hover:bg-terra-600 text-white shadow-lg shadow-terra-500/25"
                      : "bg-sand hover:bg-terra-50 hover:text-terra-700 text-ink border border-sand"
                  }`}
                >
                  Start gratis
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-ink-muted text-sm">
            Regelmatig events?{" "}
            <Link href="/prijzen" className="text-terra-500 hover:text-terra-600 font-semibold transition-colors">
              Bekijk jaarabonnementen en bespaar tot 45% →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section className="relative bg-[#12100E] py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-terra-900/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-terra-500/7 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-4">
            Klaar om te starten?
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Jouw eerste event is
            <br className="hidden sm:block" /> gratis. Echt.
          </h2>
          <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto">
            Start vandaag. Geen creditcard nodig. Jouw eerste event in 10 minuten live.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold text-base px-7 py-3.5 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5"
            >
              <Zap size={16} className="fill-white" />
              Maak gratis account aan
            </Link>
            <Link
              href="/prijzen"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/8 hover:bg-white/12 text-white font-semibold text-base px-7 py-3.5 rounded-xl border border-white/15 transition-colors"
            >
              Bekijk prijzen
            </Link>
          </div>
          <p className="text-white/35 text-sm mt-8">
            Een concept van WeAreImpact.nl · Gebouwd voor de welzijnssector
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
