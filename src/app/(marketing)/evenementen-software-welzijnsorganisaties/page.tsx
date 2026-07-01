import Link from "next/link";
import {
  ArrowRight, Zap, QrCode, Network, BarChart3,
  Check, X, Users, Clock, Shield, Heart,
  FileText, CalendarDays, Handshake, ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

/* ─── Metadata ────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Evenementen software voor welzijnsorganisaties",
  description:
    "Bijeen is het Nederlandse event platform speciaal voor de welzijnssector. AVG-compliant, met AI-netwerken, WMO-impactrapportage en vrijwilligersbeheer. Gratis starten.",
  alternates: {
    canonical: "/evenementen-software-welzijnsorganisaties",
  },
  openGraph: {
    title: "Evenementen software voor welzijnsorganisaties — Bijeen",
    description:
      "Het enige event platform dat de welzijnssector écht begrijpt. WMO-rapportage, AI-matchmaking, vrijwilligersbeheer — AVG-compliant en betaalbaar.",
    url: "/evenementen-software-welzijnsorganisaties",
    type: "website",
  },
  twitter: {
    title: "Evenementen software voor welzijnsorganisaties — Bijeen",
    description:
      "WMO-rapportage, AI-matchmaking en vrijwilligersbeheer in één platform. Speciaal voor de welzijnssector.",
  },
};

/* ─── Structured data (JSON-LD) ───────────────────────────────────────────── */

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bijeen",
    url: "https://bijeen.app",
    description:
      "Bijeen is het Nederlandse event management platform speciaal voor welzijnsorganisaties, non-profits en maatschappelijke instellingen. Met AI-netwerkkoppeling, WMO-impactrapportage, vrijwilligersbeheer en AVG-compliant aanmeldingen.",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "EventManagement",
    operatingSystem: "Web",
    inLanguage: "nl-NL",
    creator: {
      "@type": "Organization",
      name: "WeAreImpact",
      url: "https://www.weareimpact.nl",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Community",
        price: "0",
        priceCurrency: "EUR",
        description: "Gratis plan voor kleine welzijnsorganisaties",
      },
      {
        "@type": "Offer",
        name: "Welzijn",
        price: "490",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "490",
          priceCurrency: "EUR",
          unitCode: "ANN",
        },
      },
      {
        "@type": "Offer",
        name: "Netwerk",
        price: "1290",
        priceCurrency: "EUR",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Bijeen AVG-compliant?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Bijeen is volledig AVG-compliant. Gegevens worden verwerkt op Europese servers, er is een standaard verwerkersovereenkomst beschikbaar, en deelnemers kunnen hun gegevens inzien en laten verwijderen. Bijeen is gebouwd met privacy-by-design als uitgangspunt.",
        },
      },
      {
        "@type": "Question",
        name: "Werkt Bijeen ook voor kleine buurtorganisaties?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Bijeen biedt een gratis Community-plan dat geschikt is voor kleine buurtorganisaties, wijkcentra en vrijwilligersgroepen. Je kunt evenementen aanmaken, deelnemers registreren en impactgegevens verzamelen zonder kosten.",
        },
      },
      {
        "@type": "Question",
        name: "Kan ik Bijeen gratis uitproberen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Het Community-plan van Bijeen is gratis en vereist geen creditcard. Je kunt direct beginnen met het aanmaken van evenementen en het uitnodigen van deelnemers.",
        },
      },
      {
        "@type": "Question",
        name: "Hoe verschilt Bijeen van Eventbrite of Meetup?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bijeen is specifiek gebouwd voor de Nederlandse welzijnssector. Waar Eventbrite en Meetup generieke platforms zijn voor commerciële evenementen, biedt Bijeen functies die welzijnsorganisaties nodig hebben: WMO-impactrapportage, vrijwilligersbeheer, AI-netwerkkoppeling, AVG-compliance en Nederlandse klantenservice.",
        },
      },
      {
        "@type": "Question",
        name: "Ondersteunt Bijeen hybride evenementen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Bijeen ondersteunt zowel fysieke als hybride evenementen. Online deelnemers kunnen meedoen aan live Q&A, polls en de sociale wall, terwijl fysieke deelnemers inchecken via QR-code.",
        },
      },
      {
        "@type": "Question",
        name: "Is er een Sociaal Tarief voor non-profits?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Bijeen biedt een Sociaal Tarief van 15% korting voor ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen. Neem contact op via Bijeen.app voor meer informatie.",
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://bijeen.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Evenementen software welzijnsorganisaties",
        item: "https://bijeen.app/evenementen-software-welzijnsorganisaties",
      },
    ],
  },
];

/* ─── Data ────────────────────────────────────────────────────────────────── */

const painPoints = [
  { icon: "📋", text: "Deelnemers aanmelden via aparte formulieren en Excel" },
  { icon: "📱", text: "Vrijwilligers plannen via WhatsApp-groepen" },
  { icon: "📊", text: "Impactrapportage handmatig samenstellen voor de gemeente" },
  { icon: "🔒", text: "Zorgen over AVG-compliance bij deelnemersdata" },
];

const features = [
  {
    icon: CalendarDays,
    title: "Aanmeldingen & registratie",
    desc: "Eigen registratiepagina met jouw branding. Sessiekeuze, wachtlijst en capaciteitslimieten — automatisch geregeld. Klaar in 5 minuten.",
    keyword: "evenement registratie welzijn",
  },
  {
    icon: QrCode,
    title: "QR check-in zonder chaos",
    desc: "Scan met elk apparaat bij de ingang. Realtime aanwezigheidsoverzicht voor je team. Geen papieren lijsten, geen rijen, geen handmatig bijhouden.",
    keyword: "qr code check-in evenement",
  },
  {
    icon: Network,
    title: "AI-netwerkkoppeling",
    desc: "Deelnemers krijgen 3 tot 5 persoonlijke gespreksmatches vóór het event. Van toevallige ontmoetingen naar gerichte verbindingen. AVG-proof.",
    keyword: "ai matchmaking netwerkevenement",
  },
  {
    icon: BarChart3,
    title: "WMO-impactrapportage",
    desc: "Automatisch rapport na elk event: bereik, verbindingen, tevredenheid en vervolgacties. Exporteer als PDF voor jouw gemeente of subsidiegever.",
    keyword: "wmo impactrapport evenement",
  },
  {
    icon: Users,
    title: "Vrijwilligersbeheer",
    desc: "Taken indelen, diensten toewijzen, herinneringen versturen. Bijeen vervangt de WhatsApp-groep met een overzichtelijk systeem dat ook werkt als er 180 vrijwilligers meedoen.",
    keyword: "vrijwilligersbeheer evenement software",
  },
  {
    icon: Shield,
    title: "AVG-compliant by design",
    desc: "Nederlandse servers, verwerkersovereenkomst standaard inbegrepen, gegevens verwijderbaar door deelnemers zelf. Geen juridisch doolhof.",
    keyword: "avg compliant evenementen platform",
  },
];

const stats = [
  { val: "4,2 uur", label: "minder admin per event" },
  { val: "38%", label: "minder no-shows via QR check-in" },
  { val: "3×", label: "meer follow-up gesprekken via AI-matching" },
  { val: "15%", label: "Sociaal Tarief voor ANBI / WMO" },
];

const comparisonRows = [
  { feature: "Specifiek voor de welzijnssector", bijeen: true, eventbrite: false, forms: false },
  { feature: "WMO-impactrapportage (PDF)", bijeen: true, eventbrite: false, forms: false },
  { feature: "Vrijwilligersbeheer & planning", bijeen: true, eventbrite: false, forms: false },
  { feature: "AI-netwerkkoppeling (AVG-proof)", bijeen: true, eventbrite: false, forms: false },
  { feature: "QR check-in met realtime overzicht", bijeen: true, eventbrite: true, forms: false },
  { feature: "Automatische communicatie", bijeen: true, eventbrite: "deels", forms: false },
  { feature: "Sessiekeuze & parallelle programmalijnen", bijeen: true, eventbrite: "deels", forms: false },
  { feature: "AVG-compliant (Europese servers)", bijeen: true, eventbrite: false, forms: false },
  { feature: "Sociaal Tarief voor non-profits", bijeen: true, eventbrite: false, forms: false },
  { feature: "Nederlandse klantenservice", bijeen: true, eventbrite: false, forms: false },
];

const testimonials = [
  {
    quote:
      "We deden alles in Excel en WhatsApp-groepen. Nu zit het in Bijeen en heb ik eindelijk tijd voor de inhoud.",
    name: "Fatima Osman",
    role: "Programmaleider, Welzijnswerk Midden-Holland",
    initial: "F",
  },
  {
    quote:
      "De impactrapportage bespaart me uren schrijfwerk voor de subsidieaanvraag. Goud waard.",
    name: "Pieter van Beek",
    role: "Directeur, Sociaal Fonds Amsterdam",
    initial: "P",
  },
  {
    quote:
      "Onze deelnemers waren verrast hoe professioneel alles was. En het was ons kleinste budget ooit.",
    name: "Nadia Berkhout",
    role: "Coördinator netwerkevenementen, Humanitas",
    initial: "N",
  },
];

const plans = [
  {
    name: "Community",
    price: "Gratis",
    sub: "voor altijd",
    highlight: false,
    features: [
      "1 actief evenement",
      "Tot 50 deelnemers",
      "QR check-in",
      "Basisregistratie",
    ],
    cta: "Gratis starten",
    href: "/dashboard",
  },
  {
    name: "Welzijn",
    price: "€ 490",
    sub: "per jaar",
    highlight: true,
    badge: "Meest gekozen",
    features: [
      "Onbeperkt evenementen",
      "Tot 500 deelnemers",
      "WMO-impactrapportage",
      "Automatische communicatie",
      "Vrijwilligersbeheer",
      "AVG-verwerkersovereenkomst",
    ],
    cta: "Start met Welzijn",
    href: "/dashboard",
  },
  {
    name: "Netwerk",
    price: "€ 1.290",
    sub: "per jaar",
    highlight: false,
    features: [
      "Alles in Welzijn",
      "AI-netwerkkoppeling",
      "Onbeperkt deelnemers",
      "White-label (jouw domein)",
      "Live Q&A & polls",
      "Prioriteit support",
    ],
    cta: "Start met Netwerk",
    href: "/dashboard",
  },
];

const blogLinks = [
  {
    slug: "ai-matchmaking-welzijnsevenement-slimme-verbindingen",
    title: "Hoe AI-matchmaking jouw welzijnsevenement verandert van een sociaal uitje naar een strategische ontmoetingsplek",
    tag: "AI & netwerken",
    readingTime: 7,
  },
  {
    slug: "impact-meten-welzijnsevenement-wmo-rapportage",
    title: "Van gevoel naar getal: zo meet en rapporteer je de impact van jouw welzijnsevenement",
    tag: "Impactmeting",
    readingTime: 7,
  },
  {
    slug: "vrijwilligers-werven-behouden-evenement-welzijnsorganisatie",
    title: "Vrijwilligers werven én behouden voor je evenement: de complete gids voor welzijnsorganisaties (2026)",
    tag: "Vrijwilligers",
    readingTime: 8,
  },
];

const kennisbankLinks = [
  { href: "/kennisbank/evenementen-organiseren", label: "Evenementen organiseren", icon: "🗓️" },
  { href: "/kennisbank/impact-en-rapportage", label: "Impact en rapportage", icon: "📊" },
  { href: "/kennisbank/vrijwilligers", label: "Vrijwilligers", icon: "🤝" },
  { href: "/kennisbank/gdpr-en-privacy", label: "GDPR en privacy", icon: "🔐" },
];

const faqs = [
  {
    q: "Is Bijeen AVG-compliant?",
    a: "Ja. Bijeen is volledig AVG-compliant. Gegevens worden verwerkt op Europese servers en er is een standaard verwerkersovereenkomst inbegrepen. Deelnemers kunnen hun gegevens inzien en laten verwijderen. Privacy-by-design is geen marketingterm bij Bijeen, maar een architectuurkeuze.",
  },
  {
    q: "Werkt Bijeen ook voor kleine buurtorganisaties?",
    a: "Ja. Het gratis Community-plan is speciaal geschikt voor kleine buurtorganisaties, wijkcentra en vrijwilligersgroepen. Geen creditcard, geen verplichtingen. Je maakt een account aan en bent binnen 5 minuten live met je eerste evenement.",
  },
  {
    q: "Hoe verschilt Bijeen van Eventbrite of Meetup?",
    a: "Eventbrite en Meetup zijn gebouwd voor commerciële evenementen en ticketverkoop. Bijeen is specifiek gebouwd voor de Nederlandse welzijnssector: WMO-impactrapportage, vrijwilligersbeheer, AVG-compliance op Europese servers, en een Sociaal Tarief voor non-profits. Geen overbodige features, wel de tools die de sector nodig heeft.",
  },
  {
    q: "Kan ik Bijeen integreren met mijn CRM of ledenadministratie?",
    a: "Bijeen biedt data-export naar Excel en CSV. Op het Organisatie-plan is een API beschikbaar voor directe koppeling met je CRM of ledenadministratie. Neem contact op voor de specifieke integratiemogelijkheden voor jouw systeem.",
  },
  {
    q: "Ondersteunt Bijeen hybride evenementen?",
    a: "Ja. Bijeen ondersteunt zowel fysieke als hybride evenementen. Online deelnemers kunnen meedoen aan live Q&A, polls en de sociale wall. Fysieke deelnemers inchecken via QR-code. Beide stromen zijn zichtbaar in hetzelfde organisatordashboard.",
  },
  {
    q: "Is er een Sociaal Tarief voor non-profits en WMO-organisaties?",
    a: "Ja. Bijeen biedt 15% korting voor ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen. Stuur een mail naar het supportteam via Bijeen.app met je ANBI-registratienummer of WMO-financiering en je ontvangt de korting automatisch op je volgende factuur.",
  },
];

/* ─── Sub-components ──────────────────────────────────────────────────────── */

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

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function EvenementenSoftwareWelzijnsorganisatiesPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-cream min-h-screen pt-16">

        {/* ── BREADCRUMB ──────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="bg-cream border-b border-sand/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <ol className="flex items-center gap-1.5 text-xs text-ink-muted">
              <li><Link href="/" className="hover:text-terra-600 transition-colors">Home</Link></li>
              <li><ChevronRight size={12} className="text-ink/30" /></li>
              <li className="text-ink font-medium" aria-current="page">
                Evenementen software welzijnsorganisaties
              </li>
            </ol>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section className="bg-[#12100E] pt-16 pb-20 sm:pt-20 sm:pb-28 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-terra-500/4 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-terra-500/15 border border-terra-500/25 text-terra-400 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-terra-400" />
                Speciaal voor de welzijnssector
              </div>

              {/* H1 — primary keyword in natural sentence */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
                De evenementensoftware{" "}
                <span className="text-terra-400">die de welzijnssector begrijpt</span>
              </h1>

              <p className="text-white/65 text-lg sm:text-xl leading-relaxed mb-4 max-w-2xl">
                Van buurtactiviteit tot jaarcongres — beheer aanmeldingen, check-ins,
                vrijwilligers en WMO-impactrapportage in één platform. Gebouwd voor
                Nederlandse welzijnsorganisaties die grote impact maken met kleine teams.
              </p>

              {/* Social proof micro-copy */}
              <p className="text-white/35 text-sm mb-8">
                Gebruikt door welzijnsorganisaties in heel Nederland · AVG-compliant · Nederlandse servers
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-7 py-4 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5 text-base"
                >
                  <Zap size={16} className="fill-white" />
                  Gratis starten — geen creditcard
                </Link>
                <Link
                  href="/demo-aanvragen"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-7 py-4 rounded-xl transition-colors border border-white/10 text-base"
                >
                  Plan demo van 30 min <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="border-t border-white/8 mt-16 bg-white/4 backdrop-blur-sm">
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

        {/* ── PAIN POINTS ─────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-3">
                Herken je dit?
              </h2>
              <p className="text-ink-muted max-w-xl mx-auto">
                De meeste welzijnsorganisaties organiseren evenementen met tools die daar
                nooit voor bedoeld waren. Dat kost gemiddeld 4,2 uur extra per event.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {painPoints.map(({ icon, text }) => (
                <div
                  key={text}
                  className="bg-cream rounded-2xl border border-sand/60 p-5 flex items-start gap-3"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                  <p className="text-sm text-ink-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-terra-600 font-semibold mt-8">
              Bijeen lost al deze problemen op — in één platform, speciaal voor de welzijnssector.
            </p>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-cream" id="functies">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-14">
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Functies
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4 leading-tight">
                Alles wat een welzijnsorganisatie nodig heeft in één platform
              </h2>
              <p className="text-ink-muted text-lg leading-relaxed">
                Geen feature-fabriek. Geen onnodige complexiteit. Wél de tools die het
                verschil maken voor jouw deelnemers, vrijwilligers en subsidiegever.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <article
                  key={title}
                  className="bg-white rounded-2xl border border-sand/60 p-7 hover:border-terra-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 mb-5 transition-colors">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-extrabold text-ink mb-2 text-[15px]">{title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/functies"
                className="inline-flex items-center gap-2 text-terra-600 font-semibold hover:text-terra-700 transition-colors text-sm"
              >
                Alle functies bekijken <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL 1 ───────────────────────────────────────────── */}
        <div className="bg-terra-500/6 border-y border-terra-200/40 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-lg sm:text-xl text-ink font-medium leading-relaxed mb-5 italic">
              &ldquo;{testimonials[0].quote}&rdquo;
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-terra-200 flex items-center justify-center text-terra-700 font-bold text-sm shrink-0">
                {testimonials[0].initial}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-ink">{testimonials[0].name}</div>
                <div className="text-xs text-ink-muted">{testimonials[0].role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section className="bg-[#12100E] py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-terra-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold text-terra-400 uppercase tracking-widest mb-3">
                Zo werkt het
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Van aanmelding tot WMO-rapport in drie stappen
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: CalendarDays,
                  title: "Event aanmaken in 5 minuten",
                  desc: "Kies een template voor jouw type welzijnsevenement, vul de details in en deel de registratielink met je doelgroep. Eigen branding, eigen vragen, automatische bevestigingsmails.",
                },
                {
                  step: "02",
                  icon: QrCode,
                  title: "Deelnemers ontvangen en verbinden",
                  desc: "QR check-in bij de ingang geeft je realtime inzicht. AI-matchmaking koppelt deelnemers vóór het event aan relevante gesprekspartners. Vrijwilligers weten exact wat ze moeten doen.",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "Impactrapport voor je subsidiegever",
                  desc: "Klik op 'genereer rapport' en Bijeen maakt een complete PDF: opkomst, verbindingen, tevredenheidsscores en WMO-pijlers. Klaar voor je gemeente of subsidieaanvraag.",
                },
              ].map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="relative">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-7 h-full hover:bg-white/8 transition-colors">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[11px] font-extrabold text-terra-400 tracking-widest">
                        {step}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-terra-500/20 flex items-center justify-center text-terra-400">
                        <Icon size={18} strokeWidth={1.75} />
                      </div>
                    </div>
                    <h3 className="font-extrabold text-white mb-3 text-[15px]">{title}</h3>
                    <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-cream" id="vergelijking">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Vergelijking
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
                Bijeen versus de alternatieven
              </h2>
              <p className="text-ink-muted max-w-xl mx-auto">
                Eventbrite is gebouwd voor concerttickets. Google Forms is gebouwd voor enquêtes.
                Bijeen is gebouwd voor jouw welzijnsevenement.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-sand/60 overflow-hidden shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-4 border-b border-sand/60">
                <div className="p-4 sm:p-5">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Functie</span>
                </div>
                {[
                  { label: "Bijeen", highlight: true },
                  { label: "Eventbrite", highlight: false },
                  { label: "Google Forms", highlight: false },
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
              {comparisonRows.map(({ feature, bijeen, eventbrite, forms }, i) => (
                <div
                  key={feature}
                  className={`grid grid-cols-4 border-b last:border-0 border-sand/40 ${i % 2 === 1 ? "bg-cream/40" : ""}`}
                >
                  <div className="p-3.5 sm:p-4 flex items-center">
                    <span className="text-xs sm:text-sm text-ink-muted">{feature}</span>
                  </div>
                  <div className="p-3.5 sm:p-4 border-l border-sand/60 bg-terra-50/50 flex items-center justify-center">
                    <CompareCell val={bijeen} />
                  </div>
                  <div className="p-3.5 sm:p-4 border-l border-sand/60 flex items-center justify-center">
                    <CompareCell val={eventbrite} />
                  </div>
                  <div className="p-3.5 sm:p-4 border-l border-sand/60 flex items-center justify-center">
                    <CompareCell val={forms} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS GRID ───────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Ervaringen
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Wat welzijnsorganisaties zeggen
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <blockquote
                  key={t.name}
                  className="bg-cream rounded-2xl border border-sand/60 p-7 flex flex-col gap-5"
                >
                  <p className="text-ink leading-relaxed italic flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-terra-200 flex items-center justify-center text-terra-700 font-bold text-sm shrink-0">
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">{t.name}</div>
                      <div className="text-xs text-ink-muted">{t.role}</div>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-cream" id="prijzen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Prijzen
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
                Betaalbaar voor elke welzijnsorganisatie
              </h2>
              <p className="text-ink-muted max-w-lg mx-auto">
                Van gratis voor kleine buurtinitiatieven tot volledig uitgerust voor grote welzijnsinstellingen.
                ANBI en WMO-organisaties krijgen 15% Sociaal Tarief.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {plans.map(({ name, price, sub, highlight, badge, features: planFeatures, cta, href }) => (
                <div
                  key={name}
                  className={`rounded-2xl border p-7 flex flex-col relative ${
                    highlight
                      ? "bg-[#12100E] border-terra-500/30 shadow-2xl shadow-terra-500/15"
                      : "bg-white border-sand/60"
                  }`}
                >
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terra-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                      {badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${highlight ? "text-terra-400" : "text-terra-500"}`}>
                      {name}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-extrabold ${highlight ? "text-white" : "text-ink"}`}>
                        {price}
                      </span>
                      <span className={`text-xs ${highlight ? "text-white/40" : "text-ink-muted"}`}>{sub}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-7">
                    {planFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${highlight ? "bg-terra-500/30" : "bg-terra-100"}`}>
                          <Check size={9} className={highlight ? "text-terra-400" : "text-terra-600"} strokeWidth={3} />
                        </div>
                        <span className={`text-sm ${highlight ? "text-white/70" : "text-ink-muted"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className={`w-full inline-flex items-center justify-center gap-2 font-bold px-5 py-3 rounded-xl transition-all duration-150 text-sm ${
                      highlight
                        ? "bg-terra-500 hover:bg-terra-600 text-white shadow-lg shadow-terra-500/30 hover:-translate-y-0.5"
                        : "bg-cream hover:bg-sand border border-sand text-ink hover:border-terra-200"
                    }`}
                  >
                    {highlight && <Zap size={14} className="fill-white" />}
                    {cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-ink-muted mt-8">
              Alle plannen inclusief gratis onboarding en Nederlandse klantenservice.{" "}
              <Link href="/prijzen" className="text-terra-600 hover:underline font-semibold">
                Volledige prijzenpagina bekijken →
              </Link>
            </p>
          </div>
        </section>

        {/* ── INTERNAL LINKS: BLOGS ───────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Blogs */}
              <div>
                <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                  Kennisartikelen
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-6">
                  Meer weten over evenementen in de welzijnssector?
                </h2>
                <div className="space-y-4">
                  {blogLinks.map(({ slug, title, tag, readingTime }) => (
                    <Link
                      key={slug}
                      href={`/blog/${slug}`}
                      className="flex items-start gap-4 p-5 bg-cream rounded-xl border border-sand/60 hover:border-terra-200 hover:shadow-sm transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-terra-50 group-hover:bg-terra-100 flex items-center justify-center text-terra-500 shrink-0 mt-0.5 transition-colors">
                        <FileText size={16} strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-terra-600 uppercase tracking-wider bg-terra-50 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                          <span className="text-[10px] text-ink-muted">{readingTime} min leestijd</span>
                        </div>
                        <p className="text-sm font-semibold text-ink leading-snug group-hover:text-terra-700 transition-colors line-clamp-2">
                          {title}
                        </p>
                      </div>
                      <ArrowRight size={15} className="text-ink/20 group-hover:text-terra-500 transition-colors shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Kennisbank */}
              <div>
                <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                  Kennisbank
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-6">
                  Praktische gidsen voor elke situatie
                </h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {kennisbankLinks.map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 p-4 bg-cream rounded-xl border border-sand/60 hover:border-terra-200 hover:shadow-sm transition-all group"
                    >
                      <span className="text-xl shrink-0">{icon}</span>
                      <span className="text-sm font-semibold text-ink group-hover:text-terra-700 transition-colors leading-tight">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/kennisbank"
                  className="inline-flex items-center gap-2 text-terra-600 font-semibold hover:text-terra-700 transition-colors text-sm"
                >
                  Volledige kennisbank bekijken <ArrowRight size={15} />
                </Link>

                {/* Gratis rapport CTA */}
                <div className="mt-8 bg-terra-50 border border-terra-200/60 rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-terra-100 flex items-center justify-center text-terra-600 shrink-0">
                      <Heart size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-extrabold text-ink mb-1 text-[15px]">
                        Gratis WMO-impactrapport genereren
                      </p>
                      <p className="text-sm text-ink-muted mb-3 leading-relaxed">
                        Geen account nodig. Beantwoord 5 vragen en download een kant-en-klaar rapport voor je gemeente.
                      </p>
                      <Link
                        href="/gratis-impactrapport"
                        className="inline-flex items-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-4 py-2.5 rounded-lg transition-all duration-150 text-sm shadow-md shadow-terra-500/25 hover:-translate-y-0.5"
                      >
                        <Zap size={13} className="fill-white" />
                        Genereer gratis rapport
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-cream" id="faq">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-[11px] font-bold text-terra-500 uppercase tracking-widest mb-3">
                Veelgestelde vragen
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Veelgestelde vragen over evenementen software voor welzijnsorganisaties
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="bg-white rounded-2xl border border-sand/60 p-6 sm:p-7"
                >
                  <h3 className="font-extrabold text-ink mb-3 text-[15px]">{q}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-ink-muted mt-8">
              Meer vragen?{" "}
              <Link href="/faq" className="text-terra-600 hover:underline font-semibold">
                Bekijk alle veelgestelde vragen
              </Link>{" "}
              of{" "}
              <Link href="/demo-aanvragen" className="text-terra-600 hover:underline font-semibold">
                plan een demo
              </Link>.
            </p>
          </div>
        </section>

        {/* ── BOTTOM CTA ──────────────────────────────────────────────── */}
        <section
          className="bg-[#12100E] py-20 sm:py-28 relative overflow-hidden"
          id="demo"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-terra-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-terra-500/20 text-terra-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-6">
              <Handshake size={12} />
              Sociaal Tarief voor ANBI en WMO
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5 leading-tight">
              Klaar om jouw evenementen te transformeren?
              <br />
              <span className="text-terra-400">Start vandaag, gratis.</span>
            </h2>
            <p className="text-white/60 text-lg mb-4 max-w-lg mx-auto leading-relaxed">
              Jouw eerste event is gratis. Geen creditcard, geen verplichtingen.
              ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen
              krijgen 15% korting op alle betaalde plannen.
            </p>
            <p className="text-white/35 text-sm mb-10">
              Voor interim-innovatieadvies (2 à 3 dagen per week):{" "}
              <a
                href="https://www.weareimpact.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-400 hover:text-terra-300 underline transition-colors"
              >
                www.WeAreImpact.nl
              </a>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-terra-500 hover:bg-terra-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-150 shadow-xl shadow-terra-500/30 hover:-translate-y-0.5 text-base"
              >
                <Zap size={16} className="fill-white" />
                Gratis account aanmaken
              </Link>
              <Link
                href="/prijzen"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/10 text-base"
              >
                Bekijk alle prijzen <ArrowRight size={16} />
              </Link>
            </div>
            <p className="text-white/25 text-xs mt-6">
              Gebruikt door welzijnsorganisaties in heel Nederland · AVG-compliant · Nederlandse servers · Sociaal Tarief voor ANBI en WMO
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
