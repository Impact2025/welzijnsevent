/**
 * Seed script — vul de database met realistische testdata
 * Gebruik: npx tsx src/db/seed.ts
 */
import { db } from "./index";
import {
  organizations, events, sessions, attendees, polls, qaMessages, feedback
} from "./schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  // Organization
  const [org] = await db.insert(organizations).values({
    name: "Humanitas Utrecht",
    slug: "humanitas-utrecht",
    primaryColor: "#C8522A",
  }).returning();
  console.log("✅ Organization:", org.name);

  // Events
  const [event1] = await db.insert(events).values({
    organizationId: org.id,
    title: "Vrijwilligersdag 2024",
    description: "Jaarlijkse dag voor al onze vrijwilligers met workshops, netwerken en inspiratie.",
    location: "De Jaarbeurs, Utrecht",
    address: "Jaarbeursplein 6, 3521 AL Utrecht",
    startsAt: new Date("2024-06-15T09:00:00"),
    endsAt:   new Date("2024-06-15T17:00:00"),
    status: "live",
    maxAttendees: 250,
  }).returning();

  const [event2] = await db.insert(events).values({
    organizationId: org.id,
    title: "Buurtbarbecue Hoograven",
    description: "Gezellige buurtbijeenkomst voor bewoners van Hoograven.",
    location: "Wijkcentrum De Brink",
    address: "Brinkstraat 12, 3523 LN Utrecht",
    startsAt: new Date("2024-06-18T17:00:00"),
    endsAt:   new Date("2024-06-18T21:00:00"),
    status: "published",
    maxAttendees: 80,
  }).returning();

  const [event3] = await db.insert(events).values({
    organizationId: org.id,
    title: "Senioren Schaaktoernooi",
    description: "Maandelijks schaaktoernooi voor senioren.",
    location: "Bibliotheek Utrecht",
    address: "Oudegracht 167, 3511 NK Utrecht",
    startsAt: new Date("2024-06-18T14:00:00"),
    endsAt:   new Date("2024-06-18T17:00:00"),
    status: "draft",
    maxAttendees: 30,
  }).returning();
  console.log("✅ Events:", event1.title, event2.title, event3.title);

  // Sessions for event1
  const sessionData = [
    {
      eventId: event1.id,
      title: "Inloop & Ontvangst",
      description: "Met koffie, thee en versnaperingen.",
      location: "Centrale Hal",
      startsAt: new Date("2024-06-15T09:00:00"),
      endsAt:   new Date("2024-06-15T09:45:00"),
      sortOrder: 1,
    },
    {
      eventId: event1.id,
      title: "Opening: De Kracht van Samen",
      description: "Keynote door Annet de Wildt over de toekomst van welzijnswerk.",
      speaker: "Annet de Wildt",
      speakerOrg: "Humanitas Centraal",
      location: "Grote Zaal",
      startsAt: new Date("2024-06-15T10:00:00"),
      endsAt:   new Date("2024-06-15T11:30:00"),
      isLive: true,
      capacity: 250,
      sortOrder: 2,
    },
    {
      eventId: event1.id,
      title: "Workshop: Digitale Inclusie",
      description: "Hoe bereiken we ouderen in een gedigitaliseerde wereld?",
      speaker: "Mark de Vries",
      speakerOrg: "Stichting Toegankelijk NL",
      location: "Studio B",
      startsAt: new Date("2024-06-15T11:45:00"),
      endsAt:   new Date("2024-06-15T12:45:00"),
      capacity: 60,
      sortOrder: 3,
    },
    {
      eventId: event1.id,
      title: "Netwerk Lunch",
      description: "Lunch en ontmoetingen met je netwerkmatch.",
      location: "Grand Café",
      startsAt: new Date("2024-06-15T12:45:00"),
      endsAt:   new Date("2024-06-15T13:45:00"),
      sortOrder: 4,
    },
    {
      eventId: event1.id,
      title: "Community Building 101",
      description: "Praktische tools voor het opbouwen van sterke communities in je wijk.",
      speaker: "Fatima El Khatib",
      speakerOrg: "Movisie",
      location: "Zaal A",
      startsAt: new Date("2024-06-15T14:00:00"),
      endsAt:   new Date("2024-06-15T15:15:00"),
      capacity: 80,
      sortOrder: 5,
    },
    {
      eventId: event1.id,
      title: "Vrijwilligersswerving 2.0",
      description: "Nieuwe methodes om enthousiaste vrijwilligers te vinden en te binden.",
      speaker: "Jeroen Bakker",
      speakerOrg: "NOV",
      location: "Zaal B",
      startsAt: new Date("2024-06-15T14:00:00"),
      endsAt:   new Date("2024-06-15T15:15:00"),
      capacity: 60,
      sortOrder: 6,
    },
    {
      eventId: event1.id,
      title: "Dialoog in de Wijk",
      description: "Hoe faciliteer je echte gesprekken tussen bewoners met verschillende achtergronden?",
      speaker: "Leila Ahmadi",
      speakerOrg: "Stichting Buurtdialoog",
      location: "Studio C",
      startsAt: new Date("2024-06-15T15:30:00"),
      endsAt:   new Date("2024-06-15T16:30:00"),
      capacity: 45,
      sortOrder: 7,
    },
    {
      eventId: event1.id,
      title: "Afsluiting & Borrel",
      description: "Terugblik op de dag en informeel napraten.",
      location: "Centrale Hal",
      startsAt: new Date("2024-06-15T16:30:00"),
      endsAt:   new Date("2024-06-15T17:00:00"),
      sortOrder: 8,
    },
  ];

  const createdSessions = await db.insert(sessions).values(sessionData).returning();
  console.log("✅ Sessions:", createdSessions.length);

  // Attendees
  const attendeeData = [
    { name: "Anouk de Vries",    email: "anouk@buurtteam.nl",     organization: "Buurtteam Utrecht",          role: "Coördinator",      status: "ingecheckt" },
    { name: "Mark van den Berg", email: "mark@vrijwcentraal.nl",  organization: "Vrijwilligerscentrale",       role: "Vrijwilliger",     status: "aangemeld"  },
    { name: "Saskia Lammers",    email: "saskia@gemeente.nl",     organization: "Gemeente Amsterdam",         role: "Beleidsmedewerker", status: "afwezig"   },
    { name: "Elif Kaya",         email: "elif@welzijn.nl",        organization: "Stichting Welzijn",          role: "Sociaal werker",   status: "ingecheckt" },
    { name: "Jasper de Groot",   email: "jasper@ouderenzorg.nl",  organization: "Ouderenzorg NL",             role: "Directeur",        status: "aangemeld"  },
    { name: "Rachida Slimane",   email: "rachida@sociaalwerk.nl", organization: "Sociaal Werk Nederland",     role: "Programmamanager", status: "ingecheckt" },
    { name: "Thomas Pieters",    email: "thomas@buurtzorg.nl",    organization: "Buurtzorg",                  role: "Wijkverpleegkundige", status: "ingecheckt" },
    { name: "Linda Bakker",      email: "linda@humanitas.nl",     organization: "Humanitas Midden-Nederland", role: "Coördinator",      status: "aangemeld"  },
    { name: "Ahmed Yilmaz",      email: "ahmed@jongerenwerk.nl",  organization: "Jongerenwerk Utrecht",       role: "Jongerenwerker",   status: "ingecheckt" },
    { name: "Noor van Dam",      email: "noor@mee.nl",            organization: "Stichting Mee",              role: "Begeleider",       status: "aangemeld"  },
  ].map(a => ({
    ...a,
    eventId: event1.id,
    interests: ["netwerken", "vrijwilligers", "sociaal werk"],
    qrCode: randomUUID(),
  }));

  const createdAttendees = await db.insert(attendees).values(attendeeData).returning();
  console.log("✅ Attendees:", createdAttendees.length);

  // Poll
  const liveSession = createdSessions.find(s => s.isLive);
  if (liveSession) {
    await db.insert(polls).values({
      eventId: event1.id,
      sessionId: liveSession.id,
      question: "Wat is de belangrijkste prioriteit voor jouw wijk?",
      options: [
        { id: "1", label: "Veiligheid",         votes: 45 },
        { id: "2", label: "Groenvoorziening",    votes: 30 },
        { id: "3", label: "Evenementen",         votes: 15 },
        { id: "4", label: "Digitale inclusie",   votes: 10 },
      ],
      isActive: true,
    });

    // Q&A messages
    await db.insert(qaMessages).values([
      {
        eventId: event1.id,
        sessionId: liveSession.id,
        authorName: null,
        content: "Hoe kunnen we jongeren beter betrekken bij buurtprojecten?",
        isAnonymous: true,
        status: "goedgekeurd",
      },
      {
        eventId: event1.id,
        sessionId: liveSession.id,
        authorName: "Marieke V.",
        content: "Zijn er subsidies beschikbaar voor groene daken in 2024?",
        isAnonymous: false,
        status: "nieuw",
      },
      {
        eventId: event1.id,
        sessionId: liveSession.id,
        authorName: "Piet de Jong",
        content: "Wat doet de gemeente aan eenzaamheid onder ouderen?",
        isAnonymous: false,
        status: "nieuw",
      },
    ]);
    console.log("✅ Poll & Q&A messages created");
  }

  // Feedback for some sessions
  for (const session of createdSessions.slice(0, 3)) {
    for (const attendee of createdAttendees.slice(0, 5)) {
      await db.insert(feedback).values({
        eventId: event1.id,
        sessionId: session.id,
        attendeeId: attendee.id,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        comment: "Zeer informatieve sessie!",
      });
    }
  }
  console.log("✅ Feedback created");

  console.log("\n🎉 Seed compleet!");
  console.log(`   Organisatie: ${org.name}`);
  console.log(`   Events: 3`);
  console.log(`   Sessies: ${createdSessions.length}`);
  console.log(`   Deelnemers: ${createdAttendees.length}`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
