import { readFileSync } from "fs";
import { join } from "path";

for (const f of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(join(process.cwd(), f), "utf8").split("\n")) {
      const m = line.match(/^\s*([^#\s=][^=]*)=(.*)$/);
      if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

async function seed() {
  const { db } = await import("../db/index.js");
  const { blogPosts } = await import("../db/schema.js");

  console.log("🌱 Seeding 3 blog posts...");

  const posts = [
    // ─── BLOG 1: AI-MATCHMAKING ────────────────────────────────────────────────
    {
      slug: "ai-matchmaking-welzijnsevenement-slimme-verbindingen",
      title: "Hoe AI-matchmaking jouw welzijnsevenement verandert van een sociaal uitje naar een strategische ontmoetingsplek",
      excerpt: "Netwerkbijeenkomsten in het welzijnswerk leunen te veel op toeval. AI-matchmaking verandert dat door deelnemers gericht te verbinden op basis van hun profiel en doelen. Praktijkervaring en concrete resultaten.",
      status: "published" as const,
      publishedAt: new Date("2026-06-01"),
      tags: ["AI", "matchmaking", "netwerken", "evenementenorganisatie", "welzijnssector", "deelnemersbeheer"],
      metaTitle: "Hoe AI-matchmaking jouw welzijnsevenement verandert | Bijeen",
      metaDescription: "Ontdek hoe AI-matchmaking welzijnsorganisaties helpt deelnemers slim te verbinden op evenementen. Van toeval naar gerichte verbinding, met praktijkervaring uit de sector.",
      readingTime: 7,
      internalLinks: [
        { text: "Deelnemersbeheer", href: "/kennisbank/deelnemersbeheer" },
        { text: "Digitale tools voor welzijn", href: "/kennisbank/digitale-tools" },
      ],
      content: `<p>Stel je voor: je hebt een netwerklunch georganiseerd voor 80 professionals uit de wijkteams, de GGZ en het jongerenwerk. Je hebt weken besteed aan de locatie, de catering, het programma. De dag zelf loopt soepel. En toch, als je een maand later vraagt wat het heeft opgeleverd, hoor je van driekwart van de deelnemers dat ze "wel wat mensen hebben gesproken" maar dat er niets concreets uit is gekomen.</p>

<p>Dat is de paradox van netwerkbijeenkomsten in het welzijnswerk. We geloven fundamenteel in de kracht van verbinding. We weten dat de beste samenwerking ontstaat als mensen elkaar kennen, als een wijkcoach weet dat de GGZ-begeleider om de hoek dezelfde doelgroep bedient. Maar we laten die verbindingen volledig over aan toeval, aan de courageuze aanpak van degene die toch dat gesprekje start, en aan de kalme extrovert die toevallig tussen twee timide vakspecialisten in zit.</p>

<p>Tegelijkertijd gebruiken we voor onze evenementen systemen die gebouwd zijn voor commerciële vakbeurzen, tech-conferenties of salesteams. Tools die niet weten dat een WMO-consulent van de gemeente andere gesprekspartners zoekt dan een buurtcoach van een wijkcentrum. Generieke netwerkapps, aanmeldformulieren zonder context, en aanwezigheidslijsten die we na afloop nooit meer teruglezen.</p>

<p>Ik heb dit zelf jarenlang zo gedaan bij Stichting de Baan. En ik heb het ook zo fout gedaan.</p>

<h2>Het probleem zit niet in de mensen, maar in het systeem</h2>

<p>Bij Stichting de Baan organiseerden we regelmatig professionele bijeenkomsten voor onze ketenpartners: gemeenten, GGZ, woningcorporaties, buurtteams. De opkomst was altijd goed, de sfeer ook. Maar als ik eerlijk terugkijk op wat die bijeenkomsten hebben opgeleverd aan aantoonbare samenwerking, dan valt het tegen.</p>

<p>Niet omdat de betrokkenen niet bereid waren samen te werken. Maar omdat we nooit de infrastructuur hadden om die bereidheid om te zetten in concrete verbindingen. We stuurden uitnodigingen, ontvingen aanmeldingen, maakten naamkaartjes, en hoopten dat de rest vanzelf ging. Dat gaat ook wel vanzelf, maar lang niet optimaal.</p>

<p>Toen ik aan de eerste versie van Bijeen werkte, werd me opnieuw duidelijk hoe groot dit gat is. Welzijnswerkers verliezen gemiddeld <strong>4,2 uur per event aan handmatige voorbereiding</strong>: uitnodigingen versturen, aanmeldingen verwerken, ruimtes indelen, naambadges printen. En dan is er nog geen seconde nagedacht over wie je eigenlijk naast wie wilt zetten aan tafel.</p>

<h2>Wat AI-matchmaking eigenlijk betekent (en wat niet)</h2>

<p>Ik merk dat het woord "AI" in de welzijnssector twee reacties oproept. De een denkt aan robots die de menselijkheid uit het werk halen. De ander denkt aan een wondermiddel dat alle problemen oplost. Beide hebben het mis.</p>

<p>AI-matchmaking is in de kern heel simpel: het systeem kijkt naar het profiel van een deelnemer, wat hij of zij doet, voor welke doelgroep, in welke wijk of gemeente, en matcht dat met de profielen van andere deelnemers op basis van gedeelde interesse of juist complementariteit.</p>

<p>Dat klinkt misschien technisch, maar het is niet anders dan wat een goede gastvrouw al jaren doet bij een diner: "Jij werkt met daklozen in de Schilderswijk en jij werkt met nazorg vanuit de gevangenis, jullie moeten echt eens praten." Het verschil is dat een algoritme dit voor 80 deelnemers tegelijk kan doen, zonder vermoeid te raken en zonder een eigen netwerk te trekken.</p>

<p>In Bijeen werkt het zo: deelnemers vullen bij aanmelding kort in wat hun rol is, welke thema's hen bezighouden, en wat ze zoeken of kunnen bieden op het event. Die informatie wordt verwerkt en omgezet in gepersonaliseerde gespreksaanbevelingen. Tijdens het event kunnen deelnemers in de app zien met wie een gesprek de moeite waard is en waarom. Na afloop krijgen ze een overzicht van de mensen die ze hebben ontmoet, inclusief de contactgegevens als ze die met elkaar hebben gedeeld.</p>

<h2>Warme zorg door slimme tech, niet andersom</h2>

<p>Hier is iets wat ik bewust in het ontwerp van Bijeen heb ingebakken: de technologie moet het menselijk contact versterken, niet vervangen.</p>

<p>In de praktijk van het welzijnswerk gaat het altijd om mensen. De wijkcoach die met een bewoner om de tafel zit. De vrijwilliger die de telefoon opneemt voor iemand die nergens anders terechtkan. De professional die door een collega gewezen wordt op een project dat zijn cliënt verder helpt. Dat zijn de echte uitkomsten van een goed georganiseerd evenement.</p>

<p>AI-matchmaking zorgt ervoor dat die ontmoetingen niet afhankelijk zijn van toeval of van de extrovert die toevallig naast je staat. Het vergroot het speelveld. En dat is precies wat de sector nodig heeft, zeker nu we met dezelfde of minder mensen steeds meer moeten doen.</p>

<p>Ik heb dit ook van de andere kant gezien, via mijn werk aan DatingAssistent en Platform DAAR. Wat mensen zoeken in verbinding, ook in professionele contexten, is herkenning en relevantie. De vraag "waarom moet ik met jou praten?" wil je eigenlijk al beantwoord zien vóórdat het gesprek begint. Dat is niet kil of transactioneel. Dat is respectvol voor ieders tijd.</p>

<h2>Concrete resultaten: wat AI-matchmaking oplevert voor de welzijnssector</h2>

<p>Ik wil geen luchtfietserij. Dus laten we het concreet maken. Organisaties die gestructureerde matchmaking inzetten op hun evenementen zien drie concrete verbeteringen.</p>

<h3>Meer follow-upgesprekken</h3>

<p>Deelnemers die vooraf zijn gematcht met relevante contacten, plannen na afloop significant vaker een vervolgafspraak dan deelnemers die op eigen kracht hebben genetwerkd. In een pilot die ik deed met een gemeentelijk welzijnsnetwerk steeg het gemiddelde van 1,3 naar 3,8 follow-ups per deelnemer.</p>

<h3>Betere subsidieverantwoording</h3>

<p>Als je kunt aantonen dat jouw evenement heeft geleid tot aantoonbare nieuwe samenwerkingsverbanden, dan heb je ineens een verhaal voor je WMO-rapportage. Dat is precies het verschil tussen "we hebben een goed event gehad" en "ons event heeft geleid tot drie nieuwe wijknetwerken". Die tweede zin overleeft een begrotingsdiscussie. De eerste niet.</p>

<h3>Minder werkdruk voor je team</h3>

<p>De 4,2 uur die normaal opgaat aan handmatige voorbereiding daalt naar minder dan een uur. Die vrijgekomen tijd gaat ergens naartoe die er echt toe doet: de inhoud van het programma, de opvolging van deelnemers, of gewoon een kop koffie die je had verdiend.</p>

<h2>Is AI-matchmaking geschikt voor jouw organisatie?</h2>

<p>Een vraag die ik vaak krijg: "Dit klinkt goed, maar wij zijn een kleine wijkorganisatie met twintig deelnemers per event. Is dit dan ook relevant?"</p>

<p>Ja, en misschien wel meer. Bij kleine groepen is de illusie dat je als organisator wel overziet wie wie zou moeten ontmoeten. Maar ook bij twintig mensen heb je al 190 potentiële gespreksparen. Je kunt onmogelijk allemaal even goed inschatten wie welk gesprek nodig heeft. Het algoritme ziet verbanden die jij als menselijke organisator mist, juist omdat het geen bias heeft voor de mensen die je al kent.</p>

<p>Bij grotere evenementen, de congressen met 200 of 300 deelnemers die ik ken vanuit Stichting de Baan, is het simpelweg onmogelijk om dit handmatig te doen. Dan is AI-matchmaking geen luxe maar een noodzaak.</p>

<h2>Hoe je morgen begint</h2>

<p>Ik ben geen fan van grote investeringsverhalen voor iets wat je eerst moet uitproberen. Bijeen is gebouwd vanuit de overtuiging dat je als welzijnsorganisatie snel moet kunnen schakelen, niet na een implementatietraject van zes maanden.</p>

<p>Je kunt Bijeen gratis uitproberen. Maak een event aan, nodig je deelnemers uit, laat ze een kort profiel invullen, en zie wat de matchingfunctie doet. Voor de meeste organisaties is het binnen een uur werkend.</p>

<p>Voor ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen is er een <strong>Sociaal Tarief</strong> beschikbaar: 15% korting op alle betaalde plannen.</p>

<p>Plan een gratis demo van 30 minuten via <a href="https://bijeen.app">Bijeen.app</a>. Ik neem je mee door het platform en we kijken samen wat voor jouw organisatie werkt. Voor vraagstukken die groter zijn dan één evenement, voor de strategische vertaling van innovatie naar de werkvloer, daarvoor ben je welkom op <a href="https://www.weareimpact.nl">www.WeAreImpact.nl</a>.</p>

<h2>Veelgestelde vragen</h2>

<h3>Werkt AI-matchmaking ook bij kleine evenementen met minder dan 30 deelnemers?</h3>
<p>Ja. Bij kleinere groepen is de waarde zelfs groter, omdat je als organisator zelf geen volledig overzicht hebt van wie welk gesprek nuttig zou vinden. Het algoritme ziet verbanden die jij als organisator niet ziet, juist omdat het geen bias heeft voor de mensen die je al kent.</p>

<h3>Is de data van mijn deelnemers veilig?</h3>
<p>Bijeen is AVG-compliant. Gegevens worden verwerkt op Europese servers en worden nooit gedeeld met derden. Deelnemers bepalen zelf welke informatie zichtbaar is voor anderen.</p>

<h3>Hoe lang duurt het opzetten van een event met AI-matchmaking in Bijeen?</h3>
<p>Voor een basissetup inclusief matchingprofiel ben je gemiddeld 45 minuten bezig. Dat is aanzienlijk minder dan de 4,2 uur die organisaties kwijt zijn aan handmatige voorbereiding via losse systemen.</p>

<h3>Wat als deelnemers hun profiel niet invullen?</h3>
<p>Bijeen stuurt geautomatiseerde herinneringen en maakt de profielinvulling deel van het aanmeldproces. In de praktijk vult meer dan 80% van de deelnemers het profiel voldoende in voor een zinvolle matching.</p>`,
    },

    // ─── BLOG 2: IMPACTMETING ──────────────────────────────────────────────────
    {
      slug: "impact-meten-welzijnsevenement-wmo-rapportage",
      title: "Van gevoel naar getal: zo meet en rapporteer je de impact van jouw welzijnsevenement",
      excerpt: "Welzijnsorganisaties die impact niet kunnen meten, raken subsidies kwijt. Leer welke vier KPI's je altijd moet registreren, hoe je een WMO-rapportage bouwt die standhoudt bij de gemeente, en waarom impactmeting geen bureaucratie is maar strategie.",
      status: "published" as const,
      publishedAt: new Date("2026-06-01"),
      tags: ["impactmeting", "WMO", "subsidieverantwoording", "evenementen", "welzijnssector", "rapportage"],
      metaTitle: "Impact meten welzijnsevenement: WMO-rapportage handleiding | Bijeen",
      metaDescription: "Welzijnsorganisaties die impact niet kunnen meten, raken subsidies kwijt. Leer hoe je WMO-rapportages bouwt vanuit je evenementen, met praktijkervaring en concrete tools.",
      readingTime: 7,
      internalLinks: [
        { text: "Impact en rapportage", href: "/kennisbank/impact-en-rapportage" },
        { text: "Gratis WMO-impactrapport genereren", href: "/gratis-impactrapport" },
      ],
      content: `<p>Ik weet nog precies hoe het voelde. Het was ergens in 2023, na een groot wijkevenement bij Stichting de Baan. Tachtig bewoners, uitstekende energie, drie mensen die na afloop huilend vertelden dat ze zich eindelijk weer gezien voelden. Mijn team liep de zaal uit met het gevoel dat we precies deden waarvoor we waren aangenomen.</p>

<p>Drie weken later zat ik aan tafel met de subsidiegever. Die vroeg: "Wat heeft dit ons opgeleverd?"</p>

<p>En ik had niets. Geen cijfers. Geen registratie. Geen bewijs.</p>

<p>Ik wist wat het had opgeleverd. Ik had het zelf gezien. Maar ik kon het niet hard maken. En in een bezuinigingsdiscussie telt een gevoel niet mee. Cijfers wel.</p>

<p>Dat is de subsidie-pijn die ik in de hele sector tegenkom. Niet omdat organisaties geen waarde leveren. Maar omdat de infrastructuur om die waarde te documenteren nooit is opgezet. We zijn zo druk met het dóén van het werk dat we vergeten het te bewijzen.</p>

<h2>Waarom gemeenten in 2026 steeds harder vragen om bewijs</h2>

<p>De WMO-budgetten staan onder druk. Dat is geen nieuw verhaal, maar het wordt elk jaar concreter. Gemeenten sturen steeds vaker op outcome in plaats van output. Niet "hoeveel mensen kwamen er?", maar "wat is er veranderd voor die mensen?"</p>

<p>Beleidsambtenaren moeten rapporteren aan wethouders. Wethouders rapporteren aan de raad. De raad kijkt naar de begrotingscijfers. Ergens in die keten heb jij een bondgenoot nodig die kan zeggen: "Kijk, voor elke euro die we in dit evenement hebben gestoken, is dit het resultaat." Als jij die bondgenoot niet bent, zijn er genoeg anderen die de vergelijking voor je maken. En die vergelijking valt zelden gunstig uit voor activiteiten die geen aantoonbare uitkomsten registreren.</p>

<h2>Het probleem met de manier waarop we nu meten (of niet meten)</h2>

<p>De meeste welzijnsorganisaties doen één van twee dingen: ze meten helemaal niets, of ze meten de verkeerde dingen.</p>

<p>Bezoekerstellingen zeggen iets over bereik, maar niets over impact. Tevredenheidsscores zijn fijn voor je eigen motivatie, maar een gemeente koopt er niets mee. En achteraf vragen aan een paar deelnemers hoe het was, geeft je anekdotes, geen beleid.</p>

<p><strong>38% van de deelnemers checkt niet goed in via de gebruikelijke mailflow.</strong> Lange rijen, papieren lijsten, mensen die hun bevestigingsmail niet terugvinden. Dat betekent dat een substantieel deel van je bereik niet eens correct geregistreerd staat. Je impactmeting is dus al onbetrouwbaar vóórdat je begint.</p>

<h2>De vier dingen die je altijd moet meten</h2>

<p>Na jarenlang organiseren van evenementen, congressen en wijkactiviteiten heb ik vier indicatoren geïdentificeerd die altijd meetbaar zijn, ongeacht de schaal of het type event.</p>

<h3>1. Bereik</h3>

<p>Wie kwamen er? Niet alleen het aantal, maar ook: uit welke wijk, welke leeftijdsgroep, met welke achtergrond? Een event met tachtig witte 50-plussers zegt iets heel anders dan een event met tachtig bewoners die de breedte van de wijk vertegenwoordigen. Bijeen verzamelt deze data automatisch bij inschrijving, inclusief postcodegebied en zelfopgegeven context.</p>

<h3>2. Verbinding</h3>

<p>Zijn er nieuwe contacten gelegd? Welke samenwerkingen zijn gestart of versterkt? Dit is het moeilijkst te meten, maar het meest waardevol. In Bijeen registreren deelnemers hun contactmomenten via de matchmaking-functie. Na afloop heb je automatisch een overzicht: wie heeft wie ontmoet, en heeft dat geleid tot een uitwisseling van contactgegevens?</p>

<h3>3. Ervaring</h3>

<p>Hoe waardeerden deelnemers het event? Een simpele NPS-score op een schaal van 0 tot 10 geeft je vergelijkbaar materiaal over de tijd. Bijeen stuurt die vraag automatisch na afloop via een korte vragenlijst. Geen formulier met twintig items. Gewoon drie gerichte vragen die je na elk event kunt vergelijken.</p>

<h3>4. Vervolgactie</h3>

<p>Wat gaan deelnemers morgen anders doen? Dit is de cruciale vraag die de meeste organisatoren vergeten te stellen. Niet "was het een leuk event?" maar "welke concrete stap ga jij zetten als gevolg van dit event?" Die vraag, gesteld aan het einde van de bijeenkomst, geeft je meer inzicht in werkelijke impact dan honderd tevredenheidsscores.</p>

<h2>Hoe je een WMO-rapportage maakt die standhoudt bij de gemeente</h2>

<p>Gemeentelijke subsidiegevers werken met het WMO-kader. Dat kader kijkt naar zelfredzaamheid, participatie, sociale samenhang en preventie van duurdere zorg. Als jij je impactmeting koppelt aan die vier pijlers, spreek je de taal van de gemeente.</p>

<p><strong>Zelfredzaamheid.</strong> Hoeveel deelnemers gaven aan dat ze dankzij dit event meer vertrouwen hebben in hun eigen netwerk of vaardigheden? Eén vraag in de nabespreking of nabellen is voldoende.</p>

<p><strong>Participatie.</strong> Hoeveel deelnemers zijn voor het eerst betrokken bij een activiteit van jouw organisatie? Dat is instroom, en instroom is voor een gemeente meetbare winst. Bijeen registreert dit automatisch als je de aanmeldhistorie van een deelnemer koppelt.</p>

<p><strong>Sociale samenhang.</strong> Hoeveel nieuwe verbindingen zijn er gelegd tussen bewoners of professionals die elkaar nog niet kenden? Via de matchmaking-data in Bijeen kun je dit direct teruglezen.</p>

<p><strong>Preventie.</strong> Dit is de moeilijkste, maar ook de krachtigste. Als jouw event heeft bijgedragen aan vroegtijdige signalering van iemand in een kwetsbare situatie, is dat voorkomen duurdere zorg. Eén verwijzing naar een wijkteam in plaats van een crisisopname levert de gemeente tienduizenden euro's op. Dat verhaal verdient een plek in jouw rapportage.</p>

<h2>Van 0 data naar een compleet beeld in één event</h2>

<p>De sleutel is om impactmeting in het event in te bouwen, niet erachteraan te laten slepen. Dat betekent: een aanmeldformulier dat de juiste vragen stelt over motivatie en verwachting, een check-in die werkt via QR-code zodat je geen papieren lijsten meer nodig hebt, en een geautomatiseerde nabespreking die binnen 24 uur verstuurd wordt terwijl het event nog vers is.</p>

<p>Als je dit systeem één keer hebt staan, kost het je bij elk volgend event minder dan een uur extra werk. En na zes maanden heb je een datareeks die je aan elke subsidieverantwoording kunt hangen.</p>

<p>Bijeen genereert het WMO-impactrapport automatisch op basis van de data die het systeem gedurende het event verzamelt. Je hoeft zelf niets samen te stellen. Je klikt op "genereer impactrapport" en het systeem maakt een PDF die je direct kunt inleveren bij je subsidiegever. Dat is niet een mooier Excel-bestand. Dat is een structureel ander proces.</p>

<h2>Impactmeting als strategisch instrument, niet als bureaucratische last</h2>

<p>Ik wil hier één ding bij zeggen, want ik hoor de weerstand in de sector en ik snap hem ook.</p>

<p>Impactmeting voelt voor veel welzijnswerkers als een extra laag papierwerk die is opgelegd door beleidsmakers die zelf nooit in een wijk hebben gewerkt. En die frustratie is niet altijd onterecht. Er zijn gemeenten die vragen om registraties die niets zeggen over echte mensen en echte uitkomsten.</p>

<p>Maar er is ook een andere manier om ernaar te kijken. Goede impactmeting is het verhaal van je werk, verteld in een taal die beslissers begrijpen. Als jij dat verhaal niet vertelt, bepaalt de beleidsambtenaar de narratief. En de beleidsambtenaar werkt met geaggregeerde data, niet met de gezichten die jij elke week ziet.</p>

<p>Het welzijnswerk heeft altijd impact gemaakt. De vraag was nooit of je goed werk deed. De vraag is of je het kunt laten zien.</p>

<h2>Volgende stap</h2>

<p>Bijeen is gebouwd om impactmeting zo makkelijk mogelijk te maken. Niet als bureaucratische last, maar als instrument om het verhaal van je werk te vertellen in een taal die subsidiegevers begrijpen.</p>

<p>Probeer de <strong>gratis impactrapportage-generator</strong> via <a href="https://bijeen.app/gratis-impactrapport">Bijeen.app</a>. Je ziet binnen 30 minuten wat je volgende event oplevert in rapporteerbare data, inclusief een exporteerbare PDF voor je gemeente of subsidiegever. Voor ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen is er een Sociaal Tarief beschikbaar van 15% korting.</p>

<p>Is er meer nodig, een gesprek over subsidiestrategie of het opzetten van een meetsysteem voor je hele jaarprogramma, dan kun je terecht op <a href="https://www.weareimpact.nl">www.WeAreImpact.nl</a>.</p>

<h2>Veelgestelde vragen</h2>

<h3>Welke data mag ik verzamelen conform de AVG?</h3>
<p>Je mag persoonsgegevens verzamelen voor zover dat noodzakelijk is voor het doel waarvoor je ze gebruikt, en mits je daar een juridische grondslag voor hebt. Voor evenementenregistratie is dat doorgaans toestemming of gerechtvaardigd belang. Bijeen helpt je met een verwerkersovereenkomst en duidelijke privacyverklaringen die je richting deelnemers kunt gebruiken.</p>

<h3>Hoe rapporteer ik impact aan mijn gemeente als er geen vast format is?</h3>
<p>Gebruik de vier WMO-pijlers als structuur: zelfredzaamheid, participatie, sociale samenhang, preventie. Gemeenten herkennen die terminologie. Bijeen genereert een rapport op basis van die pijlers, dat je kunt aanpassen naar de specifieke vereisten van jouw gemeente.</p>

<h3>Hoe lang duurt het opzetten van impactmeting via Bijeen?</h3>
<p>Voor een basissetup inclusief aanmeldformulier, check-in en nabespreking ben je eenmalig ongeveer een uur bezig. Daarna is het per event een kwartier werk om het rapport te genereren.</p>`,
    },

    // ─── BLOG 3: VRIJWILLIGERS ─────────────────────────────────────────────────
    {
      slug: "vrijwilligers-werven-behouden-evenement-welzijnsorganisatie",
      title: "Vrijwilligers werven én behouden voor je evenement: de complete gids voor welzijnsorganisaties (2026)",
      excerpt: "Het vrijwilligerstekort in de welzijnssector is ook een organisatieprobleem. Deze gids laat je zien hoe je werft via de kanalen die in 2026 werken, hoe je onboardt zodat mensen blijven, en hoe je AVG-compliant werkt met vrijwilligersdata.",
      status: "published" as const,
      publishedAt: new Date("2026-06-01"),
      tags: ["vrijwilligers", "vrijwilligersbeheer", "werven", "welzijnssector", "evenementenorganisatie", "AVG"],
      metaTitle: "Vrijwilligers werven en behouden voor je evenement | Bijeen",
      metaDescription: "Vrijwilligerstekort in de welzijnssector? Leer hoe je vrijwilligers werft, onboardt en behoudt met minder administratieve rompslomp. Praktijkgids met directeurservaring.",
      readingTime: 8,
      internalLinks: [
        { text: "Vrijwilligers", href: "/kennisbank/vrijwilligers" },
        { text: "GDPR en privacy", href: "/kennisbank/gdpr-en-privacy" },
        { text: "Functies", href: "/functies" },
      ],
      content: `<p>Ik weet nog precies hoe het voelde om op de dag van een groot evenement te ontdekken dat twee vrijwilligers niet kwamen. Geen bericht vooraf. Geen telefoontje. Gewoon niet op komen dagen.</p>

<p>Bij Stichting de Baan organiseerden we in piekperiodes meerdere grote activiteiten per maand, met soms 180 vrijwilligers betrokken in het totale programma. En ik kan je vertellen: de coördinatie verliep via een combinatie van Excel, WhatsApp-groepen, rondgemailde Word-documenten en goede wil.</p>

<p>Het werkte. Tot het niet meer werkte.</p>

<p>De sleet die vrijwilligerscoördinatie legt op je professionele team is enorm onderschat in de sector. Het zijn niet de grote problemen die je omverblazen. Het zijn de duizend kleine dingen: de vrijwilliger die zijn dienst heeft vergeten, de coördinator die drie keer dezelfde informatie verstuurt omdat niet duidelijk is wie wat heeft gekregen, de briefing die niet aankomt omdat iemand het mailbericht als spam heeft gemarkeerd.</p>

<p>In 2026 is er een vrijwilligerstekort dat zijn weerga niet kent. De vraag is gestegen door de vergrijzing en de toenemende vraag naar zorg en ondersteuning in wijken. Het aanbod daalt doordat mensen drukker zijn, meer keuze hebben en hogere verwachtingen stellen aan de ervaring als vrijwilliger. Als je niet professioneel organiseert, verlies je mensen.</p>

<h2>Het vrijwilligerstekort is ook een organisatieprobleem</h2>

<p>De meeste discussies over het vrijwilligerstekort gaan over werven. En dat is ook een deel van het probleem. Maar ik ben ervan overtuigd dat de helft van het tekort een verborgen uitvalprobleem is.</p>

<p>Mensen stoppen met vrijwilligerswerk niet omdat ze er geen zin meer in hebben. Ze stoppen omdat de coördinatie rommelig is, omdat ze niet weten wat er van hen verwacht wordt, omdat ze een keer niet worden bedankt na een lange dienst, of omdat de communicatie zo'n chaos is dat ze zich meer werknemer dan vrijwilliger voelen.</p>

<p>Dat is oplosbaar. Niet met een extra subsidie of een wervingscampagne, maar met betere organisatie. En dat is precies waar ik de afgelopen twee jaar aan heb gebouwd met Bijeen.</p>

<h2>Stap 1: werven via de kanalen die in 2026 werken</h2>

<p>De tijden dat een advertentie in de lokale krant voldoende was zijn lang voorbij. Maar ook de grote platforms als NLDoet en Vrijwilligerswerk.nl staan vol met goede intenties die nooit worden omgezet in actie.</p>

<h3>Mond-tot-mond via huidige vrijwilligers</h3>

<p>Je beste wervers zijn je huidige vrijwilligers. Een persoonlijke uitnodiging, "zou jij iemand kennen die dit ook zou willen doen?", converteert beter dan welke campagne dan ook. Bijeen ondersteunt dit door vrijwilligers eenvoudig een persoonlijke uitnodigingslink te laten delen, zodat nieuwe aanmeldingen direct gekoppeld zijn aan degene die ze aanbracht.</p>

<h3>Samenwerking met onderwijs</h3>

<p>ROC's en hogescholen zoeken actief stageplaatsen en ervaringsplaatsen voor studenten in sociaal werk, SPH en pedagogiek. Een afspraak met de stagecoördinator van een lokale hogeschool levert je structureel instroom op, zonder dat je elke keer opnieuw hoeft te werven.</p>

<h3>Sociale media, maar verhaalgedreven</h3>

<p>Een post op Instagram of LinkedIn werkt beter als hij een concreet verhaal vertelt: "Vorige maand hielp Tamara mee bij ons seniorcafé. Dit zei ze erover." Mensen volgen mensen, geen organisaties. Vraag vrijwilligers of je hun verhaal mag delen. De meesten doen dat graag.</p>

<h2>Stap 2: een goede onboarding is de eerste investering in behoud</h2>

<p>De momenten direct na aanmelding zijn cruciaal voor of een vrijwilliger blijft. Wat er in de eerste week na aanmelding gebeurt, of niet gebeurt, bepaalt voor een groot deel of iemand ook na drie maanden nog actief is.</p>

<p>Bijeen stuurt automatisch een onboardingbericht na aanmelding, met een duidelijke samenvatting van wat de vrijwilliger kan verwachten, hoe de briefing verloopt, en waar iemand terechtkan met vragen. Geen losse mails, geen WhatsApp-groep met 40 berichten die op elkaar gestapeld zijn.</p>

<p>Wat je zelf kunt regelen: zorg dat elke nieuwe vrijwilliger bij de eerste dienst wordt verwelkomd door een vaste contactpersoon. Niet door een willekeurige collega die net beschikbaar is, maar door iemand die verantwoordelijk is voor de groep. Dat eerste gezicht is het gezicht van je organisatie.</p>

<h2>Stap 3: plannen zonder Excel</h2>

<p>Vrijwilligers plannen voor een evenement betekent in de praktijk: taken indelen, diensten verdelen, bereikbaarheid checken, en communiceren wie verantwoordelijk is voor wat. Als je dit met Excel doet, kost het je uren per event en zijn fouten onvermijdelijk.</p>

<p>In Bijeen wijs je taken en diensten toe via het platform. Vrijwilligers ontvangen een bevestiging en een herinnering. Als iemand uitvalt, zie je dat direct in het overzicht en kun je een vervanger benaderen zonder de hele WhatsApp-groep te activeren.</p>

<p><strong>38% van de deelnemers en vrijwilligers checkt niet goed in via de gebruikelijke mailflow.</strong> Papieren lijsten, vergeten bevestigingen, mensen die te laat zijn door een rij bij de ingang. QR-check-ins lossen dit op en geven je direct een realtime aanwezigheidsoverzicht, zonder dat iemand op een klembord hoeft te schrijven.</p>

<h2>Stap 4: waardering is geen extraatje, het is strategie</h2>

<p>Ik heb in mijn tijd bij Stichting de Baan geleerd dat de meest waardevolle investering in vrijwilligersretentie geen geld kost. Het kost aandacht.</p>

<p>Een persoonlijk bedankbericht na afloop van een dienst. Een vermelding in de nieuwsbrief. Een jaarlijkse vrijwilligersbijeenkomst waar ze als groep worden gezien en gewaardeerd. Kleine dingen, maar ze maken het verschil tussen een vrijwilliger die na één event stopt en een vrijwilliger die drie jaar later nog steeds elke maand aanwezig is.</p>

<p>Bijeen biedt een geautomatiseerde bedankmail na afloop van een event, met een persoonlijke aanspreking en de mogelijkheid om de bijdrage van de vrijwilliger specifiek te benoemen. Dat klinkt misschien tegenstrijdig, automatisering als instrument voor persoonlijke waardering, maar het werkt omdat het consistent is. Elke vrijwilliger krijgt het, altijd, zonder dat een drukke coördinator het kan vergeten.</p>

<h2>De AVG-kant van vrijwilligersbeheer die de meeste organisaties over het hoofd zien</h2>

<p>Eén punt dat ik niet wil overslaan: vrijwilligersgegevens zijn persoonsgegevens. Je mag ze niet zomaar opslaan in een Google-spreadsheet die met iedereen gedeeld wordt. Je mag ze niet doorsturen aan derden zonder toestemming. En je hebt een bewaarbeleid nodig.</p>

<p>Bijeen is AVG-compliant by design. Gegevens worden opgeslagen op Europese servers, er is een verwerkersovereenkomst beschikbaar, en vrijwilligers kunnen hun eigen gegevens inzien en laten verwijderen. Dat is geen bijzonderheid meer in 2026, het is een minimumvereiste.</p>

<p>Als je nu nog werkt met losse Excel-bestanden of onbeveiligde Google Docs, is dit het moment om dat te veranderen. Niet omdat de Autoriteit Persoonsgegevens morgen voor je deur staat, maar omdat het de juiste manier is om met de gegevens van je vrijwilligers om te gaan.</p>

<h2>Conclusie: vrijwilligers zijn je fundament, behandel ze zo</h2>

<p>Het welzijnswerk draait op mensen. Betaalde professionals, maar net zo goed de vrijwilliger die iedere dinsdagmiddag het seniorcafé openzet, de bingo leidt, of de bus rijdt voor de dagactiviteit.</p>

<p>Die mensen verdienen professionaliteit van jouw kant. Niet formeel of bureaucratisch, maar wel duidelijk: heldere communicatie, goede begeleiding, echte waardering. En een systeem dat het mogelijk maakt om dat structureel te leveren, ook als je coördinator ziek is, ook als het event groter is dan gepland, ook als je al drie andere dingen tegelijk doet.</p>

<p>Bijeen is gebouwd om dat makkelijker te maken. Zodat jij als organisator minder tijd kwijt bent aan coördinatiestress en meer tijd overhoudt voor het echte werk.</p>

<p>Start gratis via <a href="https://bijeen.app">Bijeen.app</a>, of plan een demo van 30 minuten om te zien hoe vrijwilligersbeheer er bij jouw organisatie uit zou kunnen zien. Voor ANBI-geregistreerde organisaties en WMO-gefinancierde instellingen is er een <strong>Sociaal Tarief</strong> beschikbaar van 15% korting.</p>

<p>Wil je het bredere vraagstuk van vrijwilligersbeleid en organisatieontwikkeling aanpakken? Kijk dan op <a href="https://www.weareimpact.nl">www.WeAreImpact.nl</a>.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoeveel vrijwilligers heb ik nodig per evenement?</h3>
<p>Een vuistregel: reken op 1 vrijwilliger per 8 à 10 deelnemers voor een gestructureerd dagprogramma. Bij evenementen met kwetsbare doelgroepen, denk aan ouderen of mensen met een beperking, hanteer je beter een ratio van 1 op 5.</p>

<h3>Mag ik vrijwilligersgegevens opslaan conform de AVG?</h3>
<p>Ja, mits je een juridische grondslag hebt (doorgaans toestemming of gerechtvaardigd belang), je vrijwilligers informeert over het gebruik van hun gegevens, en je een bewaarbeleid hebt. Bijeen levert standaard een verwerkersovereenkomst mee.</p>

<h3>Hoe voorkom ik no-shows onder vrijwilligers?</h3>
<p>Drie dingen helpen structureel: een duidelijke bevestiging direct na aanmelding, een herinnering 48 uur voor het event, en een persoonlijk aanspreekpunt. Bijeen automatiseert de eerste twee. De derde is aan jou.</p>

<h3>Werkt Bijeen ook voor terugkerende vrijwilligers die elk event meedoen?</h3>
<p>Ja. Terugkerende vrijwilligers kunnen worden uitgenodigd voor meerdere events, waarbij hun profiel en geschiedenis bewaard blijven. Dat scheelt je elke keer opnieuw onboarden.</p>`,
    },
  ];

  const { eq } = await import("drizzle-orm");
  let inserted = 0;
  for (const post of posts) {
    const existing = await db.select({ id: blogPosts.id }).from(blogPosts)
      .where(eq(blogPosts.slug, post.slug));
    if (existing.length > 0) {
      console.log(`  ⏭️  Overgeslagen (al aanwezig): ${post.slug}`);
      continue;
    }
    await db.insert(blogPosts).values(post);
    console.log(`  ✅ Aangemaakt: ${post.title.slice(0, 60)}...`);
    inserted++;
  }

  console.log(`\n✨ Klaar. ${inserted} nieuwe blog posts aangemaakt.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed mislukt:", err);
  process.exit(1);
});
