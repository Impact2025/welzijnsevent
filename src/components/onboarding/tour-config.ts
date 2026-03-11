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
      "We laten je in een minuutje zien hoe alles werkt. Je kunt de tour altijd overslaan of later opnieuw starten.",
    position: "bottom",
  },
  {
    id: "new-event",
    target: "[data-tour='new-event']",
    title: "Maak je eerste evenement",
    description:
      "Begin hier. Kies een template — vrijwilligersdag, netwerkbijeenkomst, congres — en je bent in 5 minuten live.",
    position: "right",
  },
  {
    id: "nav",
    target: "[data-tour='nav']",
    title: "Alles op één plek",
    description:
      "Overzicht, al je evenementen en instellingen vind je hier. Pas je huisstijl, domein en abonnement aan bij Instellingen.",
    position: "right",
  },
  {
    id: "kpi",
    target: "[data-tour='kpi']",
    title: "Jouw impact in één oogopslag",
    description:
      "Registraties, tevredenheidsscore en sessies — automatisch bijgehouden. Altijd klaar voor je subsidieaanvraag.",
    position: "bottom",
  },
  {
    id: "events-list",
    target: "[data-tour='events-list']",
    title: "Live beheren & AI-koppeling",
    description:
      "Open een event voor QR check-in, live polls en Q&A. Na afloop genereert AI automatisch de beste netwerkmatches.",
    position: "top",
  },
  {
    id: "finish",
    target: null,
    title: "Je bent er klaar voor! 🎉",
    description:
      "Maak je eerste evenement aan en ontdek al het andere terwijl je bezig bent. Succes!",
    position: "bottom",
  },
];
