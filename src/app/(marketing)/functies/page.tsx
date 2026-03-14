import Link from "next/link";
import {
  ArrowRight, Zap, ClipboardList, QrCode, Network,
  MessageSquareMore, BarChart3, Smartphone, Mic,
  BarChart2, Share2, Download, Calendar, Mail, Globe,
  Check, X, Users, Clock, TrendingUp, Shield,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Functies — Bijeen",
  description: "Alles wat je nodig hebt voor wereldklasse evenementen in de welzijnssector.",
};

/* ─── Mockup: Event card preview ──────────────────────────────── */
function EventCardMockup() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-sand/60 overflow-hidden w-full max-w-sm">
      <div className="h-2 bg-gradient-to-r from-terra-400 to-terra-600" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-3 w-32 bg-ink/10 rounded-full mb-2" />
            <div className="h-2 w-20 bg-ink/6 rounded-full" />
          </div>
          <div className="w-9 h-9 rounded-lg bg-terra-50 flex items-center justify-center">
            <Calendar size={16} className="text-terra-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {["48 aangemeld", "3 wachtlijst", "2 sessies"].map((s) => (
            <div key={s} className="bg-cream rounded-lg p-2 text-center">
              <div className="h-2 w-full bg-terra-200 rounded mb-1" />
              <div className="text-[9px] text-ink-muted font-medium">{s}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {["Anna de Vries", "Mohammed El Ouali", "Liselotte Bakker"].map((name, i) => (
            <div key={name} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ background: ["#C8522A", "#2D5A3D", "#7C6B5A"][i] }}
              >
                {name[0]}
              </div>
              <div className="flex-1">
                <div className="h-2 w-24 bg-ink/10 rounded mb-1" />
                <div className="h-1.5 w-16 bg-ink/6 rounded" />
              </div>
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={9} className="text-green-600" strokeWidth={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-sand/60 px-5 py-3 flex items-center justify-between bg-cream/50">
        <span className="text-[10px] text-ink-muted font-medium">Live dashboard</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-600 font-bold">Live</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: QR Check-in ─────────────────────────────────────── */
function QrMockup() {
  return (
    <div className="bg-[#12100E] rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs border border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-terra-400" />
        <span className="text-white/60 text-xs font-medium">Bijeen · QR Scan</span>
      </div>
      <div className="p-6 text-center">
        <div className="w-32 h-32 mx-auto bg-white rounded-xl mb-5 grid grid-cols-5 grid-rows-5 gap-0.5 p-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                background: [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,8,16,18,11,13].includes(i)
                  ? "#12100E"
                  : "transparent",
              }}
            />
          ))}
        </div>
        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold mb-3">
          <Check size={12} strokeWidth={3} />
          Ingecheckt!
        </div>
        <p className="text-white/50 text-[11px]">Anna de Vries — Bijeen Netwerkevent</p>
      </div>
    </div>
  );
}

/* ─── Mockup: Impact rapport ──────────────────────────────────── */
function ReportMockup() {
  const bars = [72, 88, 65, 95, 80, 91];
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-sand/60 overflow-hidden w-full max-w-sm">
      <div className="p-5 border-b border-sand/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-ink">Impactrapport — Mrt 2026</span>
          <div className="flex items-center gap-1 text-terra-500">
            <TrendingUp size={12} />
            <span className="text-[10px] font-bold">+23%</span>
          </div>
        </div>
        <div className="text-[10px] text-ink-muted">Netwerkevent Welzijn Noord-Holland</div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Opkomst", val: "94%" },
            { label: "Tevredenheid", val: "8.7" },
            { label: "Matches", val: "47" },
            { label: "Sessies", val: "6" },
          ].map(({ label, val }) => (
            <div key={label} className="bg-cream rounded-xl p-3">
              <div className="text-xl font-extrabold text-terra-500 leading-none mb-0.5">{val}</div>
              <div className="text-[10px] text-ink-muted">{label}</div>
            </div>
          ))}
        </div>
        <div className="mb-2">
          <div className="text-[10px] text-ink-muted font-medium mb-2">Sessie-engagement</div>
          <div className="flex items-end gap-1 h-14">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: i === 3 ? "#C8522A" : "#FAF6F0",
                  border: "1px solid #F0E8DC",
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-sand/40 px-5 py-3 flex items-center justify-between">
        <span className="text-[10px] text-ink-muted">Subsidie-export</span>
        <div className="flex items-center gap-1 text-terra-500">
          <Download size={10} />
          <span className="text-[10px] font-bold">PDF</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup: Live Q&A ────────────────────────────────────────── */
function QaMockup() {
  const questions = [
    { q: "Hoe borg je de AVG bij AI-matching?", votes: 14, approved: true },
    { q: "Is er ook een app voor de spreker?", votes: 9, approved: true },
    { q: "Kan ik de wachtlijst handmatig beheren?", votes: 6, approved: false },
  ];
  return (
    <div className="bg-[#12100E] rounded-2xl shadow-2xl border border-white/10 overflow-hidden w-full max-w-sm">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/70 text-xs font-bold">Live Q&amp;A · 23 vragen</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400 font-bold">LIVE</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {questions.map(({ q, votes, approved }) => (
          <div
            key={q}
            className={`rounded-xl p-3 border ${
              approved
                ? "border-terra-500/30 bg-terra-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <p className="text-white/80 text-[11px] leading-relaxed mb-2">{q}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/40">
                <span className="text-[10px]">▲ {votes}</span>
              </div>
              {approved ? (
                <span className="text-[9px] font-bold text-terra-400 uppercase tracking-wider">
                  Goedgekeurd
                </span>
              ) : (
                <span className="text-[9px] text-white/30">In wachtrij</span>
              )}
            </div>
          </div>
        ))}
      </div>
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

          {/* Hero visual — floating UI cards */}
          <div className="flex items-end gap-4 overflow-hidden pb-0">
            <div className="hidden lg:block translate-y-6 opacity-90">
              <QrMockup />
            </div>
            <div className="translate-y-6 opacity-95 mx-auto lg:mx-0">
              <EventCardMockup />
            </div>
            <div className="hidden lg:block translate-y-6 opacity-90">
              <ReportMockup />
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
                {/* Registration form mockup */}
                <div className="w-full max-w-xs">
                  <div className="bg-white rounded-2xl shadow-lg border border-sand/60 p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-8 h-8 rounded-lg bg-terra-500 flex items-center justify-center">
                        <Calendar size={14} className="text-white" />
                      </div>
                      <div>
                        <div className="h-2.5 w-28 bg-ink/15 rounded-full" />
                        <div className="h-2 w-20 bg-ink/8 rounded-full mt-1" />
                      </div>
                    </div>
                    {["Naam", "Organisatie", "Functie"].map((label) => (
                      <div key={label} className="mb-3">
                        <div className="text-[10px] text-ink-muted font-medium mb-1">{label}</div>
                        <div className="h-8 bg-cream border border-sand rounded-lg" />
                      </div>
                    ))}
                    <div className="mb-4">
                      <div className="text-[10px] text-ink-muted font-medium mb-1">Sessiekeuze</div>
                      {["Keynote · 9:00", "Workshop A · 10:30", "Workshop B · 10:30"].map((s, i) => (
                        <div key={s} className="flex items-center gap-2 mb-1.5">
                          <div className={`w-3.5 h-3.5 rounded border-2 ${i === 0 || i === 1 ? "border-terra-500 bg-terra-500" : "border-sand"}`} />
                          <span className="text-[10px] text-ink-muted">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-terra-500 rounded-lg h-9 flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold">Inschrijven →</span>
                    </div>
                  </div>
                </div>
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
                <QrMockup />
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
                <QaMockup />
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

              {/* Network visualization mockup */}
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Center node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-terra-500 border-4 border-terra-400/50 flex items-center justify-center z-10 shadow-lg shadow-terra-500/40">
                    <Network size={22} className="text-white" />
                  </div>
                  {/* Surrounding nodes */}
                  {[
                    { top: "8%", left: "50%", label: "Fatima", color: "#C8522A" },
                    { top: "30%", left: "85%", label: "Pieter", color: "#2D5A3D" },
                    { top: "72%", left: "85%", label: "Nadia", color: "#7C6B5A" },
                    { top: "90%", left: "50%", label: "Ahmed", color: "#C8522A" },
                    { top: "72%", left: "15%", label: "Lisa", color: "#2D5A3D" },
                    { top: "30%", left: "15%", label: "Bart", color: "#7C6B5A" },
                  ].map(({ top, left, label, color }) => (
                    <div
                      key={label}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ top, left }}
                    >
                      {/* Connection line (simplified via background) */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2"
                        style={{ background: color, borderColor: `${color}60` }}
                      >
                        {label[0]}
                      </div>
                    </div>
                  ))}
                  {/* Connecting lines via SVG */}
                  <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                    {[
                      [128, 128, 128, 21],
                      [128, 128, 217, 77],
                      [128, 128, 217, 184],
                      [128, 128, 128, 230],
                      [128, 128, 38, 184],
                      [128, 128, 38, 77],
                    ].map(([x1, y1, x2, y2], i) => (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="#C8522A"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    ))}
                  </svg>
                </div>
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
                <ReportMockup />
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
