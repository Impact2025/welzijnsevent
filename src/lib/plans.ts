export const PLAN_LIMITS = {
  trial: {
    label: "Proefperiode",
    events: 1,
    attendeesPerEvent: 50,
    aiMatching: false,
    trialDays: 14,
  },
  starter: {
    label: "Starter",
    events: 6,
    attendeesPerEvent: 150,
    aiMatching: true,
    trialDays: 0,
  },
  groei: {
    label: "Groei",
    events: 20,
    attendeesPerEvent: 600,
    aiMatching: true,
    trialDays: 0,
  },
  organisatie: {
    label: "Organisatie",
    events: 9999,
    attendeesPerEvent: 9999,
    aiMatching: true,
    trialDays: 0,
  },
} as const;

export const PLAN_PRICES_CENTS: Record<string, number> = {
  starter:     59000,  // €590/jaar
  groei:       149000, // €1.490/jaar
  organisatie: 349000, // €3.490/jaar
};

export const PLAN_FEATURES: Record<string, string[]> = {
  trial:       ["1 evenement", "Max 50 deelnemers", "14 dagen gratis"],
  starter:     ["6 evenementen/jaar", "150 deelnemers per event", "AI-netwerk matching", "Live Q&A & polls"],
  groei:       ["20 evenementen/jaar", "600 deelnemers per event", "AI-netwerk matching", "Subsidie rapportage", "Prioriteit support"],
  organisatie: ["Onbeperkte evenementen", "Onbeperkte deelnemers", "White-label", "API toegang", "Dedicated support"],
};

export type PlanKey = keyof typeof PLAN_LIMITS;
