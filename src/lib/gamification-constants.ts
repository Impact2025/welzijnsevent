// Client-safe constants — no server-only imports

export const ACTIONS = {
  CHECKIN:              { key: "checkin",              points: 50 },
  QA_QUESTION:          { key: "qa_question",          points: 15 },
  NETWORK_MATCH_ACCEPT: { key: "network_match_accept", points: 30 },
  SURVEY_COMPLETE:      { key: "survey_complete",      points: 25 },
} as const;

export type ActionKey = (typeof ACTIONS)[keyof typeof ACTIONS]["key"];

export const BADGES = [
  {
    id:        "aanwezig",
    name:      "Aanwezig",
    icon:      "🎯",
    desc:      "Ingecheckt bij het event",
    condition: { type: "action_count" as const, action: "checkin", count: 1 },
  },
  {
    id:        "vraagsteller",
    name:      "Vraagsteller",
    icon:      "💬",
    desc:      "Een vraag gesteld via Q&A",
    condition: { type: "action_count" as const, action: "qa_question", count: 1 },
  },
  {
    id:        "netwerker",
    name:      "Netwerker",
    icon:      "🤝",
    desc:      "Een match geaccepteerd",
    condition: { type: "action_count" as const, action: "network_match_accept", count: 1 },
  },
  {
    id:        "actief",
    name:      "Actief Deelnemer",
    icon:      "⭐",
    desc:      "100 punten verdiend",
    condition: { type: "points_total" as const, threshold: 100 },
  },
  {
    id:        "super_netwerker",
    name:      "Super Netwerker",
    icon:      "🏆",
    desc:      "3 matches geaccepteerd",
    condition: { type: "action_count" as const, action: "network_match_accept", count: 3 },
  },
  {
    id:        "betrokken",
    name:      "Betrokken",
    icon:      "🔥",
    desc:      "200 punten verdiend",
    condition: { type: "points_total" as const, threshold: 200 },
  },
] as const;

export type Badge = (typeof BADGES)[number];
