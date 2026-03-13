/**
 * Seed: Valtijnsevent — volledig event voor v.munster@weareimpact.nl
 * Gebruik: npx tsx src/db/seed-valtijnsevent.ts
 */
import { db } from "./index";
import {
  authUsers, organizations, events, sessions, attendees,
  sessionRegistrations, polls, qaMessages, feedback, networkMatches, waitlist,
} from "./schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const USER_EMAIL = "v.munster@weareimpact.nl";

const EVENT_DATE = "2026-02-14";

async function run() {
  console.log("🌹 Seeding Valtijnsevent...\n");

  // ── 1. Vind of maak de user ─────────────────────────────────────────────────
  let [user] = await db.select().from(authUsers).where(eq(authUsers.email, USER_EMAIL));
  if (!user) {
    [user] = await db.insert(authUsers).values({
      email: USER_EMAIL,
      name:  "V. Munster",
    }).returning();
    console.log("✅ User aangemaakt:", user.email);
  } else {
    console.log("✅ User gevonden:", user.email);
  }

  // ── 2. Vind of maak de organisatie ─────────────────────────────────────────
  let [org] = await db.select().from(organizations).where(eq(organizations.userId, user.id));
  if (!org) {
    [org] = await db.insert(organizations).values({
      name:         "We Are Impact",
      slug:         "we-are-impact",
      primaryColor: "#C8522A",
      logo:         null,
      userId:       user.id,
    }).returning();
    console.log("✅ Organisatie aangemaakt:", org.name);
  } else {
    console.log("✅ Organisatie gevonden:", org.name);
  }

  // ── 3. Maak het event ───────────────────────────────────────────────────────
  const [event] = await db.insert(events).values({
    organizationId: org.id,
    title:          "Valtijnsevent",
    tagline:        "Verbinding, liefde voor het vak & impact samen",
    description:    "Het Valtijnsevent is een jaarlijkse bijeenkomst waar welzijnsprofessionals, vrijwilligers en beleidsmakers samenkomen om verbinding te maken, kennis te delen en met hernieuwde energie impact te maken in hun buurt. Op Valentijnsdag staat niet romantiek, maar vakliefde centraal.",
    location:       "Impact Hub Amsterdam",
    address:        "Wibautstraat 150, 1091 GR Amsterdam",
    coverImage:     null,
    startsAt:       new Date(`${EVENT_DATE}T09:30:00`),
    endsAt:         new Date(`${EVENT_DATE}T17:00:00`),
    status:         "live",
    maxAttendees:   25,
    waitlistEnabled: true,
    slug:           "valtijnsevent-2026",
    isPublic:       true,
    websiteColor:   "#C8522A",
    surveyEnabled:  true,
  }).returning();
  console.log("✅ Event aangemaakt:", event.title, `(id: ${event.id})`);

  // ── 4. Sessies ───────────────────────────────────────────────────────────────
  const sessionData = [
    {
      eventId:     event.id,
      title:       "Inloop & Welkom",
      description: "Koffie, thee en hartelijke ontvangst. Maak kennis met de andere deelnemers.",
      location:    "Entreehal",
      startsAt:    new Date(`${EVENT_DATE}T09:30:00`),
      endsAt:      new Date(`${EVENT_DATE}T10:00:00`),
      sortOrder:   1,
    },
    {
      eventId:      event.id,
      title:        "Openingsspeech: Liefde voor je Vak",
      description:  "Keynote over wat ons drijft in het welzijnswerk — en hoe je die vlam brandend houdt.",
      speaker:      "Vera Munster",
      speakerOrg:   "We Are Impact",
      location:     "Grote Zaal",
      startsAt:     new Date(`${EVENT_DATE}T10:00:00`),
      endsAt:       new Date(`${EVENT_DATE}T10:45:00`),
      isLive:       true,
      capacity:     25,
      sortOrder:    2,
    },
    {
      eventId:     event.id,
      title:       "Workshop: Verbindend Samenwerken",
      description: "Praktische oefeningen om samenwerking in je team te versterken. Met echte casuïstiek uit de welzijnssector.",
      speaker:     "Lotte van den Berg",
      speakerOrg:  "Movisie",
      location:    "Studio Rood",
      startsAt:    new Date(`${EVENT_DATE}T11:00:00`),
      endsAt:      new Date(`${EVENT_DATE}T12:15:00`),
      capacity:    15,
      sortOrder:   3,
    },
    {
      eventId:     event.id,
      title:       "Workshop: Impact Meten in de Praktijk",
      description: "Hoe meet je maatschappelijke impact zonder je ziel te verkopen aan de spreadsheet? Concrete methodes en tooling.",
      speaker:     "Daan Kroeze",
      speakerOrg:  "Labyrinth Onderzoek",
      location:    "Studio Groen",
      startsAt:    new Date(`${EVENT_DATE}T11:00:00`),
      endsAt:      new Date(`${EVENT_DATE}T12:15:00`),
      capacity:    12,
      sortOrder:   4,
    },
    {
      eventId:     event.id,
      title:       "Netwerklunch met Speed Dates",
      description: "Valentijnsthema lunch: zit aan tafel bij iemand die je nog niet kent. Twee rondes van 15 minuten.",
      location:    "Grand Café",
      startsAt:    new Date(`${EVENT_DATE}T12:30:00`),
      endsAt:      new Date(`${EVENT_DATE}T13:30:00`),
      sortOrder:   5,
    },
    {
      eventId:     event.id,
      title:       "Panelgesprek: De Toekomst van Welzijnswerk",
      description: "Vier experts bespreken: wat zijn de grootste kansen en bedreigingen voor de sector in de komende 5 jaar?",
      speaker:     "Moderator: Ahmed El Fassi",
      speakerOrg:  "Sociaal Werk NL",
      location:    "Grote Zaal",
      startsAt:    new Date(`${EVENT_DATE}T13:45:00`),
      endsAt:      new Date(`${EVENT_DATE}T15:00:00`),
      isLive:      false,
      capacity:    25,
      sortOrder:   6,
    },
    {
      eventId:     event.id,
      title:       "Breakout: Mijn Project in 3 Minuten",
      description: "Deelnemers pitchen hun eigen initiatief of project. Voordeel: direct feedback en potentiële samenwerkingspartners.",
      location:    "Studio Rood",
      startsAt:    new Date(`${EVENT_DATE}T15:15:00`),
      endsAt:      new Date(`${EVENT_DATE}T16:15:00`),
      capacity:    20,
      sortOrder:   7,
    },
    {
      eventId:     event.id,
      title:       "Afsluiting & Valentijnsborrel",
      description: "We sluiten af met een toast op verbinding, liefde voor het vak én lekker borrelen.",
      location:    "Grand Café",
      startsAt:    new Date(`${EVENT_DATE}T16:15:00`),
      endsAt:      new Date(`${EVENT_DATE}T17:00:00`),
      sortOrder:   8,
    },
  ];

  const createdSessions = await db.insert(sessions).values(sessionData).returning();
  console.log("✅ Sessies:", createdSessions.length);

  // ── 5. Deelnemers (20 personen) ─────────────────────────────────────────────
  const attendeeData = [
    { name: "Sophie van Dijk",       email: "sophie@buurtwerk.nl",      organization: "Buurtwerk Amsterdam",        role: "Community Manager",    status: "ingecheckt", notes: "Geïnteresseerd in pitch-slot" },
    { name: "Roel Hermans",          email: "roel@vluchtelingenwerk.nl", organization: "Vluchtelingenwerk NL",        role: "Programmacoördinator", status: "ingecheckt", notes: null },
    { name: "Nadia Benali",          email: "nadia@gemeente-adam.nl",    organization: "Gemeente Amsterdam",          role: "Beleidsadviseur",      status: "ingecheckt", notes: "Wil napraten over subsidietraject" },
    { name: "Tim de Boer",           email: "tim@participatie.nl",       organization: "Participatiebureau",          role: "Adviseur",             status: "ingecheckt", notes: null },
    { name: "Yasmin El Hadji",       email: "yasmin@mee-nhn.nl",         organization: "MEE Noord-Holland Noord",     role: "Trajectbegeleider",    status: "ingecheckt", notes: null },
    { name: "Koen Verbeek",          email: "koen@humanitas.nl",         organization: "Humanitas",                   role: "Vrijwilligerscoördinator", status: "ingecheckt", notes: "Al 3 jaar trouw bezoeker" },
    { name: "Fatima Ouali",          email: "fatima@sociaalwerk.nl",     organization: "Sociaal Werk Nederland",      role: "Beleidsmedewerker",    status: "aangemeld",  notes: null },
    { name: "Lars Timmermans",       email: "lars@burennetwerk.nl",      organization: "Burennetwerk",                role: "Directeur",            status: "aangemeld",  notes: "Wil spreken in volgende editie" },
    { name: "Iris Smit",             email: "iris@jongerencentrum.nl",   organization: "Jongerencentrum De Luwte",    role: "Jongerenwerker",       status: "aangemeld",  notes: null },
    { name: "Mehmet Yildiz",         email: "mehmet@buurtzorg.nl",       organization: "Buurtzorg",                   role: "Wijkverpleegkundige",  status: "aangemeld",  notes: null },
    { name: "Eva Janssen",           email: "eva@zorgcooperatie.nl",     organization: "Zorgcoöperatie West",         role: "Coördinator Zorg",     status: "aangemeld",  notes: null },
    { name: "Bram de Haan",          email: "bram@vrijwilligerspunt.nl", organization: "Vrijwilligerspunt Utrecht",   role: "Consulent",            status: "aangemeld",  notes: null },
    { name: "Layla Hassan",          email: "layla@stichtingkans.nl",    organization: "Stichting Kans",              role: "Projectleider",        status: "aangemeld",  notes: null },
    { name: "Pieter Bosch",          email: "pieter@cliëntenraad.nl",    organization: "Cliëntenraad Amsterdam",      role: "Voorzitter",           status: "aangemeld",  notes: null },
    { name: "Marleen de Waal",       email: "marleen@opbouwwerk.nl",     organization: "Opbouwwerk Noord",            role: "Opbouwwerker",         status: "aangemeld",  notes: null },
    { name: "Daniël Kok",            email: "daniel@diversiteitlab.nl",  organization: "Diversiteitslab",             role: "Trainer",              status: "aangemeld",  notes: null },
    { name: "Ingrid Pol",            email: "ingrid@kbo-ned.nl",         organization: "KBO-Nederland",               role: "Bestuurslid",          status: "aangemeld",  notes: null },
    { name: "Samir El Boudali",      email: "samir@actieve-senioren.nl", organization: "Actieve Senioren",            role: "Programmacoördinator", status: "aangemeld",  notes: null },
    { name: "Charlotte van Rijn",    email: "charlotte@impactfund.nl",   organization: "Impact Fund NL",              role: "Fund Manager",         status: "aangemeld",  notes: "Mogelijk sponsormogelijkheden" },
    { name: "Vera Munster",          email: USER_EMAIL,                  organization: "We Are Impact",               role: "Organisator",          status: "ingecheckt", notes: "Organisator van het event" },
  ].map(a => ({
    ...a,
    eventId:        event.id,
    interests:      ["impact", "netwerken", "welzijnswerk", "samenwerken"],
    networkingOptIn: true,
    qrCode:         randomUUID(),
  }));

  const createdAttendees = await db.insert(attendees).values(attendeeData).returning();
  console.log("✅ Deelnemers:", createdAttendees.length);

  // ── 6. Sessie-inschrijvingen ─────────────────────────────────────────────────
  const workshop1 = createdSessions.find(s => s.title.includes("Verbindend"));
  const workshop2 = createdSessions.find(s => s.title.includes("Impact Meten"));
  const panel     = createdSessions.find(s => s.title.includes("Panelgesprek"));
  const breakout  = createdSessions.find(s => s.title.includes("Breakout"));

  if (workshop1 && workshop2 && panel && breakout) {
    const regs: { sessionId: string; attendeeId: string }[] = [];
    // Eerste 12 naar workshop 1, rest naar workshop 2
    createdAttendees.slice(0, 12).forEach(a => regs.push({ sessionId: workshop1.id, attendeeId: a.id }));
    createdAttendees.slice(12).forEach(a  => regs.push({ sessionId: workshop2.id, attendeeId: a.id }));
    // Iedereen naar panel + breakout
    createdAttendees.forEach(a => {
      regs.push({ sessionId: panel.id,    attendeeId: a.id });
      regs.push({ sessionId: breakout.id, attendeeId: a.id });
    });
    await db.insert(sessionRegistrations).values(regs);
    console.log("✅ Sessie-inschrijvingen:", regs.length);
  }

  // ── 7. Polls ─────────────────────────────────────────────────────────────────
  const liveSession = createdSessions.find(s => s.isLive);
  if (liveSession) {
    await db.insert(polls).values([
      {
        eventId:   event.id,
        sessionId: liveSession.id,
        question:  "Wat motiveert jou het meest in je werk?",
        options: [
          { id: "1", label: "Mensen blij maken",            votes: 8 },
          { id: "2", label: "Zichtbare maatschappelijke impact", votes: 6 },
          { id: "3", label: "Samenwerken met gedreven collega's", votes: 4 },
          { id: "4", label: "Persoonlijke groei",            votes: 2 },
        ],
        isActive: true,
      },
      {
        eventId:   event.id,
        sessionId: liveSession.id,
        question:  "Welk thema verdient meer aandacht in de sector?",
        options: [
          { id: "1", label: "Mentale gezondheid werkers",   votes: 9 },
          { id: "2", label: "Digitale hulpverlening",       votes: 5 },
          { id: "3", label: "Samenwerking gemeente/org",    votes: 4 },
          { id: "4", label: "Vrijwilligerstekort",          votes: 2 },
        ],
        isActive: false,
      },
    ]);
    console.log("✅ Polls aangemaakt");
  }

  // ── 8. Q&A berichten ─────────────────────────────────────────────────────────
  if (liveSession) {
    await db.insert(qaMessages).values([
      {
        eventId:    event.id,
        sessionId:  liveSession.id,
        authorName: "Sophie van Dijk",
        content:    "Hoe houd je je bevlogenheid vast na 10 jaar in de sector?",
        isAnonymous: false,
        status:     "goedgekeurd",
        upvotes:    7,
      },
      {
        eventId:    event.id,
        sessionId:  liveSession.id,
        authorName: null,
        content:    "Wat is jullie ervaring met AI-tools voor cliëntencontact?",
        isAnonymous: true,
        status:     "goedgekeurd",
        upvotes:    5,
      },
      {
        eventId:    event.id,
        sessionId:  liveSession.id,
        authorName: "Lars Timmermans",
        content:    "Wanneer is er een volgende editie van het Valtijnsevent?",
        isAnonymous: false,
        status:     "nieuw",
        upvotes:    3,
      },
      {
        eventId:    event.id,
        sessionId:  liveSession.id,
        authorName: null,
        content:    "Zijn de slides straks beschikbaar?",
        isAnonymous: true,
        status:     "nieuw",
        upvotes:    2,
      },
    ]);
    console.log("✅ Q&A berichten aangemaakt");
  }

  // ── 9. Feedback (voor sessies die 'voorbij' zijn) ────────────────────────────
  const feedbackSessions = createdSessions.filter(s =>
    s.title.includes("Inloop") || s.title.includes("Opening") || s.title.includes("Netwerklunch")
  );
  const feedbackRows: {
    eventId: string; sessionId: string; attendeeId: string; rating: number; comment: string | null;
  }[] = [];
  const comments = [
    "Heel inspirerend, kom zeker terug volgend jaar!",
    "Goed georganiseerd, fijn dat er ook informele momenten waren.",
    "De spreker was geweldig — concrete tips die ik meteen kan toepassen.",
    null,
    "Interessant maar de zaal was wat warm.",
    "Top! Goede mix van theorie en praktijk.",
    null,
    "Fijn netwerk hier. Meteen twee nieuwe samenwerkingspartners gesproken.",
  ];

  for (const session of feedbackSessions) {
    for (let i = 0; i < 14; i++) {
      const a = createdAttendees[i];
      feedbackRows.push({
        eventId:   event.id,
        sessionId: session.id,
        attendeeId: a.id,
        rating:    Math.round((3.5 + Math.random() * 1.5) * 2) / 2,
        comment:   comments[i % comments.length],
      });
    }
  }
  await db.insert(feedback).values(feedbackRows);
  console.log("✅ Feedback:", feedbackRows.length, "ratings");

  // ── 10. Netwerk-matches ──────────────────────────────────────────────────────
  const matchPairs: { a: number; b: number; score: number; reason: string; status: string }[] = [
    { a: 0,  b: 19, score: 0.94, reason: "Beide gericht op community building en maatschappelijke impact", status: "accepted" },
    { a: 1,  b: 12, score: 0.91, reason: "Gedeelde focus op kwetsbare doelgroepen en trajectbegeleiding",  status: "accepted" },
    { a: 2,  b: 14, score: 0.88, reason: "Overlappende interesse in beleidsmatige samenwerking",           status: "suggested" },
    { a: 3,  b: 18, score: 0.86, reason: "Beide actief in participatie en fondsenwerving",                 status: "suggested" },
    { a: 4,  b: 8,  score: 0.85, reason: "Werken allebei met jongeren in kwetsbare situaties",             status: "suggested" },
    { a: 5,  b: 11, score: 0.83, reason: "Gedeelde uitdaging: vrijwilligersbinding en -werving",           status: "accepted" },
    { a: 6,  b: 15, score: 0.81, reason: "Gelijkgestemde visie op diversiteit en inclusie",                status: "suggested" },
    { a: 7,  b: 17, score: 0.79, reason: "Complementaire expertise in senioren en jongerenwerk",           status: "suggested" },
    { a: 9,  b: 10, score: 0.78, reason: "Overlappend netwerk in zorg en welzijn",                        status: "suggested" },
    { a: 13, b: 16, score: 0.76, reason: "Beiden actief in cliëntenparticipatie en seniorenbeleid",        status: "declined"  },
  ];

  const matchRows = matchPairs.map(m => ({
    eventId:     event.id,
    attendeeAId: createdAttendees[m.a].id,
    attendeeBId: createdAttendees[m.b].id,
    score:       m.score,
    reason:      m.reason,
    status:      m.status,
  }));
  await db.insert(networkMatches).values(matchRows);
  console.log("✅ Netwerk-matches:", matchRows.length);

  // ── 11. Wachtlijst (3 personen) ──────────────────────────────────────────────
  await db.insert(waitlist).values([
    {
      eventId:      event.id,
      name:         "Hanna de Groot",
      email:        "hanna@welzijn-west.nl",
      organization: "Welzijn West",
      role:         "Sociaal werker",
      position:     1,
      status:       "waiting",
      token:        randomUUID(),
    },
    {
      eventId:      event.id,
      name:         "Omar Khalil",
      email:        "omar@stichtingthuis.nl",
      organization: "Stichting Thuis",
      role:         "Begeleider",
      position:     2,
      status:       "waiting",
      token:        randomUUID(),
    },
    {
      eventId:      event.id,
      name:         "Renée Bakker",
      email:        "renee@participatieplatform.nl",
      organization: "Participatieplatform",
      role:         "Projectmanager",
      position:     3,
      status:       "waiting",
      token:        randomUUID(),
    },
  ]);
  console.log("✅ Wachtlijst: 3 personen");

  // ── Klaar ────────────────────────────────────────────────────────────────────
  const checkedIn = createdAttendees.filter(a => a.status === "ingecheckt").length;
  const vera = createdAttendees.find(a => a.email === USER_EMAIL);

  console.log(`
🎉 Valtijnsevent volledig aangemaakt!

   📋 Event ID:     ${event.id}
   🔗 Slug:         /e/valtijnsevent-2026
   👥 Deelnemers:   ${createdAttendees.length} (${checkedIn} ingecheckt)
   📅 Sessies:      ${createdSessions.length}
   🎫 QR Vera:      /ticket/${vera?.qrCode}
   🗂️  Dashboard:   /dashboard/events/${event.id}

   Organisatie koppeld aan: ${USER_EMAIL}
  `);

  process.exit(0);
}

run().catch(err => {
  console.error("❌ Fout:", err);
  process.exit(1);
});
