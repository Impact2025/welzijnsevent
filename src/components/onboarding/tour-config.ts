export type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  /** CSS selector using data-tour attribute, or null for a centred modal step */
  target: string | null;
  title: string;
  description: string;
  position?: TourPosition;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Welkom bij Bijeen! 👋",
    description:
      "Je bent er bijna. In 6 korte stappen laten we je zien hoe je evenementen organiseert, deelnemers beheert en live polls en Q&A inzet. Duurt minder dan 2 minuten.",
    position: "bottom",
  },
  {
    id: "new-event",
    target: "[data-tour='new-event']",
    title: "Maak je eerste evenement",
    description:
      "Klik hier om te starten. Kies een naam, datum en locatie — je event staat in 5 minuten online met een eigen aanmeldpagina en QR check-in.",
    position: "right",
  },
  {
    id: "nav",
    target: "[data-tour='nav']",
    title: "Alles binnen handbereik",
    description:
      "Via Overzicht zie je je KPI's, via Evenementen beheer je registraties en sessies, en bij Instellingen pas je logo, domein en abonnement aan.",
    position: "right",
  },
  {
    id: "kpi",
    target: "[data-tour='kpi']",
    title: "Jouw impact in cijfers",
    description:
      "Registraties, gemiddelde tevredenheidsscore en sessieaantallen worden automatisch bijgehouden. Altijd klaar voor je subsidieaanvraag of jaarverslag.",
    position: "bottom",
  },
  {
    id: "events-list",
    target: "[data-tour='events-list']",
    title: "Live beheren & slimme koppelingen",
    description:
      "Open een event voor realtime QR check-in, live polls en Q&A. Na afloop genereert AI automatisch de beste netwerkmatches tussen deelnemers.",
    position: "top",
  },
  {
    id: "finish",
    target: null,
    title: "Je bent helemaal klaar! 🎉",
    description:
      "Maak je eerste evenement aan en ontdek al het andere onderweg. Heb je hulp nodig? Klik op het ? icoon of stuur ons een bericht. Succes!",
    position: "bottom",
  },
];
