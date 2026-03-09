import Link from "next/link";
import { Check, Zap, BookOpen, MessageCircle, Shield, Wrench } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prijzen — Bijeen",
  description: "Transparante prijzen voor eventplatform Bijeen. Betaal per event of kies een voordelig jaarabonnement.",
};

const payPerEvent = [
  {
    name: "Basis",
    price: 79,
    desc: "max. 150 deelnemers",
    features: [
      "Eventpagina + inschrijving",
      "QR check-in",
      "Basisprogramma",
      "Deelnemersexport",
      "E-mailbevestigingen",
    ],
    highlight: false,
  },
  {
    name: "Welzijn Pro",
    price: 249,
    desc: "max. 600 deelnemers",
    features: [
      "Alles uit Basis",
      "AI netwerkkoppeling",
      "Live Q&A en polls",
      "Impactrapportage PDF",
      "White-label app",
      "Prioriteit support",
    ],
    highlight: true,
  },
  {
    name: "Congres",
    price: 699,
    desc: "onbeperkt deelnemers",
    features: [
      "Alles uit Welzijn Pro",
      "Parallelle sessies",
      "Hybrid/streaming",
      "Custom integraties",
      "Dedicated support",
      "Co-branding optie",
    ],
    highlight: false,
  },
];

const subscriptions = [
  { name: "Starter", price: 590, events: "6 events (Basis)", saving: "25%" },
  { name: "Groei", price: 1490, events: "20 events (Welzijn Pro)", saving: "40%" },
  { name: "Organisatie", price: 3490, events: "Onbeperkt + Congres", saving: "45%" },
];

const extras = [
  {
    icon: BookOpen,
    title: "Onboarding begeleiding",
    desc: "Wij helpen je bij de inrichting van je eerste event.",
    price: "Eenmalig €350",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integratie",
    desc: "Automatische herinneringen via WhatsApp.",
    price: "€15 / maand",
  },
  {
    icon: Shield,
    title: "Premium support",
    desc: "Directe lijn met je vaste contactpersoon.",
    price: "€99 / maand",
  },
  {
    icon: Wrench,
    title: "Maatwerk & API",
    desc: "Koppeling met je eigen CRM of ledenregistratie.",
    price: "€95 / uur",
  },
];

const faqs = [
  {
    q: "Is er een gratis proefperiode?",
    a: "Ja. Je eerste event is gratis — tot 50 deelnemers, volledig functioneel. Geen creditcard nodig.",
  },
  {
    q: "Heb ik technische kennis nodig?",
    a: "Nee. Bijeen is gebouwd voor welzijnsprofessionals, niet voor IT-ers. Als je een e-mail kunt sturen, kun je een event aanmaken.",
  },
  {
    q: "Is mijn data veilig en AVG-proof?",
    a: "Ja. Alle data staat op Nederlandse servers. We leveren standaard een verwerkersovereenkomst. Privacy by design.",
  },
  {
    q: "Kan ik mijn huidige deelnemerslijst importeren?",
    a: "Ja. Upload een Excel of CSV en je deelnemers staan direct in het systeem.",
  },
  {
    q: "Zijn er contracten of opzegtermijnen?",
    a: "Nee. Jaarabonnementen lopen 12 maanden en zijn daarna maandelijks opzegbaar. Pay-per-event heeft geen verplichtingen.",
  },
];

export default function PrijzenPage() {
  return (
    <div className="bg-cream min-h-screen pt-16">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-[#12100E] pt-16 pb-20 sm:pt-20 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-terra-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
            Prijzen
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-5">
            Transparant. Eerlijk.
            <br /> Zonder verrassingen.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-xl mx-auto">
            Betaal per evenement als je incidenteel organiseert, of kies een jaarabonnement als
            events structureel onderdeel zijn van je werk.
          </p>
        </div>
      </section>

      {/* ── PAY-PER-EVENT ────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Pay-per-event
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              Eenmalig per evenement
            </h2>
            <p className="text-ink-muted text-base">
              Geen abonnement, geen verplichting. Je betaalt alleen voor wat je organiseert.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {payPerEvent.map(({ name, price, desc, features, highlight }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col ${
                  highlight
                    ? "bg-[#12100E] shadow-2xl ring-1 ring-terra-500/30"
                    : "bg-white border border-sand/60 shadow-sm"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                    <span className="bg-terra-500 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-terra-500/30">
                      Populairste keuze
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${highlight ? "text-terra-400" : "text-terra-500"}`}>
                    {name}
                  </p>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className={`text-5xl font-extrabold tracking-tight ${highlight ? "text-white" : "text-ink"}`}>
                      €{price}
                    </span>
                  </div>
                  <p className={`text-sm ${highlight ? "text-white/55" : "text-ink-muted"}`}>{desc}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${highlight ? "text-white/80" : "text-ink-muted"}`}>
                      <Check size={15} className={`mt-0.5 shrink-0 ${highlight ? "text-terra-400" : "text-terra-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/dashboard"
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
        </div>
      </section>

      {/* ── JAARABONNEMENT ───────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Jaarabonnement
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              Meerdere events per jaar? Bespaar tot 45%.
            </h2>
            <p className="text-ink-muted text-base max-w-xl">
              Voor organisaties die regelmatig evenementen organiseren is een abonnement
              voordeliger en geeft het rust.
            </p>
          </div>

          <div className="rounded-2xl border border-sand/60 overflow-hidden shadow-sm mb-8">
            <div className="hidden sm:grid grid-cols-4 bg-sand/50 px-6 py-3.5 text-[11px] font-bold text-ink-muted uppercase tracking-widest">
              <span>Abonnement</span>
              <span>Prijs / jaar</span>
              <span>Events inbegrepen</span>
              <span>Besparing</span>
            </div>
            {subscriptions.map(({ name, price, events, saving }, i) => (
              <div
                key={name}
                className={`grid grid-cols-2 sm:grid-cols-4 gap-y-1 px-6 py-4 sm:py-5 items-center hover:bg-cream/60 transition-colors ${
                  i !== subscriptions.length - 1 ? "border-b border-sand/60" : ""
                }`}
              >
                <span className="font-bold text-ink">{name}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  €{price.toLocaleString("nl")}
                </span>
                <span className="text-sm text-ink-muted col-span-2 sm:col-span-1">{events}</span>
                <span className="inline-flex">
                  <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-black px-2.5 py-1 rounded-full">
                    {saving} goedkoper
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-terra-500/20"
            >
              <Zap size={15} className="fill-white" />
              Start met een abonnement
            </Link>
          </div>
        </div>
      </section>

      {/* ── EXTRAS ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              Extra&apos;s
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Optionele uitbreidingen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extras.map(({ icon: Icon, title, desc, price }) => (
              <div key={title} className="bg-white rounded-2xl border border-sand/60 p-5 sm:p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-terra-50 flex items-center justify-center text-terra-500 mb-4">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <p className="font-bold text-ink text-sm mb-1.5">{title}</p>
                <p className="text-sm text-ink-muted leading-relaxed mb-3">{desc}</p>
                <p className="text-xs font-bold text-terra-500">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-2">
              FAQ
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Veelgestelde vragen
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-cream rounded-2xl border border-sand/60 p-5 sm:p-6">
                <p className="font-bold text-ink mb-2">{q}</p>
                <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
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
