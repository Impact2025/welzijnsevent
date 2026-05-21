import { readFileSync } from "fs";
import { join } from "path";

// Laad .env en .env.local vóór db-import (static imports worden gehoist)
for (const f of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(join(process.cwd(), f), "utf8").split("\n")) {
      const m = line.match(/^\s*([^#\s=][^=]*)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

async function seed() {
  // Dynamische import zodat DATABASE_URL al beschikbaar is
  const { db } = await import("../db/index.js");
  const { knowledgeBaseCategories, knowledgeBaseArticles } = await import("../db/schema.js");

  console.log("🌱 Seeding kennisbank categorieën en artikelen...");

  await db.delete(knowledgeBaseArticles);
  await db.delete(knowledgeBaseCategories);

  const cats = await db.insert(knowledgeBaseCategories).values([
    { name: "Evenementen organiseren", slug: "evenementen-organiseren", description: "Praktische gidsen voor het organiseren van welzijnsevenementen van A tot Z.", icon: "🗓️", color: "#C8522A", sortOrder: 1 },
    { name: "Deelnemersbeheer", slug: "deelnemersbeheer", description: "Alles over registratie, check-in en communicatie met deelnemers.", icon: "👥", color: "#2D5A3D", sortOrder: 2 },
    { name: "Impact en rapportage", slug: "impact-en-rapportage", description: "Hoe je de maatschappelijke impact van je evenement meetbaar maakt.", icon: "📊", color: "#1C4E80", sortOrder: 3 },
    { name: "Digitale tools", slug: "digitale-tools", description: "Vergelijkingen en reviews van event software voor nonprofits.", icon: "🛠️", color: "#5B4F8B", sortOrder: 4 },
    { name: "GDPR en privacy", slug: "gdpr-en-privacy", description: "AVG compliant werken bij evenementen en ledenregistratie.", icon: "🔐", color: "#6B5E54", sortOrder: 5 },
    { name: "Vrijwilligers", slug: "vrijwilligers", description: "Vrijwilligers werven, inzetten en behouden via je evenementen.", icon: "🤝", color: "#C87B2A", sortOrder: 6 },
  ]).returning();

  const c: Record<string, string> = {};
  for (const cat of cats) c[cat.slug] = cat.id;

  await db.insert(knowledgeBaseArticles).values([

    // ─── ARTIKEL 1: Checklist welzijnsevenement (pillar) ───────────────────────
    {
      slug: "checklist-welzijnsevenement",
      title: "Complete checklist voor een welzijnsevenement (2026)",
      excerpt: "Van zaal reserveren tot impactrapportage: de enige checklist die je nodig hebt voor een soepel welzijnsevenement. Gebaseerd op honderden evenementen in de zorg en welzijnssector.",
      categoryId: c["evenementen-organiseren"],
      status: "published",
      publishedAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
      readingTime: 14,
      tags: ["checklist", "evenementen organiseren", "welzijn", "planning"],
      metaTitle: "Complete checklist welzijnsevenement 2026 | Bijeen",
      metaDescription: "Alles wat je nodig hebt voor een succesvol welzijnsevenement. Praktische checklist van A tot Z, inclusief tips voor deelnemersbeheer, check-in en impactrapportage.",
      relatedArticles: ["deelnemersbeheer-grote-evenementen", "qr-code-check-in-evenement", "impactrapport-evenement"],
      content: `<h2>De realiteit van welzijnsorganisaties vlak voor een evenement</h2>
<p>Ik ken de week voor het evenement van binnenuit. Als voormalig directeur van Stichting de Baan organiseerde ik tientallen bijeenkomsten per jaar voor honderden deelnemers. De chaos begon altijd op dinsdag: drie Whatsapp groepen actief, een Excel die iemand had gebroken door per ongeluk een formule te wissen, en een bevestigingsmail die bij vijftien procent van de deelnemers in de spam was beland.</p>
<p>Wat ik toen nog niet wist: dat de gemiddelde welzijnscoördinator <strong>4,2 uur per evenement verliest</strong> aan administratieve overhead die vermijdbaar is. Geen grote fouten. Gewoon de optelsom van ontbrekende bevestigingen, handmatig bijhouden van aanwezigheid en impactrapportages die achteraf worden samengesteld uit losse aantekeningen.</p>
<p>Deze checklist is opgebouwd uit die praktijkervaring. Gebruik hem als kapstok, pas hem aan op je eigen organisatie, en bespaar jezelf de uren die ik kwijt was aan vermijdbare ruis.</p>

<h2>Fase 1: Zes weken voor het evenement</h2>
<h3>Strategie en doelstelling</h3>
<p>Elk evenement begint met een heldere vraag: wat moet er anders zijn nadat dit evenement heeft plaatsgevonden? Niet wat je wilt doen, maar wat je wilt bereiken. Een netwerkevenement voor vrijwilligers heeft een andere succesmeting dan een scholingsbijeenkomst voor hulpverleners.</p>
<ul>
<li>Definieer één primaire uitkomst (doelstelling SMART)</li>
<li>Benoem twee tot drie meetbare indicatoren (KPIs)</li>
<li>Stel een budget op met post voor onverwachte kosten (altijd minimaal tien procent reserve)</li>
<li>Bepaal de doelgroep en maximale capaciteit</li>
<li>Kies een datum die niet samenvalt met vergelijkbare sectorevenementen</li>
</ul>
<h3>Locatie en logistiek</h3>
<ul>
<li>Reserveer locatie met schriftelijke bevestiging en annuleringsvoorwaarden</li>
<li>Controleer toegankelijkheid: rolstoelgang, auditieve ondersteuning, parkeermogelijkheden</li>
<li>Inventariseer AV apparatuur en internetverbinding</li>
<li>Maak afspraken over catering inclusief dieetwensen</li>
<li>Stel een draaiboek op met tijdlijn en verantwoordelijken</li>
</ul>

<h2>Fase 2: Twee weken voor het evenement</h2>
<h3>Registratie en communicatie</h3>
<p>Dit is het moment waarop de meeste organisaties de fout ingaan: een aanmeldformulier dat niet op mobiel werkt, of een bevestigingsmail die aankomt zonder de juiste informatie. Bij Stichting de Baan bleek 38 procent van de aanmeldingslinks via een niet geoptimaliseerde mailclient te worden geopend, wat leidde tot afgebroken registraties.</p>
<ul>
<li>Open het aanmeldformulier minimaal tien werkdagen voor het evenement</li>
<li>Test het formulier op mobiel, tablet en desktop</li>
<li>Stel een automatische bevestigingsmail in met praktische informatie (locatie, parkeermogelijkheden, agenda)</li>
<li>Plan een herinnering drie en één dag voor het evenement</li>
<li>Maak een wachtlijst aan als je verwacht dat het evenement vol raakt</li>
</ul>
<h3>Programma en sprekers</h3>
<ul>
<li>Bevestig alle sprekers schriftelijk met sessietijden en technische wensen</li>
<li>Vraag presentaties of materialen uiterlijk vijf dagen voor het evenement op</li>
<li>Maak een gedetailleerd tijdschema met buffers voor uitloop</li>
<li>Wijs een dagvoorzitter aan die het programma bewaakt</li>
</ul>

<h2>Fase 3: De week voor het evenement</h2>
<h3>Deelnemerslijst en check-in voorbereiding</h3>
<p>Dit is waar het handmatige werk zich opstapelt als je geen goed systeem hebt. Bij evenementen met meer dan honderd deelnemers is een papieren lijst een garantie voor rijen bij de ingang en gefrustreerde bezoekers. Ik heb dit zelf meegemaakt bij een congres voor tweehonderd welzijnsprofessionals: de eerste twintig minuten gingen verloren aan het zoeken van namen in een alfabetisch ongesorteerde Excel.</p>
<ul>
<li>Exporteer de definitieve deelnemerslijst met alle relevante gegevens</li>
<li>Controleer op dubbele inschrijvingen</li>
<li>Bereid QR codes voor per deelnemer voor digitale check-in</li>
<li>Maak een namenlijst als backup voor technische storingen</li>
<li>Brief het ontvangstteam over de check-in procedure</li>
</ul>
<h3>Materiaal en communicatie</h3>
<ul>
<li>Druk naamkaartjes of badges af (of regel digitale alternatieven)</li>
<li>Bereid de ontvangstruimte voor met duidelijke bewegwijzering</li>
<li>Stuur de herinnering met praktische informatie inclusief routebeschrijving</li>
<li>Controleer of alle technische middelen werken: laptop, beamer, microfoons</li>
<li>Zorg voor een contactpersoon die bereikbaar is bij last-minute vragen</li>
</ul>

<h2>Fase 4: De dag zelf</h2>
<h3>Ochtend: opbouw en controle</h3>
<ul>
<li>Kom minimaal negentig minuten voor het begin van het programma aan</li>
<li>Test alle technische middelen opnieuw ter plaatse</li>
<li>Brief het volledige team op de taakverdeling</li>
<li>Activeer de digitale check-in omgeving</li>
<li>Leg een pen en papier neer als backup</li>
</ul>
<h3>Ontvangst en check-in</h3>
<p>De eerste vijf minuten dat een deelnemer aankomt bepalen de toon van de rest van het evenement. Een soepele check-in voelt professioneel en geeft vertrouwen. Een rommelige check-in straalt chaos uit, ook als de rest van het programma perfect verloopt.</p>
<ul>
<li>Scan QR codes of zoek op naam via de digitale deelnemerslijst</li>
<li>Registreer aankomststijden voor impactrapportage</li>
<li>Verwelkom deelnemers persoonlijk en wijs ze de weg</li>
<li>Noteer no-shows direct voor je definitieve presentielijst</li>
</ul>
<h3>Tijdens het programma</h3>
<ul>
<li>Monitoor de tijdlijn en grijp bij bij uitloop</li>
<li>Activeer live Q&A of polls op strategische momenten</li>
<li>Maak aantekeningen van kwalitatieve observaties voor het impactrapport</li>
<li>Fotografeer met toestemming van aanwezigen (zie ook je GDPR beleid)</li>
</ul>

<h2>Fase 5: Na het evenement</h2>
<h3>Direct na afloop (dezelfde dag)</h3>
<ul>
<li>Exporteer de definitieve presentielijst met check-in tijden</li>
<li>Stuur een bedankmail naar deelnemers binnen vier uur</li>
<li>Verwerk feedback van het team terwijl het vers is</li>
<li>Berg materialen op en controleer of de locatie in goede staat achterblijft</li>
</ul>
<h3>Binnen twee werkdagen</h3>
<ul>
<li>Stuur een korte enquête naar deelnemers (maximaal vijf vragen)</li>
<li>Begin met het samenstellen van de impactrapportage</li>
<li>Verwerk eventuele aanmeldingen voor vervolgsessies of nieuwsbrief</li>
<li>Deel highlights op sociale media als je daarvoor toestemming hebt</li>
</ul>
<h3>Binnen twee weken: het impactrapport</h3>
<p>Dit is het gedeelte dat de meeste organisaties overslaan omdat het te arbeidsintensief lijkt. Zonde, want juist het impactrapport is wat subsidiegevers en gemeenten nodig hebben om vervolgfinanciering te rechtvaardigen. Bij Stichting de Baan was het aantonen van maatschappelijk rendement letterlijk bepalend voor het voortbestaan van projecten.</p>
<ul>
<li>Combineer kwantitatieve data (aanwezigheid, enquêteresultaten) met kwalitatieve observaties</li>
<li>Koppel de uitkomsten aan de oorspronkelijke doelstelling</li>
<li>Formuleer concrete aanbevelingen voor het volgende evenement</li>
<li>Deel het rapport intern en met relevante stakeholders</li>
</ul>

<h2>Hoe Bijeen deze checklist automatiseert</h2>
<p>Bijeen.app is gebouwd om precies deze checklist te ondersteunen zonder dat je het wiel opnieuw hoeft uit te vinden. De registratiemodule regelt mobiel vriendelijke aanmeldformulieren, automatische bevestigingen en herinneringen. De check-in module verwerkt QR codes in realtime. De impactmodule genereert een WMO impactrapport automatisch op basis van de data die je toch al verzamelt.</p>
<p>Je hoeft geen extra tijd te steken in rapportage. De data is er al. Je hoeft hem alleen nog te presenteren.</p>
<blockquote><p>Warme zorg begint bij rust op de werkvloer. Slimme tools maken dat mogelijk.</p></blockquote>

<h2>Veelgestelde vragen</h2>
<h3>Hoe ver van tevoren moet ik beginnen met de organisatie van een welzijnsevenement?</h3>
<p>Voor een evenement tot vijftig deelnemers is vier weken doorgaans voldoende. Voor evenementen met meer dan honderd deelnemers of een meerdaags programma reken ik op minimaal acht weken voorbereiding. De kritieke factor is niet de grootte maar de complexiteit: sprekers van buiten de organisatie, catering met dieetwensen en subsidievereisten vragen meer voorbereiding.</p>
<h3>Wat is het grootste risico bij de check-in van een groot evenement?</h3>
<p>De combinatie van slechte internetverbinding en een papieren backup die niet up-to-date is. Zorg altijd voor een offline versie van de deelnemerslijst en test de check-in oplossing vooraf op de locatie met de daadwerkelijke internetverbinding ter plaatse.</p>
<h3>Moet ik een aparte rol aanwijzen voor de registratie?</h3>
<p>Ja. Bij evenementen met meer dan vijftig deelnemers adviseer ik altijd een dedicated registratiepersoon die niets anders doet dan inchecken. Zodra diezelfde persoon ook de spreker opvangt of catering regelt, ontstaan fouten in de presentielijst die later niet meer te herstellen zijn.</p>
<h3>Hoe maak ik een impactrapportage zonder extra werk?</h3>
<p>Door de meting in te bouwen in je registratie en check-in proces. Als je bij aanmelding twee of drie gerichte vragen stelt en na afloop een korte enquête uitstuurt, heb je alle data al. Bijeen combineert die bronnen automatisch tot een exporteerbaar WMO impactrapport.</p>`,
    },

    // ─── ARTIKEL 2: Evenementenprogramma maken ─────────────────────────────────
    {
      slug: "evenementenprogramma-maken",
      title: "Hoe maak je een evenementenprogramma dat deelnemers bijhoudt",
      excerpt: "Een strak programma is de ruggengraat van elk succesvol welzijnsevenement. Zo bouw je een agenda op die energie geeft in plaats van wegneemt.",
      categoryId: c["evenementen-organiseren"],
      status: "published",
      publishedAt: new Date("2026-02-03"),
      updatedAt: new Date("2026-02-03"),
      readingTime: 9,
      tags: ["programma", "planning", "evenement", "welzijn"],
      metaTitle: "Hoe maak je een evenementenprogramma | Bijeen Kennisbank",
      metaDescription: "Stap voor stap een evenementenprogramma opbouwen dat werkt. Praktische tips voor welzijnsorganisaties met aandacht voor energiebeheer, pauzes en interactie.",
      relatedArticles: ["checklist-welzijnsevenement", "live-qa-evenementen", "live-polls-evenementen"],
      content: `<h2>Warm contact, koude agenda</h2>
<p>Er is een paradox in de welzijnssector die ik keer op keer tegenkom: organisaties die warmte en verbinding centraal stellen in hun missie, maar evenementen organiseren alsof ze een bedrijfsconferentie plannen. Zes lezingen achter elkaar, een lunch van twintig minuten en een formele afsluiting waarbij niemand de moeite neemt om van tafel te komen.</p>
<p>Deelnemers verlaten zo'n dag met een dik mapje materiaal en een gevoel van informatieverzadiging. De verbinding die je wilde creëren is er nooit gekomen omdat het programma geen ruimte bood voor de onverwachte gesprekken die echt iets veranderen.</p>
<p>Een goed evenementenprogramma is geen tijdlijn. Het is een architectuur van energie.</p>

<h2>Begin met de ervaring, niet met de inhoud</h2>
<p>De meeste programmamakers beginnen met de vraag: wat moet er allemaal worden behandeld? De betere vraag is: hoe wil ik dat deelnemers zich voelen aan het einde van deze dag? Tevreden? Geïnspireerd? Met concrete handvatten naar huis? Of simpelweg verbonden met collega professionals die dezelfde uitdagingen kennen?</p>
<p>Pas als je die vraag hebt beantwoord, kun je de inhoud selecteren en rangschikken die bij die ervaring past.</p>

<h2>De energiecurve van een geslaagde dag</h2>
<p>Tijdens mijn periode bij Stichting de Baan experimenteerde ik veel met programmaopbouw. Wat ik leerde: mensen komen op twee momenten het best tot hun recht. In het eerste uur na de start, als de energie hoog is en de openheid groot. En in de periode direct na de lunch, mits die niet te lang duurt en gevolgd wordt door iets interactiefs.</p>
<h3>Ochtend: van verwelkoming naar verdieping</h3>
<p>De opening van een evenement bepaalt de toon. Een vlotte check-in, een warme welkomstwoord van maximaal vijf minuten en direct een activerende opener (een stelling, een korte poll, een vraag aan de zaal) zet deelnemers in de juiste modus.</p>
<ul>
<li>Reserveer twintig tot dertig minuten voor ontvangst en check-in</li>
<li>Houd de openingstoespraak beknopt: maximaal vijf minuten voor context, dan direct de zaal betrekken</li>
<li>Plan de zwaarste inhoudelijke sessie in de periode van negen uur dertig tot elf uur: dat is de scherpste concentratiepiek</li>
<li>Bouw na negentig minuten een echte pauze in van minimaal twintig minuten</li>
</ul>
<h3>Middag: interactie boven informatie</h3>
<p>Na de lunch daalt de concentratie snel als je deelnemers passief in een zaal zet. De middagsessies werken het best als ze een hoge mate van participatie vragen: werkgroepen, tafelgesprekken, LEGO Serious Play sessies of live vragenrondes met digitale tools.</p>
<ul>
<li>Start de middag nooit met een lange presentatie</li>
<li>Gebruik de eerste vijf minuten na de lunch om deelnemers te activeren: een korte opdracht of een poll via het scherm</li>
<li>Wissel between presentatie en interactie in blokken van maximaal veertig minuten</li>
<li>Eindig het inhoudelijke deel uiterlijk een uur voor de officiële sluitingstijd: ruimte voor informeel netwerken is geen luxe maar noodzaak</li>
</ul>

<h2>De stille krachten van een goed programma</h2>
<h3>Buffers zijn geen luiheid</h3>
<p>Ik hoor regelmatig: "we hebben zoveel te bespreken, we kunnen geen tijd verspillen aan pauzes". Dat is precies verkeerd om gedacht. Buffers zijn de ruimte waarin het echte werk plaatsvindt. De gesprekken in de gang, de vraag die iemand niet publiekelijk durfde te stellen maar wel tijdens de koffie pauze, de match tussen twee organisaties die toevallig naast elkaar staan.</p>
<p>Bouw altijd tien procent buffer in op je tijdlijn. Als je het niet nodig hebt, eindig je vroeger dan verwacht en dat is nooit een probleem.</p>
<h3>Één verantwoordelijke voor het tempo</h3>
<p>Benoem altijd een dagvoorzitter of moderator die het tijdschema bewaakt. Niet de inhoudelijk verantwoordelijke en zeker niet de organisator. Iemand met de specifieke taak om het programma te bewaken en vriendelijk maar stevig in te grijpen als een sessie uitloopt.</p>

<h2>Technische tools die het programma ondersteunen</h2>
<p>Bij Bijeen.app integreren we live Q&A en polls direct in het evenementenprogramma. Deelnemers zien de agenda op hun telefoon, kunnen vragen stellen die zichtbaar zijn voor de hele zaal en stemmen op stellingen die de spreker direct verwerkt in zijn of haar verhaal. Dat geeft een geheel andere dynamiek dan de klassieke "zijn er nog vragen uit de zaal?" waarbij iedereen naar zijn schoenen kijkt.</p>

<h2>Praktische programmastructuur voor een dagdeel</h2>
<ol>
<li><strong>09:00 – 09:30:</strong> Ontvangst en check-in (digitaal via QR code)</li>
<li><strong>09:30 – 09:40:</strong> Welkom en context (kort, activerend)</li>
<li><strong>09:40 – 11:00:</strong> Hoofdsessie met interactie via live Q&A</li>
<li><strong>11:00 – 11:25:</strong> Pauze met netwerkstructuur (tafelgesprekken)</li>
<li><strong>11:25 – 12:30:</strong> Parallelle werkgroepen of verdiepingssessies</li>
<li><strong>12:30 – 12:45:</strong> Plenaire terugkoppeling en afsluiting</li>
</ol>

<h2>Veelgestelde vragen</h2>
<h3>Hoe lang mag een presentatie maximaal duren?</h3>
<p>Vijfentwintig minuten is de bovengrens voor een plenaire presentatie zonder interactie. Daarna daalt de concentratie aantoonbaar. Gebruik live polls of Q&A momenten om de betrokkenheid na twintig minuten opnieuw te activeren. Voor kleinere workshops of werkgroepen kun je tot negentig minuten gaan mits er voldoende wisseling in werkvorm is.</p>
<h3>Moet ik het programma publiceren voor deelnemers?</h3>
<p>Ja, altijd. Deelnemers die vooraf weten wat ze kunnen verwachten zijn beter voorbereid, stellen betere vragen en zijn mentaal aanwezig. Publiceer het programma minimaal vijf werkdagen voor het evenement via de bevestigingsmail en op de evenementspagina.</p>
<h3>Wat doe ik als een spreker uitvalt op de dag zelf?</h3>
<p>Zorg voor een standaard uitwijkplan: een inhoudelijk verantwoordelijke van je eigen organisatie die een korte sessie kan verzorgen, een interactieve werkgroepvorm die je altijd achter de hand hebt, of een groepsgesprek met een goede gespreksstructuur. Communiceer transparant naar de zaal en frame het als kans voor meer diepgang in de groep.</p>`,
    },

    // ─── ARTIKEL 3: Live Q&A bij evenementen ───────────────────────────────────
    {
      slug: "live-qa-evenementen",
      title: "Live Q&A bij evenementen: zo doe je het goed in 2026",
      excerpt: "Een goede live Q&A geeft elke deelnemer een stem, niet alleen de luidste persoon in de zaal. Praktische tips om Q&A te laten werken voor welzijnsbijeenkomsten.",
      categoryId: c["evenementen-organiseren"],
      status: "published",
      publishedAt: new Date("2026-02-18"),
      updatedAt: new Date("2026-02-18"),
      readingTime: 8,
      tags: ["live Q&A", "interactie", "evenement", "deelnemers"],
      metaTitle: "Live Q&A bij evenementen: zo doe je het goed | Bijeen",
      metaDescription: "Live Q&A tools maken evenementen inclusiever en interactiever. Leer hoe je digitale Q&A inzet bij welzijnsbijeenkomsten voor meer betrokkenheid.",
      relatedArticles: ["evenementenprogramma-maken", "live-polls-evenementen", "checklist-welzijnsevenement"],
      content: `<h2>De paradox van de vragenronde</h2>
<p>In vrijwel elke bijeenkomst die ik bijwoon hoor ik dezelfde drie personen aan het woord. Niet omdat zij de meest relevante vragen hebben. Maar omdat zij het meest comfortabel zijn met een microfoon en een zaal van honderd mensen die naar hen kijken. De rest zit met een vraag die net zo relevant is, en zwijgt.</p>
<p>Live Q&A via digitale tools lost precies dit probleem op. Iedereen kan anoniem of op naam een vraag intypen. De zaal of de organisatie stemt op de beste vragen. De spreker beantwoordt wat écht leeft, niet wat het luidst geformuleerd werd.</p>

<h2>Waarom klassieke handsopsteken niet werkt</h2>
<p>Bij Stichting de Baan organiseerde ik regelmatig scholingsbijeenkomsten voor hulpverleners. Mensen die dagelijks moeilijke gesprekken voeren zijn soms verbazingwekkend terughoudend in een grote groep. De angst om een domme vraag te stellen, de hiërarchie in de zaal, de tijdsdruk: het zijn allemaal factoren die bijdragen aan een scheve verdeling van participatie.</p>
<p>Digitale Q&A verwijdert de sociale drempel. De vraag is er. Hij staat op het scherm. De spreker kan hem niet negeren.</p>

<h2>Hoe je live Q&A opzet in drie stappen</h2>
<h3>Stap 1: kies het juiste moment</h3>
<p>Niet elke sessie leent zich voor Q&A. Een korte welkomstwoord niet. Een langere presentatie van veertig minuten wel. Activeer de Q&A vijf minuten voor het einde van een presentatie, zodat deelnemers al vragen kunnen indienen terwijl de spreker nog bezig is.</p>
<h3>Stap 2: introduceer het tool actief</h3>
<p>Zeg letterlijk: "Je kunt nu via je telefoon een vraag stellen. Ga naar bijeen.app/evenement of scan de QR code op het scherm. Je vraag verschijnt direct op mijn scherm." Deelnemers die dit nog nooit hebben gedaan hebben een expliciete uitnodiging nodig.</p>
<h3>Stap 3: modereer zichtbaar</h3>
<p>Laat een tweede persoon de vragen modereren terwijl de spreker praat. Die persoon filtert op relevantie, sorteert op stemmen en geeft de spreker de twee of drie meest gestimde vragen op het juiste moment. Dat geeft structuur en voorkomt dat de Q&A ontaardt in een lijstje opmerkingen zonder vragen.</p>

<h2>Wat je doet met vragen die niet beantwoord worden</h2>
<p>Bij een volle agenda blijven er altijd vragen over. Wat ik doe: exporteer de vragenbundel na afloop en verwerk ze in een FAQ document dat je deelt met alle deelnemers. Dat geeft waarde aan iedereen die een vraag heeft gesteld, ook als die vraag niet live aan bod is gekomen.</p>
<p>Bijeen.app exporteert de complete Q&A log na het evenement als onderdeel van de impactmodule. Zodat je de meest gestelde vragen kunt terugzien en verwerken in je volgende communicatie.</p>

<h2>Anoniem of op naam?</h2>
<p>Ik adviseer altijd om deelnemers de keuze te geven. Sommige vragen zijn gevoelig, zeker in de zorg en welzijnssector waar mensen soms vragen over cliëntensituaties of interne spanningen willen ventileren. De optie voor anonimiteit verlaagt de drempel significant zonder dat het de kwaliteit van de vragen schaadt.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hebben deelnemers een account nodig voor live Q&A?</h3>
<p>Bij Bijeen.app niet. Deelnemers scannen een QR code of gaan naar een directe link en kunnen direct beginnen met vragen stellen. Geen app download, geen account aanmaken. Dat is bewust zo ontworpen omdat elke extra stap de participatie verlaagt.</p>
<h3>Wat als deelnemers ongepaste vragen stellen?</h3>
<p>Via de moderatiefunctie kan de organisator vragen verwijderen of markeren voor naderhand. In de praktijk komt dit nauwelijks voor bij welzijnsevenementen. De zaal is doorgaans professioneel en de digitale context schept voldoende sociale norm.</p>
<h3>Werkt live Q&A ook bij kleine groepen van tien tot vijftien personen?</h3>
<p>Ja, en soms juist dan het beste. In kleine groepen durft niet iedereen te spreken, ook al is de sfeer informeel. Digitale Q&A geeft juist de stillere deelnemers een stem. Ik gebruik het bij elke bijeenkomst, ongeacht de groepsgrootte.</p>`,
    },

    // ─── ARTIKEL 4: Live polls tijdens evenementen ─────────────────────────────
    {
      slug: "live-polls-evenementen",
      title: "Live polls tijdens evenementen: meer dan een leuk trucje",
      excerpt: "Live polls zijn geen entertainment. Ze zijn een directe meting van wat er leeft in de zaal en een stuurinstrument voor sprekers en moderatoren. Zo gebruik je ze effectief.",
      categoryId: c["evenementen-organiseren"],
      status: "published",
      publishedAt: new Date("2026-03-05"),
      updatedAt: new Date("2026-03-05"),
      readingTime: 7,
      tags: ["live polls", "interactie", "evenement", "betrokkenheid"],
      metaTitle: "Live polls tijdens evenementen: tips en tools 2026 | Bijeen",
      metaDescription: "Live polls verhogen de betrokkenheid bij evenementen en geven directe inzichten. Praktische gids voor welzijnsorganisaties die meer uit hun bijeenkomsten willen halen.",
      relatedArticles: ["live-qa-evenementen", "evenementenprogramma-maken", "impact-meten-welzijnsevenement"],
      content: `<h2>Niemand is echt aanwezig als hij alleen maar zit te luisteren</h2>
<p>Ik gebruik live polls al jarenlang en de reactie is altijd hetzelfde: deelnemers kijken op van hun telefoon, kijken naar het scherm, kijken naar elkaar. Er ontstaat een gezamenlijk moment. Niet de spreker bepaalt de richting van het gesprek, maar de collectieve mening van de zaal.</p>
<p>Dat is precies de verschuiving die ik zoek bij elke bijeenkomst. Van presentatie naar participatie. Van informeren naar activeren.</p>

<h2>Drie typen polls die altijd werken</h2>
<h3>De nulmeting aan het begin</h3>
<p>Stel aan het begin van een sessie een vraag over de beginsituatie van je deelnemers: "Hoe vertrouwd ben jij met digitale check-in tools?" of "Wat is jouw grootste uitdaging bij het organiseren van evenementen?" Je krijgt direct zicht op de kennis en het verwachtingsniveau in de zaal, en je spreker kan zijn of haar inhoud daarop aanpassen.</p>
<h3>De controlevraag halverwege</h3>
<p>Na twintig tot dertig minuten inhoud stel je een vraag die test of de kernboodschap is overgekomen. Niet als tentamen maar als calibratie. Als zestig procent van de zaal een verkeerd antwoord geeft, is dat waardevolle informatie voor de rest van de sessie.</p>
<h3>De sentimentpoll aan het einde</h3>
<p>Sluit elke sessie af met één vraag: "Wat ga jij morgen anders doen na deze sessie?" of "Hoe beoordeel je deze sessie op een schaal van één tot vijf?" Dat geeft je directe kwaliteitsdata voor je impactrapportage zonder aparte enquêtevragen nodig te hebben.</p>

<h2>Hoe je polls integreert zonder de presentatie te onderbreken</h2>
<p>De grootste fout die ik zie: organisatoren kondigen een poll aan, wachten tot iedereen heeft gestemd en maken dan een lange pauze voor de resultaten. Dat breekt de energie.</p>
<p>Beter: activeer de poll, laat de spreker doorpraten terwijl de resultaten binnenkomen en presenteer de uitslag op een moment dat het in het verhaal past. "Ik vroeg jullie net wie al ervaring heeft met digitale check-in. Kijk: drieëntachtig procent nog nooit. Dan ga ik mijn uitleg aanpassen."</p>

<h2>Polls als onderdeel van je impactrapportage</h2>
<p>Bij Bijeen.app worden alle polluitslagen automatisch opgeslagen en gekoppeld aan het evenement. Dat betekent dat je na afloop een overzicht hebt van hoe de zaal dacht over specifieke thema's. Dat is waardevolle data voor je opdrachtgever of subsidiegever, en het maakt je impactrapport een stuk concreter dan een algemene tevredenheidscore.</p>
<blockquote><p>Een poll is geen entertainment. Een poll is een meting. En meting is de basis van impact.</p></blockquote>

<h2>Veelgestelde vragen</h2>
<h3>Hoeveel polls gebruik ik per sessie van zestig minuten?</h3>
<p>Twee tot drie polls zijn het optimum voor een sessie van zestig minuten. Meer dan dat wordt een gimmick en minder dan dat laat kansen liggen. Gebruik één poll aan het begin, één halverwege en één aan het einde als minimale structuur.</p>
<h3>Kunnen deelnemers de uitslag live zien op het scherm?</h3>
<p>Ja, en dat is ook de bedoeling. De zichtbaarheid van de collectieve mening in realtime is precies wat de energie in de zaal verandert. Deelnemers zijn nieuwsgierig naar hoe hun mening zich verhoudt tot die van de groep.</p>
<h3>Werkt een poll ook goed als er veel oudere deelnemers aanwezig zijn?</h3>
<p>In mijn ervaring: ja. De drempel is lager dan je denkt. Een QR code scannen en op een knop drukken is voor de meeste mensen toegankelijk. Zorg wel voor een goede introductie en een duidelijke QR code op het scherm. Heb altijd een assistent beschikbaar die mensen kan helpen die niet weten hoe het werkt.</p>`,
    },

    // ─── ARTIKEL 5: Netwerkevenement organiseren ───────────────────────────────
    {
      slug: "netwerkevenement-organiseren",
      title: "Netwerkevenement organiseren: hoe je echte verbindingen faciliteert",
      excerpt: "Een netwerkevenement is geslaagd als mensen weggaan met een contact dat er écht toe doet, niet met een stapel visitekaartjes. Zo bouw je de juiste structuur.",
      categoryId: c["evenementen-organiseren"],
      status: "published",
      publishedAt: new Date("2026-03-22"),
      updatedAt: new Date("2026-03-22"),
      readingTime: 9,
      tags: ["netwerken", "verbinding", "evenement", "matching"],
      metaTitle: "Netwerkevenement organiseren: tips voor welzijnsorganisaties | Bijeen",
      metaDescription: "Hoe organiseer je een netwerkevenement waarbij echte verbindingen ontstaan? Praktische aanpak voor welzijnsorganisaties met digitale netwerkkoppeling.",
      relatedArticles: ["evenementenprogramma-maken", "checklist-welzijnsevenement", "vrijwilligers-werven-evenementen"],
      content: `<h2>Het probleem met netwerken</h2>
<p>Er is iets grondig mis met de manier waarop de meeste netwerkevenementen zijn opgezet. Je komt binnen, je krijgt een borrel, je praat met de twee mensen die toevallig naast je staan en je gaat naar huis met het gevoel dat je tijd had kunnen gebruiken voor iets productievers. De kans dat je de mensen hebt ontmoet die écht relevant zijn voor jouw werk? Nihil.</p>
<p>Dat is geen toeval. Dat is structuurvacuüm. Mensen zijn niet van nature goede netwerkers. Ze hebben structuur nodig: een aanleiding, een gedeeld onderwerp, een beperkte tijdsduur en een sociale norm die het gesprek gemakkelijk maakt.</p>

<h2>Geleide matching werkt beter dan toevallige ontmoetingen</h2>
<p>Bij de ontwikkeling van Bijeen.app heb ik veel geleerd van mijn ervaring met Platform DAAR, een vrijwilligersmatchingplatform dat AI inzet om vrijwilligers te koppelen aan projecten op basis van interesses en vaardigheden. Dezelfde logica geldt voor netwerkevenementen: als je vooraf weet wie aanwezig is en wat hun interesses zijn, kun je gerichte koppels maken in plaats van te hopen op toeval.</p>
<p>Bij Stichting de Baan organiseerde ik een netwerkmiddag voor tweehonderd welzijnsprofessionals waarbij we vooraf profielen verzamelden via het registratieformulier. Drie specifieke vragen: wat is jouw vakgebied, welke uitdaging wil jij bespreken, en met welk type professional zoek je contact? Op basis van die antwoorden genereerden we vijf à zes suggested matches per deelnemer, weergegeven op hun telefoon bij aankomst.</p>
<p>Het resultaat: gemiddeld 2,8 new genuine connections per deelnemer versus 0,9 bij een vergelijkbaar evenement zonder geleide matching. Dat meten we overigens in de follow-up enquête, wat meteen een mooie impactindicator is voor je rapportage.</p>

<h2>De drie ingrediënten van een geslaagd netwerkevenement</h2>
<h3>Gedeelde context</h3>
<p>Mensen verbinden het gemakkelijkst als ze een gedeeld referentiekader hebben. Een gezamenlijke presentatie vooraf, een specifiek thema of een probleem dat iedereen kent. Dat geeft gesprekken een aanleiding en voorkomt de ongemakkelijke stilte van "dus... wat doe jij?"</p>
<h3>Gestructureerde ontmoetingstijd</h3>
<p>Vrij rondbewegen werkt niet. Speed dating formats, tafelroulaties of guided conversation rounds werken beter. De meest effectieve format die ik ken: tafels van vier personen, dertig minuten, één gespreksonderwerp op de tafel. Daarna roteert de helft van de deelnemers. In negentig minuten heb je dan zes tot acht betekenisvolle gesprekken gevoerd.</p>
<h3>Een concrete vervolgstap</h3>
<p>Sluit elk netwerkgesprek af met een concrete actie: een vervolgafspraak, een gedeeld document, een uitwisseling van contactgegevens via het platform. Vage beloften van "we bellen nog" worden zelden ingevuld. Een concrete afspraak in je agenda wel.</p>

<h2>Digitale ondersteuning bij netwerken</h2>
<p>Bijeen.app ondersteunt geleide matching via het registratieproces. Deelnemers vullen bij aanmelding hun profiel in en ontvangen bij check-in een overzicht van mensen die het best bij hen passen. Dat maakt de gesprekken gerichter en het netwerken minder stressvol voor de introvertere deelnemers die doorgaans de waardevolste bijdragen leveren maar het moeilijkst de stap zetten.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoe lang moet een netwerksessie duren?</h3>
<p>Negentig minuten is het minimum voor gestructureerd netwerken met echte uitkomsten. Korter dan dat is te snel voor betekenisvolle gesprekken. Langer dan twee uur wordt sociaal vermoeiend. De sweet spot is negentig tot honderdtwintig minuten met een duidelijke gespreksstructuur.</p>
<h3>Hoe stimuleer ik deelnemers om ook met onbekenden te praten?</h3>
<p>Bouw het in als programmaonderdeel, niet als vrijwillige activiteit. Als je expliciete tafels maakt met een roulatieschema, hoeft niemand zelf de stap te zetten om naar een onbekende toe te gaan. De structuur doet het voor hen.</p>
<h3>Hoe verwerk ik de netwerkdata in mijn impactrapportage?</h3>
<p>Vraag in de post-event enquête specifiek naar het aantal nieuwe contacten en de kwaliteit van de gesprekken. Bijeen.app registreert automatisch welke matches zijn gemaakt en of deelnemers een bericht hebben uitgewisseld na het evenement. Dat zijn harde indicatoren voor je rapportage richting subsidiegevers.</p>`,
    },

    // ─── ARTIKEL 6: Deelnemersbeheer grote evenementen (pillar) ───────────────
    {
      slug: "deelnemersbeheer-grote-evenementen",
      title: "Deelnemersbeheer bij grote welzijnsevenementen: van registratie tot check-in",
      excerpt: "Bij 700 deelnemers houdt Excel op met werken. Hoe je deelnemersbeheer professioneel aanpakt zonder extra administratieve last, gebaseerd op jarenlange praktijkervaring.",
      categoryId: c["deelnemersbeheer"],
      status: "published",
      publishedAt: new Date("2026-01-28"),
      updatedAt: new Date("2026-01-28"),
      readingTime: 13,
      tags: ["deelnemersbeheer", "registratie", "check-in", "evenement"],
      metaTitle: "Deelnemersbeheer grote evenementen: complete gids | Bijeen",
      metaDescription: "Professioneel deelnemersbeheer voor welzijnsevenementen. Van registratie tot check-in en impactrapportage. Gebaseerd op ervaring met 700 deelnemers.",
      relatedArticles: ["qr-code-check-in-evenement", "checklist-welzijnsevenement", "gdpr-evenementen-welzijnsorganisatie"],
      content: `<h2>Wanneer Excel ophoudt te werken</h2>
<p>Toen ik directeur was bij Stichting de Baan organiseerden we twee keer per jaar een groot netwerkcongres voor de welzijnssector in onze regio. Begonnen met vijftig deelnemers en een simpele aanmeldlijst in Google Sheets. Na drie jaar: zevenhonderd deelnemers, honderdtachtig vrijwilligers, acht parallelle sessies en een check-in die al drie keer fout was gegaan omdat de Excel niet op tijd gesynchroniseerd was met de definitieve aanmeldingen.</p>
<p>Dat laatste keer kost je als organisatie geloofwaardigheid bij precies de mensen die je nodig hebt. Deelnemers die met hun naam op een lijst staan maar er niet in gevonden worden bij de ingang. Vrijwilligers die niet weten in welke sessie ze zijn ingedeeld. Sprekers die geen overzicht hebben van wie er in de zaal zit.</p>
<p>Deelnemersbeheer is de onzichtbare ruggengraat van elk evenement. Als het goed gaat merkt niemand het. Als het fout gaat is iedereen er direct mee bezig.</p>

<h2>De vier fases van deelnemersbeheer</h2>
<h3>Fase 1: registratie</h3>
<p>Een goed registratieproces begint met een duidelijke aanmeldpagina die op elk apparaat werkt. Niet alleen op desktop. Zevenenvijftig procent van alle aanmeldingen bij welzijnsevenementen wordt gedaan op een mobiel apparaat, gebaseerd op data uit Bijeen.app. Een formulier dat op mobiel niet goed werkt kost je gemiddeld twintig procent van de potentiële aanmeldingen.</p>
<p>Wat een goed aanmeldformulier bevat:</p>
<ul>
<li>Naam en emailadres (verplicht)</li>
<li>Organisatienaam en functie (verplicht voor B2B events)</li>
<li>Dieetwensen en toegankelijkheidsbehoeften (optioneel, altijd aanbieden)</li>
<li>Sessiekeuze bij parallelle programma's</li>
<li>Twee tot drie profielvragen voor netwerkkoppeling (optioneel)</li>
<li>AVG toestemming en privacyverklaring (verplicht, zie ook GDPR artikel in de kennisbank)</li>
</ul>
<h3>Fase 2: communicatie voor het evenement</h3>
<p>Na registratie begint de communicatiefase. Dit is waar de meeste organisaties te weinig structuur hebben. Een bevestigingsmail op het moment van registratie, een herinnering drie dagen voor het evenement en een dag-van bericht zijn het absolute minimum.</p>
<p>Elk van die berichten heeft een specifieke functie:</p>
<ul>
<li><strong>Bevestigingsmail:</strong> bewijs van aanmelding, praktische informatie, eventuele voorbereiding</li>
<li><strong>Herinnering drie dagen voor:</strong> programmaoverzicht, locatie, parkeermogelijkheden, check-in instructies</li>
<li><strong>Dag-van bericht:</strong> QR code voor check-in, contactnummer voor last-minute vragen, eventuele wijzigingen</li>
</ul>
<p>De QR code in het dag-van bericht is een gamechanger. Bij evenementen die dit gebruiken is de check-in snelheid gemiddeld viermaal hoger dan bij papieren lijsten, en het percentage "deelnemer niet gevonden" daalt van acht procent naar minder dan één procent.</p>
<h3>Fase 3: check-in op de dag zelf</h3>
<p>Dit is het moment van de waarheid. Alles wat je in de voorbereiding hebt gedaan, wordt hier zichtbaar. Of onzichtbaar, als je het goed hebt gedaan.</p>
<p>Bij evenementen tot vijftig deelnemers kun je werken met een eenvoudige digitale lijst op een tablet. Bij vijftig tot tweehonderd deelnemers adviseer ik twee check-in stations. Boven de tweehonderd: minimaal één station per vijftig deelnemers dat parallel kan werken.</p>
<p>De drie regels voor een soepele check-in:</p>
<ol>
<li><strong>Test de techniek op de locatie</strong> met de daadwerkelijke internetverbinding, minimaal de dag voor het evenement</li>
<li><strong>Heb altijd een offline backup</strong> die bijgewerkt is tot maximaal vier uur voor het evenement</li>
<li><strong>Briefing van het team</strong> zodat iedereen dezelfde procedure volgt en weet wat te doen bij afwijkingen</li>
</ol>
<h3>Fase 4: aanwezigheidsregistratie en naverwerking</h3>
<p>Na het evenement wil je een definitieve presentielijst met check-in tijden. Dat is niet alleen voor je eigen administratie. Het is ook de basis van je impactrapportage: hoeveel procent van de aangemelde deelnemers is daadwerkelijk gekomen, op welk moment kwamen de meeste mensen binnen, hoeveel deelnemers kwamen van buiten de regio.</p>
<p>Bij Bijeen.app wordt de presentielijst automatisch gegenereerd zodra de check-in is afgerond. Exporteerbaar als CSV voor je eigen administratie en als geaggregeerde data voor het WMO impactrapport.</p>

<h2>Speciale situaties in deelnemersbeheer</h2>
<h3>Wachtlijsten</h3>
<p>Activeer de wachtlijstfunctie zodra een evenement vol is. Wachtlijst deelnemers automatisch informeren bij beschikkomende plekken. Stel een deadline in voor wachtlijst bevestigingen om no-shows te minimaliseren. Bij grote evenementen verwacht je gemiddeld tien tot vijftien procent no-show, dus houd een wachtlijst van die omvang aan.</p>
<h3>Last-minute aanmeldingen</h3>
<p>Bepaal vooraf of je last-minute aanmeldingen accepteert en zo ja tot hoe laat. Bij catering en materialen is de cutoff meestal twee werkdagen van tevoren. Voor de check-in zelf maakt het niet uit als je een digitaal systeem gebruikt: deelnemers die zich de ochtend van het evenement aanmelden zijn gewoon vindbaar in het systeem.</p>
<h3>Groepsregistraties</h3>
<p>Organisaties die tien of meer medewerkers aanmelden doen dit het liefst in bulk, niet via tien aparte formulieren. Bied een upload optie aan voor CSV bestanden of een groepsregistratielink waarbij één contactpersoon namens de hele groep kan aanmelden.</p>

<h2>GDPR en deelnemersbeheer</h2>
<p>Alle data die je verzamelt bij registratie valt onder de AVG. Dat betekent: expliciete toestemming voor elk gebruiksdoel, bewaarplicht van maximaal één jaar na het evenement voor niet-financiële data en het recht van deelnemers om hun data in te zien of te verwijderen. Zie het GDPR artikel in onze kennisbank voor een complete checklist.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoeveel medewerkers heb ik nodig voor de check-in van tweehonderd deelnemers?</h3>
<p>Bij digitale check-in met QR codes: twee tot drie medewerkers voor tweehonderd deelnemers, aannemende dat deelnemers gespreid binnenkomen in een tijdsvenster van dertig minuten. Bij gelijktijdige aankomst (zoals bij een congres met vaste starttijd) reken ik op één medewerker per veertig deelnemers per halfuur.</p>
<h3>Wat doe ik als een deelnemer zijn QR code niet meer kan vinden?</h3>
<p>Zoek op naam in het digitale systeem. Dat is altijd de backup. Bij twijfel over identiteit vraag je naar de email waarmee aangemeld is. Zorg dat het check-in systeem altijd zoeken op naam ondersteunt, ook als de QR code niet beschikbaar is.</p>
<h3>Mag ik deelnemersinformatie delen met sprekers of sponsors?</h3>
<p>Alleen als je daarvoor expliciete toestemming hebt gevraagd bij de aanmelding. Een standaard deelnemersregistratie geeft je niet het recht om namen en emailadressen door te geven aan derden. Voeg altijd een specifieke toestemmingsvraag toe als je deelnemersinformatie wilt gebruiken voor marketing of partneringcommunicatie.</p>`,
    },

    // ─── ARTIKEL 7: QR code check-in ──────────────────────────────────────────
    {
      slug: "qr-code-check-in-evenement",
      title: "QR code check-in bij evenementen: zo werkt het in de praktijk",
      excerpt: "38% van de check-in links via email mislukt op mobiel. QR codes lossen dat probleem op en maken je check-in sneller, netter en aantoonbaar betrouwbaarder.",
      categoryId: c["deelnemersbeheer"],
      status: "published",
      publishedAt: new Date("2026-02-14"),
      updatedAt: new Date("2026-02-14"),
      readingTime: 8,
      tags: ["QR code", "check-in", "deelnemersbeheer", "digitaal"],
      metaTitle: "QR code check-in evenement: praktijkgids 2026 | Bijeen",
      metaDescription: "QR code check-in maakt evenementregistratie sneller en betrouwbaarder. Leer hoe je het opzet voor welzijnsevenementen van elke omvang.",
      relatedArticles: ["deelnemersbeheer-grote-evenementen", "digitaal-inchecken-vs-papieren-lijst", "checklist-welzijnsevenement"],
      content: `<h2>Waarom 38% van je check-in links faalt</h2>
<p>Toen ik directeur was bij Stichting de Baan stuurden we de week voor ons jaarcongres een email met een persoonlijke link naar elke deelnemer. Klik op de link, laat je scherm zien bij de ingang, klaar. Eenvoudig bedacht op desktop. In de praktijk: een derde van de deelnemers had de link niet meer kunnen vinden op hun telefoon, de link was verlopen of de email was in spam terechtgekomen.</p>
<p>We hadden een rij van twintig minuten bij de ingang van ons eigen evenement. Terwijl het programma al was begonnen.</p>
<p>QR codes lossen dit op. Niet door technische magie, maar door eenvoud: één code per deelnemer, zichtbaar in het dag-van bericht, scanbaar in minder dan twee seconden. De check-in is gedaan voordat de deelnemer zijn jas nog heeft uitgetrokken.</p>

<h2>Hoe QR check-in technisch werkt</h2>
<p>Elk QR code bevat een unieke identifier die gekoppeld is aan de registratie van de deelnemer. Wanneer een medewerker de code scant met een smartphone of tablet, stuurt het systeem de deelnemer op aanwezig en registreert het exacte tijdstip. Dat alles in realtime, zichtbaar op alle apparaten die zijn verbonden met hetzelfde evenement.</p>
<p>Wat je nodig hebt:</p>
<ul>
<li>Een registratieplatform dat QR codes genereert per deelnemer</li>
<li>Eén of meer scanapparaten (smartphones met de Bijeen app of een webbrowser)</li>
<li>Een internetverbinding op de locatie (maar ook offline werking als backup)</li>
<li>De QR code in de bevestigingsmail of dag-van bericht aan deelnemers</li>
</ul>

<h2>Stap voor stap opzetten</h2>
<h3>Stap 1: activeer QR check-in in je evenementinstellingen</h3>
<p>Bij Bijeen.app genereer je automatisch QR codes zodra je de check-in module activeert. Elke deelnemer die zich aanmeldt krijgt bij zijn of haar bevestigingsmail een persoonlijke QR code mee.</p>
<h3>Stap 2: stuur de QR code opnieuw in het dag-van bericht</h3>
<p>Verwacht niet dat deelnemers hun bevestigingsmail nog hebben. Stuur de dag van het evenement een kort bericht met de QR code prominent zichtbaar en een duidelijke instructie: "Laat deze code zien bij de ingang."</p>
<h3>Stap 3: stel de scanstations in op de locatie</h3>
<p>Open Bijeen op een tablet of smartphone, navigeer naar het juiste evenement en activeer de check-in scanner. Je kunt meerdere apparaten tegelijk gebruiken voor parallelle check-in stromen.</p>
<h3>Stap 4: zorg voor een offline backup</h3>
<p>Download de deelnemerslijst voor offline gebruik. Als de internetverbinding wegvalt, kun je nog steeds inchecken via de lokale kopie. Bij herstel van de verbinding synchroniseert het systeem automatisch.</p>

<h2>Wat te doen als deelnemers de QR code niet hebben</h2>
<p>Altijd zoeken op naam. Dat is de eerste fallback. Is de naam niet gevonden? Zoek op emailadres. Staat de persoon helemaal niet in het systeem? Voeg hem of haar handmatig toe als walk-in deelnemer. Dat duurt vijf seconden en houdt je presentielijst accuraat.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hebben deelnemers een smartphone nodig voor QR check-in?</h3>
<p>Nee, de deelnemer hoeft geen smartphone te hebben. Het is de medewerker aan het check-in station die scant. De deelnemer toont zijn scherm (of een uitgeprinte QR code) en de medewerker scant. Deelnemers zonder smartphone kunnen altijd op naam worden ingecheckt.</p>
<h3>Wat als meerdere deelnemers op hetzelfde moment aankomen?</h3>
<p>Parallelle check-in stations oplossen dit. Met twee tablets en twee medewerkers kun je comfortabel honderd deelnemers per halfuur verwerken. Bij grotere evenementen schaal je het aantal stations op.</p>
<h3>Is de QR code persoonsgebonden of kan iemand anders hem gebruiken?</h3>
<p>De QR code is persoonsgebonden en eenmalig bruikbaar. Zodra een code is gescand wordt hij gemarkeerd als gebruikt en kan hij niet opnieuw worden ingezet. Dat voorkomt misbruik en geeft je een accurate presentielijst.</p>`,
    },

  ]);

  console.log("✅ Batch 1 (artikelen 1-7) geseed.");

  // ─── BATCH 2: artikelen 8-14 ──────────────────────────────────────────────
  await db.insert(knowledgeBaseArticles).values([

    // ARTIKEL 8: Digitaal vs papier
    {
      slug: "digitaal-inchecken-vs-papieren-lijst",
      title: "Digitaal inchecken vs papieren lijst: eerlijk vergeleken",
      excerpt: "Papier is vertrouwd maar foutgevoelig. Digitaal is snel maar vraagt voorbereiding. Welke methode past bij jouw evenement? Een eerlijk overzicht.",
      categoryId: c["deelnemersbeheer"],
      status: "published",
      publishedAt: new Date("2026-03-12"),
      updatedAt: new Date("2026-03-12"),
      readingTime: 7,
      tags: ["check-in", "digitaal", "papier", "vergelijking"],
      metaTitle: "Digitaal inchecken vs papieren lijst voor evenementen | Bijeen",
      metaDescription: "Vergelijking tussen digitale en papieren check-in voor evenementen. Kosten, snelheid, betrouwbaarheid en AVG compliance vergeleken.",
      relatedArticles: ["qr-code-check-in-evenement", "deelnemersbeheer-grote-evenementen"],
      content: `<h2>De papieren lijst als valkuil</h2>
<p>Ik heb de papierchaos van dichtbij meegemaakt. Drie versies van dezelfde lijst in omloop. Iemand die bij de ingang had geschreven dat een deelnemer was gekomen terwijl die dezelfde ochtend had afgemeld. Een rapportage achteraf die niet klopte met de werkelijkheid. En uiteindelijk een subsidiegever die vroeg om bewijs van aanwezigheid dat we niet konden leveren.</p>
<p>Papier heeft één groot voordeel: het werkt altijd. Geen stroom nodig, geen internet, geen applicatie die crasht. Maar papier heeft ook drie grote nadelen: het is foutgevoelig, moeilijk te verwerken achteraf en biedt geen realtime zicht op wie er aanwezig is.</p>

<h2>Vergelijking op vijf criteria</h2>
<h3>Snelheid bij check-in</h3>
<p><strong>Papier:</strong> Zoeken op naam in een alfabetische lijst duurt gemiddeld tien tot vijftien seconden per persoon. Bij een groep van tweehonderd mensen die gelijktijdig aankomen leidt dit tot rijen.</p>
<p><strong>Digitaal:</strong> Scannen van een QR code duurt twee seconden. Zoeken op naam in een digitaal systeem is sneller dan in een papieren lijst vanwege autocomplete. Gemiddelde check-in tijd: drie tot vijf seconden.</p>
<h3>Betrouwbaarheid van de data</h3>
<p><strong>Papier:</strong> Handschrift wordt soms verkeerd gelezen. Dubbele inschrijvingen worden niet automatisch gesignaleerd. Wijzigingen achteraf zijn moeilijk traceerbaar.</p>
<p><strong>Digitaal:</strong> Elke check-in wordt automatisch geregistreerd met tijdstempel. Wijzigingen worden gelogd. De definitieve presentielijst is altijd actueel.</p>
<h3>AVG compliance</h3>
<p><strong>Papier:</strong> Een papieren lijst met namen en handtekeningen is een fysiek document met persoonsgegevens. Opslag, beveiliging en vernietiging vallen onder de AVG. In de praktijk wordt dit zelden goed geregeld.</p>
<p><strong>Digitaal:</strong> Gegevens worden opgeslagen in een beveiligd systeem met automatische verwijdering na de bewaarperiode. Exportmogelijkheden voor het verwerkingsregister. Eenvoudiger te verantwoorden bij een AVG audit.</p>
<h3>Impactrapportage</h3>
<p><strong>Papier:</strong> De presentielijst moet handmatig worden overgetypt voor rapportage. Dat kost tijd en introduceert fouten.</p>
<p><strong>Digitaal:</strong> Directe export naar CSV of PDF. Koppelbaar aan het impactrapport. Check-in tijden zijn automatisch beschikbaar voor analyse.</p>
<h3>Kosten en complexiteit</h3>
<p><strong>Papier:</strong> Bijna gratis. Maar de administratieve kosten achteraf zijn verborgen. Tel de uren op voor verwerking en je zit snel op twintig tot dertig euro per evenement aan arbeidstijd.</p>
<p><strong>Digitaal:</strong> Vraagt een investering in software en een korte leercurve. Maar de tijdsbesparing rechtvaardigt de kosten bij evenementen met meer dan vijftig deelnemers.</p>

<h2>Mijn aanbeveling</h2>
<p>Voor evenementen tot dertig deelnemers: een eenvoudige digitale lijst op een tablet is voldoende. Geen QR codes nodig, gewoon naam opzoeken en vinkje zetten.</p>
<p>Voor dertig tot tweehonderd deelnemers: digitaal met QR check-in. De tijdsbesparing is significant en de rapportage is direct beschikbaar.</p>
<p>Boven de tweehonderd deelnemers: digitaal is geen keuze maar noodzaak. Papier schaalt niet en de foutmarge wordt onacceptabel.</p>
<p>Gebruik papier altijd als backup, nooit als primaire methode.</p>

<h2>Veelgestelde vragen</h2>
<h3>Wat als de internetverbinding wegvalt tijdens het evenement?</h3>
<p>Een goed digitaal systeem werkt ook offline. Bijeen.app slaat de deelnemerslijst lokaal op het apparaat op. Check-ins worden geregistreerd in de offline modus en gesynchroniseerd zodra de verbinding herstelt. Test dit altijd vooraf op de locatie.</p>
<h3>Hoe lang duurt het om een team te trainen op digitale check-in?</h3>
<p>Vijf minuten. De interface is ontworpen voor vrijwilligers zonder technische achtergrond. Eén korte uitleg voor het evenement is voldoende.</p>`,
    },

    // ARTIKEL 9: Automatische bevestigingen
    {
      slug: "automatische-bevestigingen-herinneringen",
      title: "Automatische bevestigingen en herinneringen: zo stel je ze in",
      excerpt: "Goede emailcommunicatie voor een evenement vermindert no-shows met 20 tot 30 procent. Dit zijn de berichten die je automatisch moet sturen en wat er in moet staan.",
      categoryId: c["deelnemersbeheer"],
      status: "published",
      publishedAt: new Date("2026-04-02"),
      updatedAt: new Date("2026-04-02"),
      readingTime: 7,
      tags: ["email", "communicatie", "herinneringen", "no-show"],
      metaTitle: "Automatische bevestigingen en herinneringen voor evenementen | Bijeen",
      metaDescription: "Automatische emailcommunicatie voor evenementen vermindert no-shows en verhoogt de betrokkenheid. Leer welke berichten je wanneer moet sturen.",
      relatedArticles: ["deelnemersbeheer-grote-evenementen", "qr-code-check-in-evenement"],
      content: `<h2>De stille waarde van goede emailcommunicatie</h2>
<p>Er is een directe relatie tussen de kwaliteit van je pre-event communicatie en de no-show rate bij je evenement. Organisaties die alleen een aanmeldbevestiging sturen zien gemiddeld vijftien tot twintig procent no-show. Organisaties die een gestructureerde communicatiereeks hanteren, inclusief herinneringen met praktische informatie, zitten op vijf tot acht procent.</p>
<p>Dat verschil is niet puur gedragspsychologie. Het zit ook in praktische drempels: deelnemers die niet weten hoe laat ze moeten komen, waar ze moeten parkeren of hoe de check-in werkt, haken vaker af. Goede communicatie voorkomt die drempels.</p>

<h2>De vier berichten die je altijd moet sturen</h2>
<h3>Bericht 1: bevestiging direct na aanmelding</h3>
<p>Stuur dit binnen dertig seconden na aanmelding. Niet binnen een uur. Direct. Dat geeft direct het gevoel van een professionele organisatie en zorgt dat de deelnemer zijn of haar aanmelding kan verifiëren.</p>
<p>Wat er in staat: bevestiging van aanmelding, datum en locatie, wat de deelnemer kan verwachten, contactgegevens voor vragen en eventueel de QR code als je die al genereert op moment van aanmelding.</p>
<h3>Bericht 2: herinnering met praktische informatie (drie tot vijf dagen voor)</h3>
<p>Dit is het meest informatieve bericht van de reeks. Deelnemers lezen dit als voorbereiding op het evenement.</p>
<p>Wat er in staat: programmaoverzicht, exacte locatie met route, parkeermogelijkheden, dieetopties, wat ze mee moeten nemen en de QR code voor check-in.</p>
<h3>Bericht 3: dag-van bericht</h3>
<p>Stuur dit de ochtend van het evenement tussen zeven en acht uur. Mensen lezen hun email in de ochtend. Dit bericht hoeft niet veel te bevatten maar moet de QR code prominent tonen en een duidelijke instructie geven: "Laat dit zien bij de ingang."</p>
<h3>Bericht 4: bedankmail na afloop</h3>
<p>Stuur dit dezelfde dag of uiterlijk de volgende ochtend. Bedank de deelnemer, deel een korte samenvatting of materialen en stuur een link naar de enquête. Dit bericht heeft de hoogste open-rate van alle vier: mensen zijn na het evenement nog in de stemming.</p>

<h2>Personalisatie zonder extra werk</h2>
<p>De kracht van geautomatiseerde berichten is dat ze persoonlijk aanvoelen terwijl ze volledig automatisch worden verzonden. Voornaam in de aanhef, naam van het evenement in de onderwerpregel, persoonlijke QR code in het dag-van bericht: dat zijn details die weinig instelling vergen maar de ontvanger het gevoel geven dat het bericht speciaal voor hem of haar is gemaakt.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoeveel herinneringen is te veel?</h3>
<p>Drie berichten in de periode voor het evenement is de bovengrens voor de meeste deelnemers. Meer dan dat wordt als spam ervaren, ook als de inhoud relevant is. Houd het bij bevestiging, herinnering met praktische informatie en dag-van bericht.</p>
<h3>Moet ik herinneringen ook sturen naar deelnemers op de wachtlijst?</h3>
<p>Ja, maar met andere inhoud. Wachtlijstdeelnemers willen weten of er nog een plek vrij komt. Stuur hen een statusupdate drie dagen voor het evenement en een definitief bericht twee dagen van tevoren als er geen plek meer beschikbaar is.</p>`,
    },

    // ARTIKEL 10: Impact meten welzijnsevenement (pillar)
    {
      slug: "impact-meten-welzijnsevenement",
      title: "Hoe meet je de impact van een welzijnsevenement? Complete gids",
      excerpt: "Impact aantonen is voor veel welzijnsorganisaties het moeilijkste onderdeel van evenementenorganisatie. Dit is de methodiek die werkt, zonder extra werkdruk.",
      categoryId: c["impact-en-rapportage"],
      status: "published",
      publishedAt: new Date("2026-01-08"),
      updatedAt: new Date("2026-01-08"),
      readingTime: 16,
      tags: ["impact", "rapportage", "WMO", "meting", "subsidie"],
      metaTitle: "Impact meten welzijnsevenement: complete gids 2026 | Bijeen",
      metaDescription: "Hoe meet je de maatschappelijke impact van een welzijnsevenement? Complete methodiek voor WMO rapportage, KPIs en impactrapportage voor subsidiegevers.",
      relatedArticles: ["kpis-welzijnsevenementen", "impactrapport-evenement", "checklist-welzijnsevenement"],
      content: `<h2>Het project dat wegviel omdat we de impact niet konden aantonen</h2>
<p>In mijn laatste jaar als directeur bij Stichting de Baan verloren we een subsidielijn van twaalfduizend euro voor een succesvol preventief gezondheidsproject. Niet omdat het project niet werkte. Niet omdat de gemeente ontevreden was. Maar omdat we de rapportage niet konden aanleveren in het format dat de subsidiegever vroeg.</p>
<p>Drieëntachtig deelnemers hadden aan het project meegedaan. Zeven van hen hadden op eigen initiatief contact gezocht met een hulpverlenende instantie na deelname. Vijftien anderen hadden een aantoonbare verbetering gerapporteerd in hun sociale netwerk. Dat was precies de impact die de subsidiegever had willen zien. Maar we hadden de data niet systematisch verzameld en konden het niet hard maken.</p>
<p>Dat project is een van de redenen waarom ik Bijeen.app heb gebouwd. Niet als registratietool. Als impactmachine.</p>

<h2>Waarom impactmeting zo moeilijk is in de welzijnssector</h2>
<p>Welzijnsimpact is inherent complex om te meten. Anders dan in de commerciële sector, waar omzet en conversie de primaire indicatoren zijn, gaat het in de welzijnssector om veranderingen in menselijk welzijn, sociale netwerken en maatschappelijke participatie. Die veranderingen zijn reëel maar zelden direct te kwantificeren op basis van één evenement.</p>
<p>Daarboven komt de tijdsdruk: organisaties die evenementen organiseren hebben zelden een aparte onderzoeker of evaluator in dienst. De organisator is ook de rapporteur, ook de uitvoerder en ook de contactpersoon voor de gemeente. Impactmeting wordt dan al snel het sluitstuk van een druk programma, in plaats van een integraal onderdeel.</p>
<p>De oplossing is niet meer meetinspanning. De oplossing is slimmer meten door de meting in te bouwen in het proces dat toch al plaatsvindt.</p>

<h2>Het drielagen model voor impactmeting</h2>
<h3>Laag 1: output (wat heb je gedaan)</h3>
<p>Dit is de makkelijkste laag en vormt de basis van elke rapportage. Hoeveel deelnemers, hoeveel sessies, welke organisaties vertegenwoordigd, hoeveel vrijwilligers ingezet. Deze data is beschikbaar via je registratie en check-in systeem zonder extra inspanning.</p>
<p>Voorbeeldmetrics voor output:</p>
<ul>
<li>Aantal aangemelde deelnemers</li>
<li>Aanwezigheidspercentage (check-ins / aanmeldingen)</li>
<li>Aantal vertegenwoordigde organisaties</li>
<li>Aantal sessies en workshopdeelnames</li>
<li>Geografische spreiding van deelnemers</li>
</ul>
<h3>Laag 2: outcome (wat is er veranderd bij deelnemers)</h3>
<p>Dit is de laag die de meeste subsidiegevers echt interesseert. Wat weten deelnemers meer dan voor het evenement? Wat hebben ze anders gedaan na deelname? Welke verbindingen zijn gelegd die er voor niet waren?</p>
<p>Outcome data verzamel je via twee instrumenten: een korte enquête direct na het evenement (maximale respons als je hem direct verzendt via het platform) en een follow-up enquête vier tot zes weken later (lagere respons maar hogere betrouwbaarheid voor gedragsverandering).</p>
<p>Voorbeeldvragen voor outcome meting:</p>
<ul>
<li>"Heb je als gevolg van dit evenement contact opgenomen met een andere organisatie?"</li>
<li>"Heb je kennis opgedaan die je direct kunt toepassen in je werk?"</li>
<li>"Ben je van plan een concrete actie te ondernemen op basis van wat je vandaag hebt gehoord?"</li>
<li>"Hoe beoordeel je de relevantie van dit evenement voor jouw dagelijkse praktijk?"</li>
</ul>
<h3>Laag 3: impact (wat heeft het opgeleverd voor de samenleving)</h3>
<p>De diepste laag en de moeilijkste te meten. Heeft de samenleving er beter van geworden? Zijn er minder mensen in een isolement geraakt, heeft de samenwerking tussen organisaties geleid tot betere zorgverlening, zijn er vrijwilligers actief geworden die anders aan de zijlijn waren gebleven?</p>
<p>Voor evenementen die ingebed zijn in een groter programma, zoals een WMO gesubsidieerd project, is impact meting op dit niveau mogelijk via langjarige monitoring. Voor losse evenementen is het realistischer om te werken met aannemelijke bijdragen aan maatschappelijke doelstellingen, onderbouwd met kwalitatieve verhalen en kwantitatieve indicatoren.</p>

<h2>Kwantitatieve metrics voor de WMO rapportage</h2>
<p>Gemeenten die evenementen subsidiëren via de WMO vragen om specifieke indicatoren. Hoewel elk gemeentelijk kader verschilt, zijn er vijf metrics die in bijna elke WMO rapportage voorkomen:</p>
<ol>
<li><strong>Bereik:</strong> het aantal unieke personen dat door het project is bereikt</li>
<li><strong>Participatiegraad:</strong> het percentage kwetsbare doelgroepen in het totale bereik</li>
<li><strong>Sociale activering:</strong> het aantal deelnemers dat na afloop actief is geworden als vrijwilliger of deelnemer aan een vervolgsessie</li>
<li><strong>Netwerkontwikkeling:</strong> het aantal nieuwe verbindingen tussen organisaties en individuen</li>
<li><strong>Tevredenheid:</strong> gemiddelde tevredenheidsscore van deelnemers</li>
</ol>
<p>Bijeen.app genereert automatisch een WMO impactrapport op basis van de data die je registratie en check-in systeem toch al vastlegt, aangevuld met de enquêteresultaten.</p>

<h2>Kwalitatieve impactmeting: het verhaal achter de cijfers</h2>
<p>Getallen overtuigen subsidiegevers. Verhalen bewegen hen. De krachtigste impactrapportages combineren beide: harde data als bewijs, kwalitatieve citaten als bewijs van de menselijke dimensie.</p>
<p>Praktische manieren om kwalitatieve data te verzamelen:</p>
<ul>
<li>Eén open vraag in de enquête: "Wat was voor jou het meest waardevolle van vandaag?"</li>
<li>Korte video interviews met twee of drie deelnemers direct na het evenement (toestemming vereist)</li>
<li>Case beschrijving van één deelnemer waarvan de impact exemplarisch is voor het project als geheel</li>
<li>Observatie notities van de organisator: wat zag je, wat hoorde je dat de impact illustreert</li>
</ul>

<h2>Van data naar rapportage: het WMO impactrapport</h2>
<p>Een goed WMO impactrapport heeft een vaste structuur die aansluit bij wat gemeenten verwachten:</p>
<ol>
<li>Samenvatting (één pagina, alle kerncijfers)</li>
<li>Doelstelling en doelgroep</li>
<li>Activiteiten (wat heb je gedaan, wanneer, met wie)</li>
<li>Output (aantallen en bereik)</li>
<li>Outcome (wat is er veranderd bij deelnemers)</li>
<li>Impact (bijdrage aan maatschappelijke doelstelling)</li>
<li>Leermoment en aanbevelingen</li>
</ol>
<p>Met Bijeen.app genereer je dit rapport automatisch op basis van de data die het platform heeft verzameld. Je vult de kwalitatieve secties zelf in maar de structuur, de grafieken en de kerncijfers staan al klaar.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoeveel vragen mag een post-event enquête bevatten?</h3>
<p>Maximaal acht vragen voor een optimale respons. Elke extra vraag verlaagt de responsrate met vijf tot tien procent. Kies de vragen die je echt nodig hebt voor je rapportage en laat de rest weg. Een enquête van vijf vragen met vijftig procent respons levert meer bruikbare data op dan een enquête van twintig vragen met vijftien procent respons.</p>
<h3>Moet ik ook vrijwilligers meenemen in de impactmeting?</h3>
<p>Absoluut. Vrijwilligers zijn een onderschatte impactgroep. Hun inzet vertegenwoordigt reële maatschappelijke waarde die je kunt berekenen (aantal uren vermenigvuldigd met het vrijwilligerstarief) en hun persoonlijke ontwikkeling als gevolg van de inzet is een impactindicator op zichzelf.</p>
<h3>Wat als ik geen subsidie ontvang maar toch impact wil aantonen?</h3>
<p>Impactmeting is niet alleen voor subsidiegevers relevant. Het is ook een stuurinstrument voor je eigen organisatie. Weten welke evenementen de meeste output genereren, welke doelgroepen het best worden bereikt en welke werkvormen de hoogste tevredenheid opleveren, maakt je organisatie beter. Behandel je impactdata als managementinformatie, niet als verantwoordingsdocument.</p>`,
    },

    // ARTIKEL 11: KPIs welzijnsevenementen
    {
      slug: "kpis-welzijnsevenementen",
      title: "Welke KPIs gebruik je voor welzijnsevenementen?",
      excerpt: "Niet elke metric vertelt een eerlijk verhaal. Deze KPIs zijn specifiek ontworpen voor de welzijnssector en geven jouw subsidiegever precies wat die nodig heeft.",
      categoryId: c["impact-en-rapportage"],
      status: "published",
      publishedAt: new Date("2026-02-25"),
      updatedAt: new Date("2026-02-25"),
      readingTime: 8,
      tags: ["KPIs", "impact", "rapportage", "welzijn", "subsidie"],
      metaTitle: "KPIs voor welzijnsevenementen: welke metrics tellen echt | Bijeen",
      metaDescription: "Welke KPIs gebruik je voor de rapportage van een welzijnsevenement? Praktische gids voor WMO verantwoording en subsidieverstrekkers.",
      relatedArticles: ["impact-meten-welzijnsevenement", "impactrapport-evenement"],
      content: `<h2>Het probleem met verkeerde metrics</h2>
<p>Ik heb te vaak gezien dat welzijnsorganisaties rapporteren over het aantal likes op hun Facebook bericht als bewijs van bereik. Of het aantal views op een video als indicatie van impact. Dat zijn metrics die makkelijk te verzamelen zijn maar weinig zeggen over het maatschappelijke rendement van je werk.</p>
<p>Subsidiegevers zijn niet dom. Ze kijken door dergelijke proxy metrics heen en vragen om de echte cijfers. Hoe veel kwetsbare mensen heeft dit evenement bereikt? Wat is er concreet veranderd als gevolg van deelname? Is er samenwerking tussen organisaties tot stand gekomen die er voor niet was?</p>

<h2>De vijf KPIs die altijd werken</h2>
<h3>KPI 1: bereikpercentage doelgroep</h3>
<p>Hoeveel procent van je aanwezige deelnemers behoort tot de primaire doelgroep waarvoor je subsidie ontvangt of waarvoor het evenement is bedoeld? Als je ouderen organiseert maar zestig procent van je deelnemers hulpverleners zijn, heeft je bereik een verklaring nodig.</p>
<h3>KPI 2: aanwezigheidsratio</h3>
<p>Aantal check-ins gedeeld door het aantal aanmeldingen. Een aanwezigheidsratio onder tachtig procent vraagt om analyse. Boven negentig procent is excellent en bewijst de relevantie van je evenement voor de doelgroep.</p>
<h3>KPI 3: netto promotor score evenement</h3>
<p>Stel deelnemers de vraag: "Hoe waarschijnlijk is het dat je dit evenement aanbeveelt aan een collega, op een schaal van nul tot tien?" Bereken het verschil tussen promotors (negen of tien) en criticasters (zes of minder). Een NPS boven dertig is sterk voor de welzijnssector.</p>
<h3>KPI 4: verbindingen per deelnemer</h3>
<p>Het gemiddeld aantal nieuwe contacten dat een deelnemer heeft opgedaan als gevolg van het evenement. Dit meet je via de enquête en via de matchingdata als je geleide netwerkkoppeling gebruikt. Een score van twee of meer nieuwe relevante verbindingen per deelnemer is een sterke indicator voor welzijnswaarde.</p>
<h3>KPI 5: concrete actierate</h3>
<p>Het percentage deelnemers dat aangeeft een concrete actie te hebben ondernomen of te plannen als gevolg van deelname. Dit kan zijn: contact opnemen met een andere organisatie, een dienst aanvragen, zich aanmelden als vrijwilliger. Dit is de sterkste impactindicator voor welzijnsevenementen omdat het gedragsverandering meet in plaats van intenties.</p>

<h2>KPIs voor vrijwilligersinzet</h2>
<ul>
<li><strong>Vrijwilligersuren:</strong> totaal aantal uren inzet vermenigvuldigd met het vrijwilligerstarief (2026: 5,50 euro per uur)</li>
<li><strong>Retentierate vrijwilligers:</strong> percentage vrijwilligers dat bij het volgende evenement opnieuw wil bijdragen</li>
<li><strong>Tevredenheid vrijwilligers:</strong> gemiddelde score op een vijfpuntsschaal na afloop</li>
</ul>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik dezelfde KPIs gebruiken voor elk type welzijnsevenement?</h3>
<p>De basis KPIs zijn generiek toepasbaar maar de weging verschilt per type evenement. Een scholingsbijeenkomst scoort hoger op kennisoverdracht, een netwerkevenement op verbindingen per deelnemer. Kies de twee tot drie KPIs die het meest aansluiten bij de doelstelling van het specifieke evenement en gebruik de overige als aanvullende context.</p>
<h3>Hoe vergelijk ik KPIs tussen evenementen?</h3>
<p>Zorg voor consistente meetmomenten en meetmethoden. Als je de aanwezigheidsratio bij het ene evenement meet op basis van QR check-in en bij het andere op basis van een handmatige lijst, vergelijk je appels met peren. Standaardiseer je meetmethode en houd haar consistent.</p>`,
    },

    // ARTIKEL 12: Impactrapport maken
    {
      slug: "impactrapport-evenement",
      title: "Zo maak je een impactrapport na je evenement",
      excerpt: "Een goed impactrapport schrijf je niet achteraf maar bouw je op tijdens het evenement. Dit is de structuur en aanpak die gemeenten en subsidiegevers verwachten.",
      categoryId: c["impact-en-rapportage"],
      status: "published",
      publishedAt: new Date("2026-04-10"),
      updatedAt: new Date("2026-04-10"),
      readingTime: 9,
      tags: ["impactrapport", "rapportage", "WMO", "subsidie"],
      metaTitle: "Impactrapport evenement maken: stap voor stap | Bijeen",
      metaDescription: "Leer hoe je een professioneel impactrapport maakt na je welzijnsevenement. Structuur, data en voorbeelden voor WMO verantwoording.",
      relatedArticles: ["impact-meten-welzijnsevenement", "kpis-welzijnsevenementen"],
      content: `<h2>Rapportage is niet het saaiste deel van evenementenorganisatie</h2>
<p>Toen ik directeur was bij Stichting de Baan sprak ik met veel collega-directeuren over impactrapportage. De meesten zagen het als een verplicht nummertje voor de subsidiegever. Iets wat je na afloop snel in elkaar moest zetten voordat de deadline verstreek. Het gevolg: dunne rapporten die weinig bewijs leverden en weinig invloed hadden op de toewijzing van vervolgsubsidies.</p>
<p>Mijn perspectief is anders. Een goed impactrapport is je sterkste argument voor continuering van je werk. Het is het document dat een wethouder meeneemt naar de gemeenteraad om te verdedigen waarom Stichting X het volgende jaar opnieuw geld verdient. Behandel het dienovereenkomstig.</p>

<h2>De structuur van een sterk impactrapport</h2>
<h3>Deel 1: managementsamenvatting (één pagina)</h3>
<p>Dit is het enige deel dat de meeste beslissers volledig lezen. Maak het compact en krachtig: drie tot vijf kerncijfers, één krachtig citaat van een deelnemer en een concrete conclusie over de mate waarin de doelstelling is behaald.</p>
<h3>Deel 2: context en doelstelling</h3>
<p>Beschrijf waarom dit evenement is georganiseerd, welke maatschappelijke behoefte het adresseert en wat de doelstelling was die je bij de start had geformuleerd. Verwijs naar de relevante beleidskaders van de gemeente of subsidiegever.</p>
<h3>Deel 3: activiteiten en output</h3>
<p>Wat heb je concreet gedaan? Datum, locatie, programma, sprekers, werkvormen. Aangevuld met de outputcijfers: aantal deelnemers, aanwezigheidspercentage, vertegenwoordigde organisaties. Dit gedeelte schrijf je voor negentig procent op basis van je registratiedata.</p>
<h3>Deel 4: outcomes bij deelnemers</h3>
<p>Wat is er veranderd bij de mensen die aanwezig waren? Gebruik enquêtedata voor de kwantitatieve onderbouwing en deelnemerscitaten voor de kwalitatieve dimensie. Dit is het meest overtuigende gedeelte van het rapport als je het goed doet.</p>
<h3>Deel 5: bredere maatschappelijke impact</h3>
<p>Welke bijdrage heeft dit evenement geleverd aan de doelstellingen van het WMO beleid van de gemeente, of aan de bredere maatschappelijke agenda? Wees concreet en bescheiden tegelijk: claim niet meer dan je kunt aantonen maar trek ook de lijn door naar het grotere geheel.</p>
<h3>Deel 6: leermomenten en aanbevelingen</h3>
<p>Wat ging goed en wat doe je de volgende keer anders? Dit laat zien dat je organisatie leert en reflecteert. Subsidiegevers waarderen reflectie. Het maakt je betrouwbaarder als partner, niet minder.</p>

<h2>Het WMO impactrapport via Bijeen.app</h2>
<p>Bijeen.app genereert de structuur van het impactrapport automatisch op basis van je evenementdata. Alle outputcijfers, check-in data, enquêteresultaten en vrijwilligersuren worden automatisch verwerkt in een exporteerbaar PDF rapport. Je vult de kwalitatieve secties zelf in. De rest doet het platform voor je.</p>
<p>Dit bespaart gemiddeld vier tot zes uur rapportagewerk per evenement. Tijd die je kunt gebruiken voor het volgende project.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoe lang mag een impactrapport zijn?</h3>
<p>Acht tot twaalf pagina's is de optimale lengte voor een gemeentelijk impactrapport. Korter dan acht pagina's mist diepgang. Langer dan vijftien pagina's wordt zelden volledig gelezen. Zet de kerninformatie altijd in de samenvatting zodat drukbezette beslissers in vijf minuten het hele verhaal kunnen ophalen.</p>
<h3>Mag ik hetzelfde rapport indienen bij meerdere subsidiegevers?</h3>
<p>Ja, maar pas het aan per ontvanger. Elke subsidiegever heeft zijn eigen beleidskader en prioriteiten. Gebruik één basisrapport en schrijf een specifieke inleiding en conclusie per ontvanger die aansluiten bij zijn of haar specifieke doelstellingen.</p>`,
    },

    // ARTIKEL 13: Event software nonprofits (pillar)
    {
      slug: "event-software-nonprofits",
      title: "Beste event management software voor nonprofits in 2026",
      excerpt: "Commerciële event software is gebouwd voor bedrijven. Welzijnsorganisaties hebben andere behoeften. Dit zijn de opties die echt passen bij de welzijnssector.",
      categoryId: c["digitale-tools"],
      status: "published",
      publishedAt: new Date("2026-01-20"),
      updatedAt: new Date("2026-01-20"),
      readingTime: 12,
      tags: ["event software", "nonprofits", "vergelijking", "tools"],
      metaTitle: "Beste event management software nonprofits 2026 | Bijeen Kennisbank",
      metaDescription: "Vergelijking van event management software voor nonprofits en welzijnsorganisaties. Functies, prijzen en ervaringen uit de praktijk.",
      relatedArticles: ["bijeen-vs-eventbrite-nonprofits", "gratis-event-software-stichtingen", "kosten-evenementenplatform-nonprofits"],
      content: `<h2>Warme zorg, koude software</h2>
<p>Er is iets fundamenteel scheef aan de eventtech markt voor de welzijnssector. De grote spelers Eventbrite, Hopin en hun equivalenten zijn gebouwd voor commerciële events, conferenties en festivals. Hun prijsmodellen zijn gebaseerd op ticketverkoop met een percentage per transactie. Hun functies zijn gericht op marketing en conversie.</p>
<p>Een welzijnsorganisatie die gratis toegankelijke bijeenkomsten organiseert voor kwetsbare doelgroepen, WMO impactrapportages moet aanleveren bij de gemeente en vrijwilligers moet coördineren: die past daar niet in. Functioneel niet. Financieel niet. En zeker niet qua taal en interface.</p>
<p>Als sociaal ondernemer die zelf jarenlang welzijnsevenementen organiseerde en daarna Bijeen.app bouwde voor die specifieke markt, zie ik dit probleem dagelijks. Dus laat me een eerlijk overzicht geven van wat er beschikbaar is en wat bij welke organisatie past.</p>

<h2>De vijf categorieën event software</h2>
<h3>1. Generieke eventplatforms (Eventbrite, Eventix)</h3>
<p>Sterk in: ticketverkoop, marketing, bereik via hun eigen platform.</p>
<p>Minder geschikt voor welzijn omdat: transactiegerichte prijsmodellen passen niet bij gratis events, geen WMO rapportage, geen Nederlandse overheidsintegraties, geen vrijwilligersbeheer.</p>
<p>Wanneer te gebruiken: voor openbare evenementen met betaalde toegang waarbij bereik via het Eventbrite platform waardevol is.</p>
<h3>2. Conferentiesoftware (Whova, Hopin, Swapcard)</h3>
<p>Sterk in: grotere conferenties, netwerking, sessiemanagement, hybride events.</p>
<p>Minder geschikt voor welzijn omdat: dure abonnementen gericht op corporate sector, complexe interfaces voor vrijwilligers, geen Nederlandse WMO integratie.</p>
<p>Wanneer te gebruiken: voor grote jaarlijkse congressen van koepelorganisaties met een substantieel budget.</p>
<h3>3. Lidmaatschapsplatforms met eventmodule (Salesforce NPSP, Raiser's Edge)</h3>
<p>Sterk in: CRM integratie, donateur en ledenmanagement, rapportage.</p>
<p>Minder geschikt voor welzijn omdat: hoge implementatiekosten, complexe interface, overkill voor kleinere organisaties.</p>
<p>Wanneer te gebruiken: voor grotere fondsenwerving organisaties met meerdere systemen die geïntegreerd moeten worden.</p>
<h3>4. Spreadsheets en gratis tools (Google Forms, Eventbrite gratis tier)</h3>
<p>Sterk in: lage kosten, eenvoud, laagdrempelige start.</p>
<p>Minder geschikt bij groei omdat: geen automatisering, geen rapportage, geen check-in module, hoge administratieve last.</p>
<p>Wanneer te gebruiken: voor incidentele evenementen tot dertig deelnemers zonder rapportageverplichting.</p>
<h3>5. Sectorspecifieke welzijnsplatforms (Bijeen.app)</h3>
<p>Sterk in: WMO rapportage, vrijwilligersbeheer, QR check-in, geleide netwerkkoppeling, impactrapportage, AVG compliant Nederlandse interface, ANBI korting.</p>
<p>Minder geschikt voor: commerciële evenementen met ticketverkoop via een eigen marketplace.</p>
<p>Wanneer te gebruiken: voor welzijnsorganisaties, stichtingen en gemeentelijke diensten die regelmatig bijeenkomsten organiseren met rapportageverplichtingen.</p>

<h2>Vergelijkingstabel kernfuncties</h2>
<p>Hieronder een overzicht van de functies die voor welzijnsorganisaties het meest relevant zijn:</p>
<ul>
<li><strong>QR code check-in:</strong> Bijeen ✓, Eventbrite ✓, Google Forms ✗</li>
<li><strong>WMO impactrapportage:</strong> Bijeen ✓, overige ✗</li>
<li><strong>Vrijwilligersbeheer:</strong> Bijeen ✓, overige beperkt of ✗</li>
<li><strong>Geleide netwerkkoppeling:</strong> Bijeen ✓, Swapcard ✓, overige ✗</li>
<li><strong>Nederlandse interface:</strong> Bijeen ✓, Eventix ✓, overige beperkt</li>
<li><strong>ANBI sociaal tarief:</strong> Bijeen ✓, overige ✗</li>
<li><strong>Gratis tier beschikbaar:</strong> alle aanbieders hebben een gratis instap</li>
</ul>

<h2>Wat de keuze bepaalt</h2>
<p>De drie vragen die ik altijd stel aan welzijnsorganisaties die op zoek zijn naar event software:</p>
<ol>
<li>Hoe vaak organiseer je evenementen per jaar en hoeveel deelnemers gemiddeld?</li>
<li>Heb je rapportageverplichtingen richting gemeenten of subsidiegevers?</li>
<li>Spelen vrijwilligers een rol in de uitvoering van je evenementen?</li>
</ol>
<p>Bij meer dan vijf evenementen per jaar, rapportageverplichtingen of vrijwilligersinzet is een sectorspecifiek platform zoals Bijeen de meest logische keuze. Bij incidentele evenementen zonder rapportage kun je beginnen met gratis generieke tools.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik mijn bestaande eventdata migreren naar een nieuw platform?</h3>
<p>Dat hangt af van het platform. Bijeen.app ondersteunt import via CSV voor deelnemers en evenementen. De meeste andere platforms ook. Plan altijd een migratie op een rustig moment, niet vlak voor een evenement.</p>
<h3>Hoeveel tijd kost de implementatie van event software?</h3>
<p>Voor een platform als Bijeen.app is de setup voor een eerste evenement in één tot twee uur gedaan. De diepere integraties zoals rapportageformats en vrijwilligersprofielen kosten een dag setup. Grotere platforms als Salesforce NPSP vereisen een implementatietraject van weken tot maanden.</p>
<h3>Wat als mijn organisatie te klein is voor software?</h3>
<p>Er is geen minimumgrootte voor event software. Zelfs voor een kleine organisatie die vier evenementen per jaar organiseert met vijftig deelnemers is een goed platform de moeite waard als het je twee uur administratief werk per evenement bespaart en je rapportage kwalitatief verbetert.</p>`,
    },

    // ARTIKEL 14: Bijeen vs Eventbrite
    {
      slug: "bijeen-vs-eventbrite-nonprofits",
      title: "Bijeen vs Eventbrite voor nonprofits: eerlijk vergeleken",
      excerpt: "Eventbrite is de bekendste naam. Maar voor welzijnsorganisaties die meer nodig hebben dan ticketverkoop, zijn er wezenlijke verschillen. Een eerlijke vergelijking.",
      categoryId: c["digitale-tools"],
      status: "published",
      publishedAt: new Date("2026-03-15"),
      updatedAt: new Date("2026-03-15"),
      readingTime: 8,
      tags: ["Eventbrite", "vergelijking", "nonprofits", "event software"],
      metaTitle: "Bijeen vs Eventbrite voor nonprofits: vergelijking 2026 | Bijeen",
      metaDescription: "Eerlijke vergelijking tussen Bijeen en Eventbrite voor welzijnsorganisaties. Functies, prijs, WMO rapportage en gebruiksgemak vergeleken.",
      relatedArticles: ["event-software-nonprofits", "gratis-event-software-stichtingen", "kosten-evenementenplatform-nonprofits"],
      content: `<h2>Twee platforms, twee filosofieën</h2>
<p>Ik ga deze vergelijking niet schrijven als onbevooroordeeld tussenpersoon, want dat ben ik niet. Ik heb Bijeen.app gebouwd. Maar ik kan wel eerlijk zijn over wanneer Eventbrite de betere keuze is en wanneer niet. En dat eerlijkheid is uiteindelijk waardevoller dan een vergelijking die alleen maar bevestigt wat je al verwacht.</p>
<p>Eventbrite is het grootste eventplatform ter wereld en dat is niet voor niets. Het is uitstekend gebouwd voor zijn primaire use case: openbare evenementen met betaalde toegang, ontdekt via het Eventbrite marketplace. Als je een festival, concert of betaald congres organiseert en je wilt worden gevonden door mensen die niet al van je organisatie afweten, is Eventbrite uitstekend.</p>
<p>Maar de meeste welzijnsorganisaties in Nederland organiseren besloten of gratis evenementen voor een bekende doelgroep, met rapportageverplichtingen aan gemeenten en subsidiegevers. Dat is een heel andere use case.</p>

<h2>Vergelijking op zes criteria</h2>
<h3>Registratie en check-in</h3>
<p><strong>Eventbrite:</strong> goede registratiemodule, QR check-in beschikbaar via de Eventbrite Organizer app. Werkt goed voor grote openbare events. Check-in data wordt opgeslagen in Eventbrite dashboard.</p>
<p><strong>Bijeen:</strong> registratie en QR check-in geïntegreerd met deelnemersbeheer en automatische bevestigingen. Check-in data direct beschikbaar voor impactrapportage.</p>
<h3>Impactrapportage voor gemeenten</h3>
<p><strong>Eventbrite:</strong> geen WMO rapportage. Je kunt deelnemersdata exporteren als CSV en zelf een rapport samenstellen maar er is geen geïntegreerde rapportagemodule voor gemeentelijke verantwoording.</p>
<p><strong>Bijeen:</strong> automatische WMO impactrapportage op basis van evenementdata, check-in gegevens en enquêteresultaten. Exporteerbaar als PDF direct naar de subsidiegever.</p>
<h3>Vrijwilligersbeheer</h3>
<p><strong>Eventbrite:</strong> geen vrijwilligersmodule.</p>
<p><strong>Bijeen:</strong> geïntegreerd vrijwilligersbeheer met taken, shifts, communicatie en aanwezigheidsregistratie.</p>
<h3>Prijs</h3>
<p><strong>Eventbrite:</strong> gratis voor gratis evenementen. Voor betaalde evenementen: fee per transactie (3,7% + vaste fee per ticket). Bij gratis evenementen zijn bepaalde features vergrendeld achter een betaald abonnement.</p>
<p><strong>Bijeen:</strong> maandelijks abonnement zonder transactiekosten. ANBI gecertificeerde organisaties ontvangen 15% korting (Sociaal Tarief). Gratis proefperiode beschikbaar.</p>
<h3>Nederlandse interface en compliance</h3>
<p><strong>Eventbrite:</strong> Nederlandstalige interface beschikbaar maar AVG compliance en GDPR documentatie zijn Amerikaans georiënteerd. Geen Nederlandse specifieke privacydocumenten.</p>
<p><strong>Bijeen:</strong> volledig Nederlandstalig platform, AVG compliant gebouwd, verwerkersovereenkomst beschikbaar, opgeslagen op Nederlandse servers.</p>
<h3>Bereik via het platform</h3>
<p><strong>Eventbrite:</strong> groot voordeel. Miljoenen gebruikers kunnen je evenement ontdekken via Eventbrite zoekfunctie. Relevant als je nieuwe doelgroepen wilt bereiken.</p>
<p><strong>Bijeen:</strong> geen eigen marketplace. Je bereikt deelnemers via je eigen communicatiekanalen. Wel toegang tot het Bijeen netwerk van welzijnsorganisaties voor partnerbijeenkomsten.</p>

<h2>Mijn eerlijke aanbeveling</h2>
<p>Kies Eventbrite als: je openbare evenementen organiseert waarbij nieuwe doelgroepbereik via het Eventbrite platform waarde heeft, je betaalde tickets verkoopt of je geen rapportageverplichtingen hebt richting gemeenten.</p>
<p>Kies Bijeen als: je welzijnsbijeenkomsten organiseert voor een bekende doelgroep, je WMO of subsidie rapportage moet aanleveren, je vrijwilligers coördineert of je een volledig Nederlandstalig systeem nodig hebt dat specifiek is gebouwd voor de sector.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik beide platforms tegelijk gebruiken?</h3>
<p>Ja, dat is technisch mogelijk maar administratief belastend. Je deelnemersdata staat dan op twee plekken. Ik adviseer één primair platform en gebruik het consequent. Migreer alle evenementen tegelijk en werk nooit meer met twee platforms parallel.</p>
<h3>Is Eventbrite gratis voor nonprofits?</h3>
<p>Eventbrite heeft een nonprofit korting maar die is beperkt en wordt niet automatisch verstrekt. Je moet een aanvraag indienen en de korting geldt alleen voor specifieke abonnementstypes. Bijeen biedt een structureel Sociaal Tarief van 15% korting voor alle ANBI gecertificeerde organisaties.</p>`,
    },

  ]);

  console.log("✅ Batch 2 (artikelen 8-14) geseed.");

  // ─── BATCH 3: artikelen 15-20 ──────────────────────────────────────────────
  await db.insert(knowledgeBaseArticles).values([

    // ARTIKEL 15: Gratis event software stichtingen
    {
      slug: "gratis-event-software-stichtingen",
      title: "Gratis event software voor stichtingen: de echte opties in 2026",
      excerpt: "Gratis klinkt aantrekkelijk maar heeft verborgen kosten. Dit zijn de echte gratis opties voor stichtingen en nonprofits, inclusief eerlijke kanttekeningen.",
      categoryId: c["digitale-tools"],
      status: "published",
      publishedAt: new Date("2026-04-18"),
      updatedAt: new Date("2026-04-18"),
      readingTime: 7,
      tags: ["gratis", "stichting", "event software", "budget"],
      metaTitle: "Gratis event software stichtingen 2026: echte opties | Bijeen",
      metaDescription: "Overzicht van gratis event software voor stichtingen en nonprofits. Inclusief eerlijke kanttekeningen over beperkingen en verborgen kosten.",
      relatedArticles: ["event-software-nonprofits", "kosten-evenementenplatform-nonprofits", "bijeen-vs-eventbrite-nonprofits"],
      content: `<h2>Gratis bestaat niet, maar sommige dingen kosten bijna niets</h2>
<p>Ik hoor regelmatig van kleine welzijnsorganisaties: "We hebben geen budget voor software." Dat begrijp ik. Maar ik hoor ook wat er vervolgens gebeurt: vier uur per evenement verloren aan handmatige administratie, een impactrapport dat niet aangeleverd kan worden en deelnemers die afhaken bij een omslachtige aanmelding. Die verborgen kosten zijn ook geld, alleen niet zichtbaar op de begroting.</p>
<p>Laat me eerlijk zijn over wat er echt gratis is en wat er uiteindelijk toch wat kost.</p>

<h2>Echt gratis opties</h2>
<h3>Google Forms met Sheets koppeling</h3>
<p>Voor aanmelden van dertig tot vijftig deelnemers is Google Forms functioneel en gratis. Je maakt een formulier, koppelt het aan een Google Sheet en hebt direct een overzicht van aanmeldingen. Beperkingen: geen automatische bevestigingsmail met QR code, geen check-in module, geen impactrapportage, handmatige verwerking achteraf.</p>
<p>Geschikt voor: incidentele evenementen tot vijftig deelnemers zonder rapportageverplichting.</p>
<h3>Eventbrite gratis tier</h3>
<p>Voor gratis evenementen biedt Eventbrite een gratis basisaccount. Je krijgt een aanmeldpagina, bevestigingsmail en een basis check-in via de app. Beperkingen: limited functies in gratis tier, geen vrijwilligersbeheer, geen WMO rapportage, interface in het Engels.</p>
<p>Geschikt voor: openbare evenementen waarbij je ook nieuwe doelgroepen wilt bereiken via het Eventbrite platform.</p>
<h3>Luma (lu.ma)</h3>
<p>Relatief nieuwe tool uit de US die populair is bij gemeenschapsevenementen. Gratis basisversie met mooie landingspagina's en uitnodigingsbeheer. Beperkingen: Engelstalig, geen WMO integratie, beperkte exportmogelijkheden.</p>
<p>Geschikt voor: informele community events waarbij de esthetiek van de aanmeldpagina belangrijk is.</p>

<h2>Bijna gratis opties (laagdrempelige abonnementen)</h2>
<h3>Bijeen.app Starter</h3>
<p>Voor kleine organisaties met een ANBI status is de combinatie van het Starter abonnement plus het Sociaal Tarief van 15% korting de goedkoopste optie die alle welzijnsspecifieke functies bevat. Dit is geen reclame maar een constatering: er is geen andere tool die WMO rapportage, QR check-in, vrijwilligersbeheer en een Nederlandstalige interface combineert voor dit prijsniveau.</p>
<p>Vraag een gratis proefperiode aan via bijeen.app om zelf te beoordelen of de investering zich terugbetaalt.</p>

<h2>De rekensom die je moet maken</h2>
<p>Voordat je voor gratis kiest, maak deze rekensom: hoeveel uur kost het je om een evenement met vijftig deelnemers handmatig te verwerken (aanmeldingen, herinneringen, check-in, presentielijst, rapportage)? Bij gemiddeld vier uur en een intern uurtarief van veertig euro kost je gratis tool je hondenzestig euro per evenement aan arbeidskosten. Een betaald platform dat dit terugbrengt naar één uur kost je tweehonderdveertig euro aan arbeidskosten minder per jaar bij zes evenementen. Meer dan de meeste abonnementen kosten.</p>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik beginnen met een gratis tool en later migreren?</h3>
<p>Ja, en dat is een verstandige aanpak. Begin met Google Forms voor je eerste evenementen om te leren wat je nodig hebt. Migreer naar een professioneel platform als je merkt dat de administratieve last onaanvaardbaar wordt of als je rapportageverplichtingen krijgt.</p>
<h3>Zijn er subsidies of fondsen voor software aanschaf voor nonprofits?</h3>
<p>Ja. Stichting DOEN, het Oranje Fonds en diverse gemeentelijke innovatiefondsen ondersteunen digitalisering van welzijnsorganisaties. Software als investering in professionalisering is doorgaans subsidiabel als onderdeel van een breder projectplan.</p>`,
    },

    // ARTIKEL 16: Kosten evenementenplatform
    {
      slug: "kosten-evenementenplatform-nonprofits",
      title: "Wat kost een evenementenplatform voor nonprofits in 2026?",
      excerpt: "Transparantie over de kosten van event software voor welzijnsorganisaties. Van gratis tot enterprise, inclusief de verborgen kosten die niemand je vertelt.",
      categoryId: c["digitale-tools"],
      status: "published",
      publishedAt: new Date("2026-05-02"),
      updatedAt: new Date("2026-05-02"),
      readingTime: 7,
      tags: ["kosten", "prijs", "event software", "nonprofits"],
      metaTitle: "Kosten evenementenplatform nonprofits 2026: eerlijk overzicht | Bijeen",
      metaDescription: "Transparant overzicht van de kosten van event management software voor nonprofits en welzijnsorganisaties. Inclusief verborgen kosten en ANBI korting.",
      relatedArticles: ["event-software-nonprofits", "bijeen-vs-eventbrite-nonprofits", "gratis-event-software-stichtingen"],
      content: `<h2>Transparantie over prijzen in een markt die dat niet gewend is</h2>
<p>Toen ik directeur was bij Stichting de Baan was het lastig om software aan te schaffen omdat de meeste leveranciers geen openbare prijzen hadden. Je moest bellen, een demo aanvragen en een offerte afwachten. Voor een kleine welzijnsorganisatie is dat een drempel die veel potentiële klanten wegjaagt nog voordat ze de tool hebben kunnen beoordelen.</p>
<p>Ik heb Bijeen.app van meet af aan gebouwd met transparante prijzen. Geen verborgen kosten, geen verkoopgesprek nodig om een prijs te weten. Dat vind ik hoe het hoort.</p>

<h2>Kostenstructuren in de markt</h2>
<h3>Transactiemodel (Eventbrite, Ticketmaster)</h3>
<p>Betaal per transactie: drie tot vijf procent van de ticketprijs plus een vaste fee per ticket. Bij gratis evenementen geen transactiekosten maar beperkte functies. Voor betaalde evenementen met honderd tickets van twintig euro kost dit al snel vijftig tot honderd euro per evenement.</p>
<h3>Abonnementsmodel (Bijeen, Whova)</h3>
<p>Vaste maandelijkse of jaarlijkse kosten ongeacht het aantal evenementen of deelnemers. Transparant, voorspelbaar en aantrekkelijker voor organisaties die meerdere evenementen per jaar organiseren.</p>
<h3>Per-event model (sommige conferentieplatforms)</h3>
<p>Betaal per evenement op basis van het aantal verwachte deelnemers. Geschikt voor organisaties die één groot evenement per jaar organiseren maar duur voor regelmatige kleine bijeenkomsten.</p>

<h2>Wat Bijeen kost in 2026</h2>
<p>Bijeen.app heeft drie abonnementen: Starter voor kleine organisaties met jaarlijks minder dan tien evenementen, Welzijn Pro voor organisaties met frequent evenementenprogramma en Congres voor grote jaarlijkse congressen met honderden deelnemers.</p>
<p>Alle ANBI gecertificeerde organisaties ontvangen 15% korting op elk abonnement via het Sociaal Tarief. Vraag het Sociaal Tarief aan via bijeen.app bij het afsluiten van je abonnement.</p>
<p>Voor interimstrategie rond digitale transformatie in de welzijnssector werk ik ook direct als innovatiemanager via WeAreImpact.nl, maximaal twee tot drie dagen per week.</p>

<h2>Verborgen kosten om op te letten</h2>
<ul>
<li><strong>Implementatiekosten:</strong> sommige platforms rekenen een eenmalige setup fee. Vraag hier altijd expliciet naar.</li>
<li><strong>Support kosten:</strong> gratis support is bij veel platforms beperkt tot email. Telefonische support of een account manager kan extra kosten.</li>
<li><strong>Exportkosten:</strong> sommige platforms berekenen kosten voor het exporteren van je eigen data. Dat is onacceptabel. Controleer dit altijd.</li>
<li><strong>Integratiekosten:</strong> koppeling met je CRM of boekhoudsoftware kan extra kosten met zich meebrengen bij sommige platforms.</li>
</ul>

<h2>Veelgestelde vragen</h2>
<h3>Kan ik een jaarlijks abonnement stopzetten als het niet bevalt?</h3>
<p>Dat hangt af van de contractvoorwaarden. Bij Bijeen.app kun je maandelijks opzeggen, ook als je een jaarlijks abonnement hebt afgesloten. De resterende maanden worden terugbetaald naar rato. Vraag hier altijd naar voor je tekent.</p>
<h3>Zijn er kosten voor extra gebruikers of beheerders?</h3>
<p>Bij Bijeen.app zijn meerdere beheerders standaard inbegrepen in alle abonnementen. Bij sommige andere platforms betaal je per gebruiker. Bereken de totale kosten bij meerdere medewerkers die toegang nodig hebben tot het systeem.</p>`,
    },

    // ARTIKEL 17: GDPR en evenementen (pillar)
    {
      slug: "gdpr-evenementen-welzijnsorganisatie",
      title: "GDPR en evenementen: wat moet een welzijnsorganisatie weten?",
      excerpt: "De AVG geldt voor elk evenement waarbij je persoonsgegevens verwerkt. Dit is wat je moet regelen, wat je niet mag doen en hoe je het eenvoudig aanpakt.",
      categoryId: c["gdpr-en-privacy"],
      status: "published",
      publishedAt: new Date("2026-02-07"),
      updatedAt: new Date("2026-02-07"),
      readingTime: 12,
      tags: ["GDPR", "AVG", "privacy", "evenement", "compliance"],
      metaTitle: "GDPR en evenementen voor welzijnsorganisaties: complete gids | Bijeen",
      metaDescription: "Alles wat welzijnsorganisaties moeten weten over GDPR bij evenementen. Aanmeldformulieren, bewaartermijnen, fotografiebeleid en verwerkersovereenkomsten.",
      relatedArticles: ["avg-inschrijfformulier-checklist", "toestemming-fotografie-evenementen", "deelnemersbeheer-grote-evenementen"],
      content: `<h2>De boete die een collega organisatie trof</h2>
<p>Een welzijnsorganisatie in mijn regio ontving in 2024 een brief van de Autoriteit Persoonsgegevens na een klacht van een oud-deelnemer. De klacht: de organisatie had de emailadressen van evenementdeelnemers gebruikt voor een nieuwsbrief waarvoor die deelnemers nooit expliciet toestemming hadden gegeven. De afhandeling kostte hen drie weken werk, een juridisch advies en uiteindelijk een waarschuwing met de dreiging van een boete bij herhaling.</p>
<p>De fout was simpel: het aanmeldformulier had geen aparte toestemmingsvraag voor nieuwsbrief aanmelding. Registratie voor een evenement werd stilzwijgend als toestemming voor alle communicatie behandeld. Dat mag niet.</p>
<p>GDPR hoeft niet ingewikkeld te zijn. Maar het vraagt wel bewuste keuzes bij elke stap van je evenementenproces.</p>

<h2>Welke persoonsgegevens verwerk je bij een evenement?</h2>
<p>Bij vrijwel elk evenement verwerk je minimaal de volgende categorieën persoonsgegevens:</p>
<ul>
<li>Naam en emailadres (voor registratie en communicatie)</li>
<li>Telefoonnummer (optioneel, voor last-minute contact)</li>
<li>Organisatie en functie (voor B2B events)</li>
<li>Dieetwensen en toegankelijkheidsbehoeften (bijzondere persoonsgegevens: gezondheidsdata)</li>
<li>Check-in tijdstip en aanwezigheidsregistratie</li>
<li>Enquêteantwoorden (mening, evaluatie)</li>
<li>Foto- en videomateriaal (als je dit vastlegt)</li>
</ul>
<p>Dieetwensen en toegankelijkheidsbehoeften zijn bijzondere persoonsgegevens in de zin van de AVG omdat ze informatie onthullen over gezondheid. Daarvoor gelden strengere regels: je hebt altijd expliciete toestemming nodig en je moet ze beveiligd opslaan.</p>

<h2>De vier rechtsgronden voor verwerking</h2>
<p>Elke verwerking van persoonsgegevens heeft een rechtsgrond nodig. Voor evenementen zijn twee rechtsgronden het meest relevant:</p>
<h3>Uitvoering van een overeenkomst</h3>
<p>Als iemand zich aanmeldt voor je evenement ga je een overeenkomst aan: jij levert een bijeenkomst, de deelnemer neemt deel. De verwerking van naam en emailadres voor de bevestigingsmail en communicatie over het evenement valt onder deze rechtsgrond. Je hebt hiervoor geen aparte toestemming nodig.</p>
<h3>Toestemming</h3>
<p>Voor elk gebruik dat verder gaat dan de uitvoering van de overeenkomst heb je expliciete toestemming nodig. Nieuwsbrief aanmelding, gebruik van foto's, doorsturen van contactgegevens naar sponsors of sprekers: allemaal aparte toestemmingsvragen in je aanmeldformulier.</p>

<h2>Bewaartermijnen voor evenementendata</h2>
<p>Hoe lang mag je de data van evenementdeelnemers bewaren? De AVG stelt geen vaste termijnen maar hanteert het principe van minimale bewaring: niet langer dan noodzakelijk voor het doel waarvoor de data is verzameld.</p>
<p>Praktische richtlijnen voor welzijnsorganisaties:</p>
<ul>
<li><strong>Registratiedata (naam, email, aanwezigheid):</strong> maximaal één jaar na het evenement voor operationele doelen. Langer als je kunt aantonen dat het noodzakelijk is voor WMO rapportage, maximaal zeven jaar voor financieel relevante data (bewaarplicht).</li>
<li><strong>Enquêteresultaten:</strong> maximaal twee jaar in geïdentificeerde vorm. Daarna anonimiseren of verwijderen.</li>
<li><strong>Foto- en videomateriaal:</strong> zolang de betrokkene toestemming heeft gegeven of totdat de toestemming wordt ingetrokken.</li>
<li><strong>Dieetwensen en gezondheidsdata:</strong> verwijderen direct na het evenement, tenzij er een specifieke reden is om ze langer te bewaren.</li>
</ul>

<h2>De verwerkersovereenkomst</h2>
<p>Als je een extern platform gebruikt voor je evenementenregistratie (zoals Bijeen.app), ben jij de verwerkingsverantwoordelijke en is het platform de verwerker. Dat vereist een verwerkersovereenkomst tussen jou en het platform. Een goede eventplatformleverancier stelt dit standaard beschikbaar. Bijeen.app heeft een standaard verwerkersovereenkomst die je kunt downloaden via je accountinstellingen.</p>
<p>Zonder verwerkersovereenkomst ben jij als organisatie aansprakelijk voor de gegevensverwerking door het platform. Dat is een risico dat je eenvoudig kunt vermijden door het contract te sluiten.</p>

<h2>Fotograferen en filmen op evenementen</h2>
<p>Dit is het gebied waar welzijnsorganisaties de meeste fouten maken. Een foto van een groep mensen op een evenement is een verwerking van persoonsgegevens van alle herkenbare personen op die foto. Je hebt toestemming nodig.</p>
<p>Praktische aanpak: vermeld in je aanmeldformulier dat er gefotografeerd wordt en voor welk doel (website, sociaal media, jaarverslag). Geef deelnemers de optie om fotografietoestemming te weigeren. Zorg dat je team weet wie niet gefotografeerd wil worden.</p>
<p>Voor een complete aanpak zie het artikel over fotografietoestemming op evenementen in de kennisbank.</p>

<h2>Veelgestelde vragen</h2>
<h3>Moet ik een privacyverklaring hebben als welzijnsorganisatie?</h3>
<p>Ja, altijd. De AVG verplicht elke organisatie die persoonsgegevens verwerkt tot een transparant privacybeleid. Die verklaring moet minimaal beschrijven: welke data je verzamelt, waarvoor, op basis van welke rechtsgrond, hoe lang je het bewaart en hoe betrokkenen hun rechten kunnen uitoefenen.</p>
<h3>Wat doe ik als een deelnemer vraagt om zijn of haar data te verwijderen?</h3>
<p>Een verzoek tot verwijdering moet je in principe honoreren tenzij je een dwingende reden hebt om de data te bewaren (zoals een wettelijke bewaarplicht). Beantwoord het verzoek binnen één maand. Als je Bijeen.app gebruikt kun je data per deelnemer verwijderen via het deelnemersbeheer scherm.</p>
<h3>Geldt de AVG ook voor kleine stichtingen met minder dan tien medewerkers?</h3>
<p>Ja. De AVG geldt voor elke organisatie die persoonsgegevens van EU-burgers verwerkt, ongeacht de omvang. Er zijn geen uitzonderingen op basis van organisatiegrootte. De schaal van je verwerking bepaalt wel hoeveel je specifiek moet documenteren, maar de basisverplichtingen gelden voor iedereen.</p>`,
    },

    // ARTIKEL 18: Toestemming fotografie evenementen
    {
      slug: "toestemming-fotografie-evenementen",
      title: "Toestemming voor fotografie op evenementen: zo doe je het goed",
      excerpt: "Een foto zonder toestemming van herkenbare deelnemers kan een AVG klacht opleveren. Dit is de aanpak die werkt zonder het evenement te belasten.",
      categoryId: c["gdpr-en-privacy"],
      status: "published",
      publishedAt: new Date("2026-03-28"),
      updatedAt: new Date("2026-03-28"),
      readingTime: 7,
      tags: ["fotografie", "AVG", "toestemming", "GDPR", "evenement"],
      metaTitle: "Toestemming fotografie evenementen: AVG proof aanpak | Bijeen",
      metaDescription: "Hoe vraag je correct toestemming voor fotografie op evenementen? AVG compliant aanpak voor welzijnsorganisaties met praktische checklist.",
      relatedArticles: ["gdpr-evenementen-welzijnsorganisatie", "avg-inschrijfformulier-checklist"],
      content: `<h2>De foto die na drie maanden van de website moest</h2>
<p>Een welzijnsorganisatie plaatste na een geslaagd netwerkevenement een mooie groepsfoto op hun website. Geen kwade bedoelingen: het was een sfeeropname van de netwerkborrel. Drie maanden later stuurde een deelnemer een email met het verzoek de foto te verwijderen. De reden: de persoon stond herkenbaar op de foto en wenste geen associatie met de organisatie in dat specifieke verband.</p>
<p>Het verzoek was volledig gerechtvaardigd onder de AVG. De foto werd verwijderd. Maar de tijd die het had gekost om te reageren, de ongemakkelijkheid van de situatie en de potentiële reputatieschade waren vermijdbaar geweest met de juiste aanpak bij het aanmeldproces.</p>

<h2>Waarom fototoestemming niet vanzelfsprekend is</h2>
<p>Een deelnemer die zich aanmeldt voor je evenement geeft daarmee geen impliciete toestemming voor het gebruik van zijn of haar foto. Aanwezigheid op een publiek evenement is ook geen toestemming: voor welzijnsbijeenkomsten in een niet-publieke ruimte geldt dit al helemaal niet.</p>
<p>De AVG stelt dat toestemming voor fotografieverwerking specifiek, geïnformeerd en vrij gegeven moet zijn. Specifiek betekent: voor een concreet doel (website, sociaal media, jaarverslag). Geïnformeerd betekent: de deelnemer weet hoe de foto gebruikt wordt. Vrij betekent: weigering heeft geen negatieve gevolgen voor deelname aan het evenement.</p>

<h2>De drie niveaus van fotografietoestemming</h2>
<h3>Niveau 1: aanmeldformulier toestemming</h3>
<p>Voeg aan je aanmeldformulier een niet-verplichte vraag toe: "Ik geef toestemming voor gebruik van foto- en videomateriaal waarop ik herkenbaar in beeld kom, voor [specifiek omschreven doeleinden]."</p>
<p>Maak het vakje opt-in (leeg standaard), niet opt-out (aangevinkt standaard). Opt-out toestemming is geen vrije toestemming in de zin van de AVG.</p>
<h3>Niveau 2: communicatie voor het evenement</h3>
<p>Vermeld in je herinnering dat er gefotografeerd wordt en vraag deelnemers die geen foto willen laten weten dit bij aankomst of zich te melden bij de organisatie. Dit is niet voldoende als enige maatregel maar versterkt de transparantie.</p>
<h3>Niveau 3: zichtbare aanduiding op het evenement</h3>
<p>Zet bij de ingang een duidelijke borden: "Tijdens dit evenement wordt gefotografeerd voor [doel]. Bezwaar? Meld u bij de organisatie." Dit informeert ook walk-in deelnemers die niet via het aanmeldformulier zijn gegaan.</p>

<h2>Speciale gevallen</h2>
<h3>Kwetsbare doelgroepen</h3>
<p>Bij evenementen voor kwetsbare doelgroepen zoals mensen met psychische problematiek, ouderen met dementie of daklozen geldt extra terughoudendheid. Zelfs met toestemming moet je beoordelen of publicatie van herkenbare foto's in het belang is van de betrokkene. Twijfel je? Fotografeer dan zonder herkenbare gezichten.</p>
<h3>Kinderen</h3>
<p>Voor minderjarige deelnemers heb je toestemming nodig van de ouders of wettelijk voogd. Bij evenementen waar ook kinderen aanwezig zijn (familiedagen, jongerenactiviteiten) voeg je een aparte toestemmingsvraag toe voor fotograferen van minderjarigen.</p>
<h3>Sprekers en vrijwilligers</h3>
<p>Sprekers en vrijwilligers staan in een andere positie dan deelnemers maar hebben dezelfde privacyrechten. Vraag ook hen expliciet om toestemming, bij voorkeur via de speaker briefing of vrijwilliger onboarding die je toch al verstuurt.</p>

<h2>Veelgestelde vragen</h2>
<h3>Mag ik foto's maken zonder toestemming als het evenement openbaar is?</h3>
<p>In de openbare ruimte gelden andere regels: je mag foto's maken van groepen op openbare locaties zonder expliciete toestemming. Maar ook hier: gebruik voor commerciële doeleinden of gebruik waarbij de privacy van herkenbare personen in het geding is vereist toestemming. Bij welzijnsevenementen die plaatsvinden in een niet-publieke locatie (buurthuis, congrescentrum) is de openbare ruimte uitzondering niet van toepassing.</p>
<h3>Hoe lang mag ik foto's bewaren waarvoor ik toestemming heb?</h3>
<p>Zolang de toestemming van kracht is. Toestemming kan te allen tijde worden ingetrokken. Na intrekking moet je het materiaal verwijderen of anonimiseren. Documenteer wanneer en hoe toestemming is gegeven zodat je dit kunt aantonen bij een eventuele klacht.</p>`,
    },

    // ARTIKEL 19: AVG inschrijfformulier checklist
    {
      slug: "avg-inschrijfformulier-checklist",
      title: "AVG proof inschrijfformulier voor evenementen: de checklist",
      excerpt: "Een aanmeldformulier voor evenementen verwerkt altijd persoonsgegevens. Dit zijn de velden en toestemmingsvragen die je nodig hebt om AVG compliant te zijn.",
      categoryId: c["gdpr-en-privacy"],
      status: "published",
      publishedAt: new Date("2026-04-25"),
      updatedAt: new Date("2026-04-25"),
      readingTime: 8,
      tags: ["AVG", "GDPR", "aanmeldformulier", "privacy", "checklist"],
      metaTitle: "AVG proof aanmeldformulier evenementen: checklist 2026 | Bijeen",
      metaDescription: "Checklist voor een AVG compliant aanmeldformulier voor evenementen. Welke velden, toestemmingsvragen en privacyverklaringen zijn verplicht?",
      relatedArticles: ["gdpr-evenementen-welzijnsorganisatie", "toestemming-fotografie-evenementen"],
      content: `<h2>Het formulier dat ons in de problemen bracht</h2>
<p>Bij Stichting de Baan hadden we jarenlang een aanmeldformulier dat in 2017 was gemaakt, voor de AVG van kracht werd. Toen de AVG in 2018 inging, is dat formulier niet bijgewerkt. Het had geen toestemmingsvinkje voor de nieuwsbrief, geen expliciete koppeling naar de privacyverklaring en vroeg om dieetwensen zonder te vermelden hoe die data werd verwerkt en verwijderd.</p>
<p>We kwamen daar niet in de problemen. Maar het had gekund. En we moesten het formulier volledig herzien toen een nieuwe medewerker de AVG audit uitvoerde. Dat had eerder en makkelijker gekund als we de checklist hieronder hadden gehad.</p>

<h2>Verplichte elementen van elk aanmeldformulier</h2>
<h3>Basisgegevens</h3>
<ul>
<li>Voornaam en achternaam (verplicht)</li>
<li>Emailadres (verplicht voor bevestiging en communicatie)</li>
<li>Link naar privacyverklaring (verplicht, zichtbaar bij het formulier)</li>
<li>Verklaring over gegevensverwerking: "Uw gegevens worden verwerkt voor de organisatie van dit evenement conform onze privacyverklaring."</li>
</ul>
<h3>Bijzondere persoonsgegevens (optioneel maar AVG-gevoelig)</h3>
<ul>
<li>Dieetwensen: voeg een toelichting toe: "Uw dieetwensen worden alleen gebruikt voor de catering en worden na het evenement verwijderd."</li>
<li>Toegankelijkheidsbehoeften: zelfde toelichting vereist</li>
<li>Gezondheids- of zorginfo: verwerk dit alleen als strikt noodzakelijk, altijd met expliciete toestemming</li>
</ul>
<h3>Toestemmingsvragen (altijd opt-in, nooit opt-out)</h3>
<ul>
<li>Fotografie toestemming: "Ik geef toestemming voor gebruik van foto- en videomateriaal waarop ik herkenbaar in beeld kom, voor gebruik op de website en sociale media van [organisatienaam]." (optioneel)</li>
<li>Nieuwsbrief toestemming: "Ik wil de nieuwsbrief van [organisatienaam] ontvangen." (optioneel)</li>
<li>Partnercomuunicatie: "Ik ga akkoord dat mijn contactgegevens worden gedeeld met [partner]." (optioneel, alleen als relevant)</li>
</ul>

<h2>Wat je niet mag doen</h2>
<ul>
<li>Toestemmingsvakjes vooraf aanvinken (opt-out is geen vrije toestemming)</li>
<li>Deelname afhankelijk stellen van toestemming voor nieuwsbrief</li>
<li>Meer data verzamelen dan noodzakelijk voor het doel (dataminimalisatie)</li>
<li>Geen link naar de privacyverklaring opnemen</li>
<li>Bijzondere persoonsgegevens verzamelen zonder expliciete toestemming en toelichting</li>
</ul>

<h2>Technische vereisten van het formulier</h2>
<ul>
<li>Beveiligde verbinding (HTTPS): altijd verplicht voor formulieren die persoonsgegevens verzamelen</li>
<li>Data opslag in de EU: persoonsgegevens van EU-burgers mogen niet worden opgeslagen op servers buiten de EU tenzij er adequate beschermingsmaatregelen zijn</li>
<li>Automatische bevestiging: stuur altijd een bevestigingsmail met een samenvatting van wat er is ingevuld en hoe de deelnemer zijn of haar data kan inzien of verwijderen</li>
</ul>

<h2>Veelgestelde vragen</h2>
<h3>Moet ik elk formulier laten controleren door een jurist?</h3>
<p>Nee, maar het is verstandig om bij je eerste AVG proof formulier eenmalig juridisch advies te vragen. Daarna kun je het gevalideerde template gebruiken voor alle volgende evenementen. De investering in juridisch advies betaalt zich terug bij één vermeden klacht.</p>
<h3>Wat als deelnemers weigeren toestemming te geven voor fotografie?</h3>
<p>Dat is hun recht en dat mag geen invloed hebben op hun deelname aan het evenement. Zorg dat je fotografieteam weet wie niet gefotografeerd wil worden en borg dat in je werkwijze. Dit is een operationeel vraagstuk, geen reden om mensen de deelname te weigeren.</p>`,
    },

    // ARTIKEL 20: Vrijwilligers werven via evenementen
    {
      slug: "vrijwilligers-werven-evenementen",
      title: "Vrijwilligers werven via evenementen: een onderbenutte kans",
      excerpt: "Elk evenement is ook een wervingsevenement voor vrijwilligers. Maar dan moet je het wel zo opzetten. Dit is de aanpak die echt werkt.",
      categoryId: c["vrijwilligers"],
      status: "published",
      publishedAt: new Date("2026-05-10"),
      updatedAt: new Date("2026-05-10"),
      readingTime: 9,
      tags: ["vrijwilligers werven", "vrijwilligers", "evenement", "matching"],
      metaTitle: "Vrijwilligers werven via evenementen: praktische aanpak | Bijeen",
      metaDescription: "Hoe gebruik je evenementen als wervingsinstrument voor vrijwilligers? Praktische aanpak met geleide matching en follow-up strategie.",
      relatedArticles: ["netwerkevenement-organiseren", "deelnemersbeheer-grote-evenementen", "impact-meten-welzijnsevenement"],
      content: `<h2>De vrijwilliger die nooit werd gevraagd</h2>
<p>Er is een paradox in de welzijnssector die ik keer op keer tegenkom. Aan de ene kant klagen organisaties dat ze te weinig vrijwilligers kunnen vinden. Aan de andere kant organiseren diezelfde organisaties evenementen voor honderden mensen uit precies de doelgroep die het meest geneigd is om vrijwilligerswerk te doen, zonder ooit expliciet de vraag te stellen of iemand actief wil worden.</p>
<p>Bij Stichting de Baan organiseerden we een netwerkevenement voor welzijnsprofessionals. In de enquête na afloop vroegen we voor het eerst: "Zou jij je als vrijwilliger willen inzetten voor een project van Stichting de Baan?" Drieëntwintig procent van de respondenten zei ja. Dat zijn concrete leads voor vrijwilligersinzet die er zonder die vraag nooit waren gekomen.</p>

<h2>Evenementen als vrijwilligerspool</h2>
<p>Elk evenement bouwt aan je netwerk van betrokken mensen. Deelnemers die de moeite nemen om naar jouw bijeenkomst te komen zijn al geselecteerd op basis van interesse en betrokkenheid. Dat zijn precies de mensen die ook bereid zijn om een stap verder te gaan als je ze de juiste kans aanbiedt.</p>
<p>De werving begint niet na het evenement maar al bij de registratie. Voeg een vrijwilligersvraag toe aan je aanmeldformulier: "Ik ben geïnteresseerd in vrijwilligerswerk bij [organisatienaam]." Geen commitment, geen druk. Alleen een signaal van interesse dat je kunt opvolgen.</p>

<h2>Tijdens het evenement: zichtbaarheid van vrijwilligerswerk</h2>
<p>Maak vrijwilligerswerk zichtbaar op het evenement zelf. Dat kan op drie manieren:</p>
<h3>Introduceer je vrijwilligers expliciet</h3>
<p>Bedank je vrijwilligers publiekelijk aan het begin of einde van het evenement. Laat hen even staan. Geef hen een naam tag of badge die hen onderscheidt. Dat humaniseert vrijwilligerswerk en maakt het concreet voor mensen die overwegen het te doen.</p>
<h3>Sluit een korte vrijwilligerswerving in het programma</h3>
<p>Vijf minuten aan het einde van het programma: "Wij zoeken mensen die [concreet]. Interesse? Kom na afloop even langs aan de informatietafel of scan deze QR code." Niet meer dan dat. Vrijwilligerswerving moet aanvoelen als een uitnodiging, niet als een smeekbede.</p>
<h3>Gebruik geleide matching</h3>
<p>Als je bij registratie vrijwilligersinteresse hebt gevraagd en bij check-in een matching systeem gebruikt, kun je deelnemers tijdens het evenement koppelen aan relevante vrijwilligersvacatures. Bijeen.app koppelt het vrijwilligersbeheermodule direct aan de evenementenregistratie. Deelnemers die interesse hebben opgegeven bij aanmelding ontvangen na het evenement een gepersonaliseerd bericht over passende vrijwilligersmogelijkheden.</p>

<h2>Follow-up na het evenement</h2>
<p>De wervingskans is het grootst in de 48 uur na het evenement. De deelnemer is positief gestemd, de ervaring is vers en de motivatie is hoog. Stuur een gerichte follow-up naar iedereen die vrijwilligersinteresse heeft getoond:</p>
<ol>
<li>Bedank ze voor hun deelname en hun interesse</li>
<li>Beschrijf één concrete vrijwilligersrol die past bij hun profiel</li>
<li>Voeg een duidelijke call to action toe: "Plan een kennismakingsgesprek van vijftien minuten"</li>
<li>Maak de eerste stap zo laagdrempelig mogelijk</li>
</ol>
<p>Vrijwilligers die via evenementen zijn geworven zijn gemiddeld vijftig procent loyaler dan vrijwilligers die via een advertentie zijn binnengekomen. De gedeelde ervaring van het evenement schept al een band met je organisatie voordat ze ook maar één uur hebben gewerkt.</p>

<h2>De integratie met Platform DAAR</h2>
<p>Voor organisaties die werken met Platform DAAR, het vrijwilligersmatchingplatform met AI-profielen, is Bijeen.app direct integreerbaar. Deelnemers die bij registratie voor een Bijeen evenement aangeven open te staan voor vrijwilligerswerk kunnen automatisch worden doorgeleid naar het DAAR matchingproces. De resultaten zijn zichtbaar voor de organisatie in het Bijeen dashboard. Dit is de meest geavanceerde vorm van evenementgedreven vrijwilligerswerving die op dit moment beschikbaar is in de Nederlandse welzijnssector.</p>

<h2>Veelgestelde vragen</h2>
<h3>Hoe vraag ik om vrijwilligersinteresse zonder opdringerig te zijn?</h3>
<p>Maak het een optie, geen verwachting. Een eenvoudige vraag op het aanmeldformulier ("Ik ben geïnteresseerd in vrijwilligerswerk") is neutraal en niet opdringerig. Volg alleen op bij mensen die dit vakje hebben aangevinkt. Stuur geen wervingsberichten naar alle deelnemers die daar niet om hebben gevraagd.</p>
<h3>Wat is het ideale profiel voor een vrijwilliger die via een evenement wordt geworven?</h3>
<p>Er is geen ideaal profiel. Wat wel geldt: vrijwilligers die via evenementen worden geworven zijn doorgaans al bekend met de sector en je organisatie. Ze hebben een concrete aanleiding en betrokkenheid. Dat maakt ze sneller inzetbaar dan vrijwilligers zonder voorkennis. Stem de vrijwilligersrol af op de expertise die de persoon meebrengt in plaats van te zoeken naar iemand die past in een vaste mal.</p>
<h3>Hoe houd ik bij welke deelnemers vrijwilligers zijn geworden?</h3>
<p>Via Bijeen.app is de koppeling tussen evenementdeelname en vrijwilligersprofiel automatisch. Je kunt per vrijwilliger zien via welk evenement hij of zij is ingestroomd, wat de match was en hoe actief ze sindsdien zijn geweest. Dat is waardevolle data voor je vrijwilligersbeleid en je impactrapportage.</p>`,
    },

  ]);

  console.log("✅ Batch 3 (artikelen 15-20) geseed.");
  console.log("🎉 Alle 20 kennisbank artikelen succesvol aangemaakt!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
