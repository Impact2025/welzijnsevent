export type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  /** CSS selector for desktop, or null for a centred modal step */
  target: string | null;
  /** Overrides target on screens narrower than md (768 px). Omit = use target. null = no spotlight. */
  targetMobile?: string | null;
  title: string;
  description: string;
  position?: TourPosition;
  /** Renders a 440px wide balloon instead of 360px — use for welcome/finish steps */
  wide?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    targetMobile: null,
    title: "Welkom bij Bijeen 🌟",
    description:
      "Het complete evenementplatform voor welzijnsorganisaties. Alles wat je nodig hebt — op één plek.",
    position: "bottom",
    wide: true,
  },
  {
    id: "new-event",
    target: "[data-tour='new-event']",
    targetMobile: "[data-tour='new-event-mobile']",
    title: "Maak je eerste evenement",
    description:
      "Klik hier om te starten. Kies een naam, datum en locatie — je event staat in 5 minuten online met een eigen aanmeldpagina, betaalde tickets en QR check-in.",
    position: "right",
  },
  {
    id: "search",
    target: "[data-tour='search']",
    title: "Razendsnel navigeren",
    description:
      "Druk ⌘K (of Ctrl+K) om de commandpalette te openen. Spring direct naar events, zoek deelnemers of voer acties uit — zonder één klik te verliezen.",
    position: "right",
  },
  {
    id: "nav",
    target: "[data-tour='nav']",
    targetMobile: "[data-tour='nav-mobile']",
    title: "Jouw command center",
    description:
      "Via Overzicht zie je live KPI's. Evenementen beheert al je registraties en sessies. Vrijwilligers en Contacten verschijnen automatisch zodra je ze aanmaakt.",
    position: "right",
  },
  {
    id: "kpi",
    target: "[data-tour='kpi']",
    title: "Impact in één oogopslag",
    description:
      "Registraties, gemiddelde tevredenheidsscore en sessieaantallen worden automatisch bijgehouden. Altijd klaar voor subsidieaanvragen en jaarverslagen.",
    position: "bottom",
  },
  {
    id: "ai-panel",
    target: "[data-tour='ai-panel']",
    title: "Je persoonlijke AI Assistent",
    description:
      "Stel vragen over je data, laat uitnodigingen schrijven of vraag om inzichten. Je slimme evenementenassistent — altijd beschikbaar, altijd accuraat.",
    position: "top",
  },
  {
    id: "events-list",
    target: "[data-tour='events-list']",
    title: "Alles voor je events",
    description:
      "Klik op een event voor de volledige toolkit: deelnemers, sessies, sprekers, sponsors, tickets, live modus met QR-scanner, polls, Q&A en AI netwerkkoppeling.",
    position: "top",
  },
  {
    id: "live-features",
    target: null,
    targetMobile: null,
    title: "Live modus & realtime tools",
    description:
      "Tijdens je event draai je live polls, modereer je Q&A-vragen en scan je QR-tickets — alles vanuit één scherm. Na afloop koppelt AI automatisch de beste netwerkmatches tussen deelnemers.",
    position: "bottom",
  },
  {
    id: "settings",
    target: "[data-tour='settings']",
    title: "Maak het van jou",
    description:
      "Upload je logo, stel een eigen domeinnaam in, voeg teamleden toe en beheer je abonnement. Bijeen past zich volledig aan jouw organisatie aan.",
    position: "right",
  },
  {
    id: "finish",
    target: null,
    targetMobile: null,
    title: "Je bent er klaar voor! 🚀",
    description:
      "Maak je eerste evenement aan en ontdek alle functies onderweg. Heb je hulp nodig? Check de kennisbank of stuur ons een bericht — we helpen graag.",
    position: "bottom",
    wide: true,
  },
];
