/**
 * Seed: Stichting Philia — Ladiesday 2026
 * Gebruik: npx tsx src/db/seed-philia.ts
 *
 * Zoekt de bestaande Stichting Philia org op en voegt demodata toe:
 * - Event: Ladiesday 2026 (14 feb 2026)
 * - 9 sessies / activiteiten
 * - 35 deelnemers (19 gasten + 16 vrijwilligers)
 * - Feedback, polls, Q&A en netwerk-matches
 */
import { db } from "./index";
import {
  organizations, events, sessions, attendees,
  polls, qaMessages, feedback, networkMatches,
} from "./schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌸 Seeding Stichting Philia — Ladiesday 2026...\n");

  // ── Zoek bestaande org ──────────────────────────────────────
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.name, "Stichting Philia"));

  if (!org) {
    console.error("❌ Organisatie 'Stichting Philia' niet gevonden.");
    console.error("   Maak eerst een account aan en voltooi onboarding.");
    process.exit(1);
  }
  console.log("✅ Organisatie gevonden:", org.name, `(id: ${org.id})`);

  // Update locatie-info als die er nog niet is
  await db.update(organizations).set({
    slug: "stichting-philia",
  }).where(eq(organizations.id, org.id));

  // ── Event ───────────────────────────────────────────────────
  const [event] = await db.insert(events).values({
    organizationId: org.id,
    title:       "Ladiesday 2026",
    tagline:     "Een dag vol verbinding, inspiratie en plezier voor vrouwen in de Haarlemmermeer",
    description: `De Ladiesday is hét jaarlijkse hoogtepunt van Stichting Philia in de Haarlemmermeer.
Op 14 februari 2026 kwamen 35 vrouwen samen voor een dag vol workshops, muziek,
lekker eten en hartelijke ontmoetingen. Georganiseerd door 16 enthousiaste vrijwilligers.`,
    location:    "Dorpshuis De Meerpaal, Hoofddorp",
    address:     "Polderplein 1, 2132 BA Hoofddorp",
    startsAt:    new Date("2026-02-14T10:00:00"),
    endsAt:      new Date("2026-02-14T16:30:00"),
    status:      "ended",
    maxAttendees: 40,
    isPublic:    false,
    slug:        `ladiesday-2026-philia`,
  }).returning();
  console.log("✅ Event:", event.title);

  // ── Sessies / Activiteiten ──────────────────────────────────
  const sessieData = [
    {
      eventId:     event.id,
      title:       "Inloop & Welkom",
      description: "Koffie, thee en zelfgemaakte koeken. Iedereen welkom geheten door de vrijwilligers.",
      location:    "Entreehal",
      startsAt:    new Date("2026-02-14T10:00:00"),
      endsAt:      new Date("2026-02-14T10:30:00"),
      sortOrder:   1,
    },
    {
      eventId:     event.id,
      title:       "Opening: Samen Sterk in de Haarlemmermeer",
      description: "Welkomswoord door coördinator Nadia Bosman over de missie van Stichting Philia en de kracht van vrouwennetwerken.",
      speaker:     "Nadia Bosman",
      speakerOrg:  "Stichting Philia",
      location:    "Grote Zaal",
      startsAt:    new Date("2026-02-14T10:30:00"),
      endsAt:      new Date("2026-02-14T11:00:00"),
      capacity:    40,
      sortOrder:   2,
    },
    {
      eventId:     event.id,
      title:       "Workshop: Zelfvertrouwen & Eigenwaarde",
      description: "Interactieve workshop over het herkennen en benutten van je eigen kracht. Met oefeningen en gesprek.",
      speaker:     "Fatima El Mansouri",
      speakerOrg:  "Loopbaancoach ZZP",
      location:    "Zaal A",
      startsAt:    new Date("2026-02-14T11:15:00"),
      endsAt:      new Date("2026-02-14T12:15:00"),
      capacity:    20,
      sortOrder:   3,
    },
    {
      eventId:     event.id,
      title:       "Workshop: Henna & Kunst",
      description: "Leer de traditionele kunst van henna-tekenen. Voor beginners en gevorderden.",
      speaker:     "Amira Khalil",
      speakerOrg:  "Kunstcollectief Haarlemmermeer",
      location:    "Zaal B",
      startsAt:    new Date("2026-02-14T11:15:00"),
      endsAt:      new Date("2026-02-14T12:15:00"),
      capacity:    15,
      sortOrder:   4,
    },
    {
      eventId:     event.id,
      title:       "Gemeenschappelijke Lunch",
      description: "Gezellige lunch met gerechten ingebracht door de deelnemers zelf — een echte potluck vol smaken uit de Haarlemmermeer.",
      location:    "Eetzaal",
      startsAt:    new Date("2026-02-14T12:15:00"),
      endsAt:      new Date("2026-02-14T13:15:00"),
      sortOrder:   5,
    },
    {
      eventId:     event.id,
      title:       "Inspiratiegesprek: Vrouwen die het Verschil Maken",
      description: "Drie lokale vrouwen vertellen over hun impact in de wijk. Gevolgd door paneldiscussie.",
      speaker:     "Diverse panelleden",
      speakerOrg:  "Gemeente Haarlemmermeer & lokale initiatieven",
      location:    "Grote Zaal",
      startsAt:    new Date("2026-02-14T13:15:00"),
      endsAt:      new Date("2026-02-14T14:15:00"),
      capacity:    40,
      sortOrder:   6,
    },
    {
      eventId:     event.id,
      title:       "Workshop: Dans & Beweging",
      description: "Energieke danssessie met traditionele en moderne stijlen. Voor iedereen, geen ervaring nodig!",
      speaker:     "Mariette de Jong",
      speakerOrg:  "Dansschool Hoofddorp",
      location:    "Sportzaal",
      startsAt:    new Date("2026-02-14T14:30:00"),
      endsAt:      new Date("2026-02-14T15:30:00"),
      capacity:    35,
      sortOrder:   7,
    },
    {
      eventId:     event.id,
      title:       "Marktje: Lokale Onderneemsters",
      description: "Mini-markt met producten en diensten van vrouwelijke ondernemers uit de Haarlemmermeer.",
      location:    "Hal",
      startsAt:    new Date("2026-02-14T13:15:00"),
      endsAt:      new Date("2026-02-14T16:00:00"),
      sortOrder:   8,
    },
    {
      eventId:     event.id,
      title:       "Afsluiting & Traktatie",
      description: "Gezamenlijke afsluiting met muziek, cadeau voor elke deelnemer en een foto voor de herinnering.",
      location:    "Grote Zaal",
      startsAt:    new Date("2026-02-14T16:00:00"),
      endsAt:      new Date("2026-02-14T16:30:00"),
      capacity:    40,
      sortOrder:   9,
    },
  ];

  const gemaakteSessies = await db.insert(sessions).values(sessieData).returning();
  console.log("✅ Sessies:", gemaakteSessies.length);

  // ── Deelnemers ──────────────────────────────────────────────
  // 19 gasten + 16 vrijwilligers = 35 totaal
  const gastenData = [
    { name: "Yasmine Amrani",      email: "yasmine.amrani@gmail.com",     organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_networking", "interest_innovation"] },
    { name: "Petra van der Laan",  email: "petra.vanderlaan@xs4all.nl",   organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_networking", "interest_workshops"] },
    { name: "Sadia Hassan",        email: "sadia.hassan@hotmail.com",     organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_practice"] },
    { name: "Ingrid Mol",          email: "ingrid.mol@ziggo.nl",          organization: "Gemeente Haarlemmermeer",       role: "Beleidsadviseur", interests: ["interest_policy", "interest_networking"] },
    { name: "Rania Benali",        email: "rania.benali@gmail.com",       organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_networking"] },
    { name: "Miriam Kowalski",     email: "m.kowalski@kpnmail.nl",        organization: "Basisschool De Regenboog",      role: "Leerkracht",     interests: ["interest_practice", "interest_networking"] },
    { name: "Amina Diallo",        email: "amina.diallo@gmail.com",       organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_innovation"] },
    { name: "Liesbeth Bakker",     email: "liesbeth.bakker@telfort.nl",   organization: "Ouderenvereniging Hoofddorp",   role: "Bestuurslid",    interests: ["interest_networking", "interest_policy"] },
    { name: "Farah Nasser",        email: "farah.nasser@hotmail.nl",      organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_practice"] },
    { name: "Joke Timmers",        email: "joke.timmers@outlook.com",     organization: "Welzijn Haarlemmermeer",        role: "Sociaal werker", interests: ["interest_practice", "interest_networking"] },
    { name: "Hodan Warsame",       email: "hodan.warsame@gmail.com",      organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_networking", "interest_workshops"] },
    { name: "Annelies de Boer",    email: "annelies.deboer@ziggo.nl",     organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_networking"] },
    { name: "Khadija El Fahmi",    email: "khadija.elfahmi@gmail.com",    organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_innovation"] },
    { name: "Hanneke Smits",       email: "hanneke.smits@kpnmail.nl",     organization: "Thuiszorg Haarlemmermeer",      role: "Medewerker",     interests: ["interest_practice", "interest_networking"] },
    { name: "Noa Cohen",           email: "noa.cohen@outlook.com",        organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_networking"] },
    { name: "Zahra Rahimi",        email: "zahra.rahimi@gmail.com",       organization: "Vluchtelingenwerk NW",          role: "Deelnemer",      interests: ["interest_practice", "interest_policy"] },
    { name: "Sandra Huisman",      email: "sandra.huisman@xs4all.nl",     organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_networking", "interest_workshops"] },
    { name: "Nathalie Vermeer",    email: "nathalie.vermeer@ziggo.nl",    organization: "Ondernemer (ZZP)",              role: "Ondernemer",     interests: ["interest_networking", "interest_innovation"] },
    { name: "Dina Osei",           email: "dina.osei@gmail.com",          organization: "Particulier",                   role: "Deelnemer",      interests: ["interest_workshops", "interest_practice"] },
  ].map(a => ({
    ...a,
    eventId:      event.id,
    status:       "ingecheckt" as const,
    checkedInAt:  new Date("2026-02-14T10:05:00"),
    qrCode:       randomUUID(),
  }));

  const vrijwilligersData = [
    { name: "Nadia Bosman",         email: "nadia.bosman@stichtingphilia.nl",   organization: "Stichting Philia",  role: "Coördinator" },
    { name: "Leila Aziz",           email: "leila.aziz@stichtingphilia.nl",     organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Yvonne de Groot",      email: "yvonne.degroot@stichtingphilia.nl", organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Fatou Diatta",         email: "fatou.diatta@gmail.com",            organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Margriet Hendriks",    email: "margriet.hendriks@telfort.nl",      organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Soraya El Idrissi",    email: "soraya.elidrissi@gmail.com",        organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Trudy Visser",         email: "trudy.visser@kpnmail.nl",           organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Aisha Musa",           email: "aisha.musa@hotmail.com",            organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Bianca Jacobs",        email: "bianca.jacobs@xs4all.nl",           organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Samira Oukili",        email: "samira.oukili@gmail.com",           organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Loes van Dijk",        email: "loes.vandijk@outlook.com",          organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Hanan Berrada",        email: "hanan.berrada@gmail.com",           organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Renate Postma",        email: "renate.postma@ziggo.nl",            organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Zainab Al-Rawi",       email: "zainab.alrawi@gmail.com",           organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Ans van Leeuwen",      email: "ans.vanleeuwen@kpnmail.nl",         organization: "Stichting Philia",  role: "Vrijwilliger" },
    { name: "Malak Bensouda",       email: "malak.bensouda@gmail.com",          organization: "Stichting Philia",  role: "Vrijwilliger" },
  ].map(a => ({
    ...a,
    eventId:      event.id,
    interests:    ["interest_networking", "interest_practice"],
    status:       "ingecheckt" as const,
    checkedInAt:  new Date("2026-02-14T09:00:00"),
    qrCode:       randomUUID(),
  }));

  const gemaakteGasten       = await db.insert(attendees).values(gastenData).returning();
  const gemaakteVrijwilligers = await db.insert(attendees).values(vrijwilligersData).returning();
  const alleDeelnemers       = [...gemaakteGasten, ...gemaakteVrijwilligers];
  console.log(`✅ Deelnemers: ${gemaakteGasten.length} gasten + ${gemaakteVrijwilligers.length} vrijwilligers = ${alleDeelnemers.length} totaal`);

  // ── Poll ────────────────────────────────────────────────────
  const openingSessie = gemaakteSessies.find(s => s.sortOrder === 2)!;
  await db.insert(polls).values({
    eventId:   event.id,
    sessionId: openingSessie.id,
    question:  "Wat waardeer je het meest aan de Ladiesday?",
    options: [
      { id: "1", label: "De gezelligheid & sfeer",     votes: 18 },
      { id: "2", label: "De workshops",                 votes: 10 },
      { id: "3", label: "Nieuwe mensen leren kennen",   votes: 5  },
      { id: "4", label: "De lunch & markt",             votes: 2  },
    ],
    isActive: false,
  });
  console.log("✅ Poll aangemaakt");

  // ── Q&A ─────────────────────────────────────────────────────
  const inspiratieSessie = gemaakteSessies.find(s => s.sortOrder === 6)!;
  await db.insert(qaMessages).values([
    {
      eventId:     event.id,
      sessionId:   inspiratieSessie.id,
      authorName:  "Ingrid Mol",
      content:     "Hoe kunnen we als gemeente jullie activiteiten beter ondersteunen?",
      isAnonymous: false,
      status:      "goedgekeurd",
      upvotes:     12,
    },
    {
      eventId:     event.id,
      sessionId:   inspiratieSessie.id,
      authorName:  null,
      content:     "Komt er volgend jaar ook een Ladiesday? En mag ik dan een vriendin meenemen?",
      isAnonymous: true,
      status:      "goedgekeurd",
      upvotes:     9,
    },
    {
      eventId:     event.id,
      sessionId:   inspiratieSessie.id,
      authorName:  "Nathalie Vermeer",
      content:     "Is er een mogelijkheid om als ondernemer vaker mee te doen aan dit soort evenementen?",
      isAnonymous: false,
      status:      "goedgekeurd",
      upvotes:     6,
    },
    {
      eventId:     event.id,
      sessionId:   inspiratieSessie.id,
      authorName:  null,
      content:     "Heel mooi initiatief. Hoe kan ik me aanmelden als vrijwilliger?",
      isAnonymous: true,
      status:      "goedgekeurd",
      upvotes:     4,
    },
  ]);
  console.log("✅ Q&A aangemaakt");

  // ── Feedback / Ratings ──────────────────────────────────────
  // Sessies met hoge beoordelingen (realistisch voor een geslaagde dag)
  const feedbackSessies = gemaakteSessies.filter(s =>
    [2, 3, 4, 6, 7].includes(s.sortOrder ?? 0)
  );

  const ratings: Record<number, number[]> = {
    2: [4.8, 4.9, 5.0, 4.7, 4.8, 4.9, 4.6, 5.0, 4.8, 4.7],  // Opening
    3: [4.9, 5.0, 4.8, 4.9, 5.0, 4.7, 4.9, 5.0, 4.8, 4.9],  // Workshop Zelfvertrouwen
    4: [4.7, 4.8, 4.9, 4.6, 4.8, 4.7, 5.0, 4.8, 4.7, 4.9],  // Henna
    6: [4.8, 4.9, 4.7, 4.8, 5.0, 4.6, 4.8, 4.9, 4.7, 4.8],  // Inspiratiegesprek
    7: [5.0, 4.9, 5.0, 4.8, 4.9, 5.0, 4.7, 4.9, 5.0, 4.8],  // Dans
  };

  const feedbackComments: Record<number, string[]> = {
    2: ["Heel inspirerend!", "Nadia straalt zoveel energie uit.", "Prachtige opening van de dag.", "Voelde me meteen welkom."],
    3: ["Heel nuttig en herkenbaar.", "Fatima is een geweldige coach!", "Praktisch en motiverend.", "Ga dit zeker toepassen."],
    4: ["Zo leuk, had nog nooit henna gedaan!", "Amira is super geduldig.", "Prachtig resultaat!", "Wil dit zeker vaker doen."],
    6: ["Erg inspirerend om deze vrouwen te horen.", "Raakte me echt.", "Geweldig panelgesprek!", "Trots op onze wijk."],
    7: ["Geweldig! Zo blij van geworden.", "Mariette is fantastisch.", "Altijd al willen dansen — nu gedaan!", "Beste sessie van de dag!"],
  };

  let feedbackCount = 0;
  for (const sessie of feedbackSessies) {
    const order = sessie.sortOrder ?? 0;
    const sessieRatings = ratings[order] ?? [];
    const sessieComments = feedbackComments[order] ?? [];
    const deelnemersVoorSessie = gemaakteGasten.slice(0, sessieRatings.length);

    for (let i = 0; i < deelnemersVoorSessie.length; i++) {
      await db.insert(feedback).values({
        eventId:    event.id,
        sessionId:  sessie.id,
        attendeeId: deelnemersVoorSessie[i].id,
        rating:     sessieRatings[i] ?? 4.5,
        comment:    sessieComments[i % sessieComments.length],
      });
      feedbackCount++;
    }
  }
  console.log(`✅ Feedback: ${feedbackCount} beoordelingen`);

  // ── Netwerk-matches (steekproef) ────────────────────────────
  const matchParen = [
    { a: 0, b: 3,  score: 0.92, reason: JSON.stringify({ reason: "Beiden actief in gemeenschapsopbouw Haarlemmermeer — Ingrid vanuit gemeente, Yasmine als bewoner.", starter: "Hoe ervaar jij de ondersteuning vanuit de gemeente voor buurtinitiatieven?" }) },
    { a: 1, b: 17, score: 0.88, reason: JSON.stringify({ reason: "Petra en Nathalie zijn beiden ondernemend en zoeken verbinding met gelijkgestemde vrouwen.", starter: "Wat is jouw mooiste project of onderneming dit jaar?" }) },
    { a: 5, b: 9,  score: 0.85, reason: JSON.stringify({ reason: "Miriam (onderwijs) en Joke (welzijn) werken beiden met kwetsbare doelgroepen — veel overlap.", starter: "Hoe werk jij samen met andere professionals in de wijk?" }) },
    { a: 6, b: 15, score: 0.83, reason: JSON.stringify({ reason: "Amina en Zahra hebben een vergelijkbare achtergrond en kunnen ervaringen uitwisselen over integratie en empowerment.", starter: "Welk initiatief in de Haarlemmermeer heeft jou het meest geholpen?" }) },
    { a: 2, b: 12, score: 0.80, reason: JSON.stringify({ reason: "Sadia en Khadija delen een passie voor persoonlijke ontwikkeling en workshops.", starter: "Welke workshop heeft jou vandaag het meest geraakt?" }) },
  ];

  for (const match of matchParen) {
    await db.insert(networkMatches).values({
      eventId:     event.id,
      attendeeAId: alleDeelnemers[match.a].id,
      attendeeBId: alleDeelnemers[match.b].id,
      score:       match.score,
      reason:      match.reason,
      status:      "suggested",
    });
  }
  console.log("✅ Netwerk-matches:", matchParen.length);

  // ── Samenvatting ────────────────────────────────────────────
  console.log("\n🎉 Stichting Philia demo compleet!");
  console.log(`   📅 Event:        ${event.title}`);
  console.log(`   📍 Locatie:      ${event.location}`);
  console.log(`   👥 Deelnemers:   ${alleDeelnemers.length} (${gemaakteGasten.length} gasten + ${gemaakteVrijwilligers.length} vrijwilligers)`);
  console.log(`   🎯 Sessies:      ${gemaakteSessies.length}`);
  console.log(`   ⭐ Feedback:     ${feedbackCount} beoordelingen`);
  console.log(`   🤝 Matches:      ${matchParen.length}`);

  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
