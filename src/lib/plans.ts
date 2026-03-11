// ─── Active tiers ─────────────────────────────────────────────────────────────
export const PLAN_LIMITS = {
  community:   { label: "Community",   events: 2,    attendeesPerEvent: 75,   aiMatching: false },
  welzijn:     { label: "Welzijn",     events: 6,    attendeesPerEvent: 300,  aiMatching: true  },
  netwerk:     { label: "Netwerk",     events: 24,   attendeesPerEvent: 750,  aiMatching: true  },
  organisatie: { label: "Organisatie", events: 9999, attendeesPerEvent: 9999, aiMatching: true  },
  platform:    { label: "Platform",    events: 9999, attendeesPerEvent: 9999, aiMatching: true  },
  // Legacy — backwards compatibility met bestaande DB-records
  trial:       { label: "Proefperiode", events: 1,   attendeesPerEvent: 50,   aiMatching: false },
  starter:     { label: "Starter",      events: 6,   attendeesPerEvent: 150,  aiMatching: true  },
  groei:       { label: "Groei",        events: 20,  attendeesPerEvent: 600,  aiMatching: true  },
} as const;

// Jaarlijkse abonnementsprijzen in centen
export const PLAN_PRICES_CENTS: Record<string, number> = {
  welzijn:     49000,   // €490/jaar
  netwerk:     129000,  // €1.290/jaar
  organisatie: 289000,  // €2.890/jaar
  // Legacy
  starter:     59000,
  groei:       149000,
};

// Per-event prijzen in centen (informatief — niet in DB)
export const PER_EVENT_PRICES_CENTS: Record<string, number> = {
  welzijn: 8900,   // €89
  netwerk: 24900,  // €249
};

export const PLAN_FEATURES: Record<string, string[]> = {
  community: [
    "Eventpagina + inschrijving",
    "QR check-in",
    "Deelnemersexport",
    "Max 2 events/jaar",
    "Max 75 deelnemers per event",
    "Bijeen-branding zichtbaar",
  ],
  welzijn: [
    "6 events per jaar",
    "Max 300 deelnemers per event",
    "Eigen branding (white-label)",
    "E-mailbevestigingen",
    "Live Q&A en polls",
    "AI-netwerkkoppeling",
    "WMO Impactrapportage PDF",
    "Betaalde tickets mogelijk",
  ],
  netwerk: [
    "24 events per jaar",
    "Max 750 deelnemers per event",
    "Hybride / streaming",
    "Parallelle sessies",
    "WMO-verantwoordingsexport",
    "Prioriteit support",
    "Alles uit Welzijn",
  ],
  organisatie: [
    "Onbeperkte events",
    "Onbeperkte deelnemers",
    "Custom integraties",
    "Dedicated accountmanager",
    "API-toegang",
    "Co-branding partners",
    "Alles uit Netwerk",
  ],
  platform: [
    "Alles uit Organisatie",
    "SLA-garantie",
    "Gemeente / koepel contract",
    "Volume-korting",
    "Maatwerk implementatie",
  ],
  // Legacy
  trial:   ["1 evenement", "Max 50 deelnemers", "14 dagen gratis"],
  starter: ["6 evenementen/jaar", "150 deelnemers per event", "AI-netwerk matching", "Live Q&A & polls"],
  groei:   ["20 evenementen/jaar", "600 deelnemers per event", "AI-netwerk matching", "Subsidie rapportage", "Prioriteit support"],
};

// Free plans (geen betaling nodig bij onboarding)
export const FREE_PLANS = new Set(["community", "trial"]);

export type PlanKey = keyof typeof PLAN_LIMITS;
