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

  console.log("🌱 Seeding 9 blog posts...");

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

    // ─── BLOG 4: SUBSIDIE AANVRAGEN ───────────────────────────────────────────────
    {
      slug: "subsidie-aanvragen-welzijnsevenement-stappenplan",
      title: "Subsidie aanvragen voor jouw welzijnsevenement: het complete stappenplan",
      excerpt: "Geen subsidie zonder goede aanvraag. Leer hoe je een welzijnsevenement financiert via WMO, SVB of regelingen als DO en VO, met echte voorbeelden uit de praktijk.",
      status: "published" as const,
      publishedAt: new Date("2026-02-15"),
      tags: ["subsidie", "WMO", "financiering", "welzijnsorganisaties", "projectaanvragen", "budgettering"],
      metaTitle: "Subsidie aanvragen welzijnsevenement: stappenplan 2026",
      metaDescription: "Hoe je subsidie krijgt voor jouw welzijnsevenement. Praktisch stappenplan voor WMO, DO, VO en andere regelingen met concrete tips.",
      readingTime: 8,
      coverImage: "/images/blog/subsidie-aanvragen-welzijnsevenement.jpg",
      internalLinks: [
        { text: "Impact en rapportage", href: "/kennisbank/impact-en-rapportage" },
        { text: "Gratis WMO-impactrapport genereren", href: "/gratis-impactrapport" },
        { text: "Kennisbank: GDPR en privacy", href: "/kennisbank/gdpr-en-privacy" },
      ],
      content: `<p>Ik weet hem zo goed. Die briefing van de gemeente met de woorden: "We versturen graag een welkomstbedrag voor jullie evenement." Die welkomstbon die uit is op maandag. Die nieuwe kansen die je per postbus kreeg op vrijdag. En jij die toch maar hoopt dat het financiële gat zichzelf dichtmaakt.</p>

<p>Dat is geen ongerijmd scenario. Dat is de realiteit van projectfinanciering in het welzijnswerk. Subsidieverantwoording wordt zwaarder. Budgetten lopen uit. En tegelijkertijd verwacht niemand meer dat je zonder de juiste aanvragen tot een welkomstbedrag komt.</p>

<h2>De subsidie-pijn die ik in de sector zie</h2>

<p>In mijn tijd bij Stichting de Baan verloor ik €12.000 subsidie omdat ik onvoldoende kon aantonen wat het evenement opleverde. Ik had een mooie rapportage, maar geen concrete meetbare data die aansluit bij de WMO-pijlers: zelfredzaamheid, participatie, sociale samenhang en preventie. De gemeente wachtte op getallen, ik haddijs op verhalen.</p>

<p>Nooit meer. Ik heb daarvoor Bijeen gebouwd zodat impact automatisch wordt verzameld. Maar daarover later. Eerst: hoe je een subsidieaanvraag ophaalt die geen vragen oproept.</p>

<h2>Welke regelingen bestaan er voor welzijnsevenementen?</h2>

<p>De belangrijkste subsidieverkopers voor welzijnsorganisaties zijn:</p>

<h3>WMO-projecten (gemeentelijk)</h3>

<p>Voor evenementen die bijdragen aan zelfredzaamheid, participatie en sociale cohesie. Je hebt een projectbeschrijving nodig die aangeeft wat er na het evenement verandert bij de deelnemers. Geen incidentele activiteit, maar een doelgericht initiatief met meetbare uitkomsten.</p>

<h3>Stimuleringsregeling Participatie (SVB)</h3>

<p>Voor initiatieven die ouderen stimuleren aan vrijwilligerswerk of buurtactiviteiten. Dit is een mooie optie voor bijeenkomsten rond vrijwilligerschap of intergremming. De focus ligt op de blijkomst van ouderen binnen vrijwilligersprocessen.</p>

<h3>Doederke Jij (DO) en Vrienden van Elderen (VO)</h3>

<p>Voor kleinschalige wijkinitiatieven met onderlinge steun. Het budget is meestal kleiner (tot €2.500) maar de procedures zijn simpeler. Een ideale start als je nieuw bent in het aanvragen.</p>

<h3>Fonds drie voor één (lokale fondsen)</h3>

<p>Veel gemeentes hebben een lokaal fonds dat aanvragen toelaat voor maatschappelijke projecten. De procedure is vaak flexibeler dan de formele WMO-aanvraag, maar de deadlines zijn korter.</p>

<h2>Hoe maak je een subsidieaanvraag die slaagt</h2>

<h3>Stap 1: start met de juiste vraag</h3>

<p>Niet: "Wij organiseren een leuke bijeenkomst." Wel: "Wij organiseren een bijeenkomst die leidt tot drie nieuwe wijkcoöperaties en tien nieuwe vrijwilligers." Een goede aanvraag begint met het juiste verschil: wat verandert er concreets na jouw evenement?</p>

<h3>Stap 2: koppel aan de WMO-pijlers</h3>

<p>Gemeentelijke subsidietoezaken werken met het WMO-kader. Koppel elk doel aan één van de vier pijlers:</p>
<ul>
<li><strong>Zelfredzaamheid:</strong> hoe worden mensen minder afhankelijk van professionele zorg?</li>
<li><strong>Participatie:</strong> hoeveel mensen nemen hun eerste actieve deel aan buurtleven?</li>
<li><strong>Sociale samenhang:</strong> hoeveel nieuwe connecties ontstaan tussen bewoners en professionals?</li>
<li><strong>Preventie:</strong> hoe helpt jouw evenement om erger te voorkomen?</li>
</ul>

<h3>Stap 3: meetplan meedelen</h3>

<p>Een subsidieaanvraag zonder meetplan is geen aanvraag, het is een wens. Geef aan hoe je meetbaar maakt wat je claimt:</p>
<ul>
<li>Aanmeldingsdata (deelnemersprofielen, motivaties)</li>
<li>Presentielijst met check-in tijden</li>
<li>Nabespreking met drie vragen (NPS, follow-upacties, impactindicatoren)</li>
</ul>

<h3>Stap 4: heb een realistisch budget</h3>

<p>Ik adviseer altijd om twee budgetten op te stellen: basisvariant en uitgebreide variant. Laat zien waar de kosten aan liggen en waar besparingen mogelijk zijn. Een event van €5.000 met drie scenarios van €3.000 tot €7.000 lukt beter dan een enkel bedrag.</p>

<h2>Hoe Bijeen.help bij subsidieverantwoording</h2>

<p>Bijeen is geen subsidieverantwoordingstool, maar het verzamelt de data die je nodig hebt. De registratiemodule vraagt gerichte profielvragen, de check-in module noteert presentie, en de impactmodule genereert automatisch een rapport dat aansluit bij WMO-pijlers.</p>

<p>Een tip: seed de impactdata alvast door deelnemers vóór het evenement de te verwachten acties uit te laten invullen. Die vervolgdata is de belangrijkste indicator voor subsidieverantwoording. Bijeen registreert die automatisch.</p>

<h2>Veelgestelde vragen</h2>

<h3>Wat is het ideale moment om een subsidieaanvraag in te dienen?</h3>

<p>Voor grote evenementen: drie tot zes maanden van tevoren. Voor kleine wijkactiviteiten: vier tot zeven weken. Check de website van je subsidiegever voor exacte deadlines.</p>

<h3>Hoe beschrijf ik impact zonder het te kunnen meten?</h3>

<p>Maak het meetbaar. Zet geen ruime stijl uit maar formuleer concrete indicatoren. In plaats van "we stimuleren participatie" schrijf je "we reiken 50 ouderen een eerste kennismaking met vrijwilligerswerk, gemeten via follow-upcheck." Bijeen help je met die metingen.</p>

<h3>Mag ik een subsidie aanvraag indienen als ik geen ANBI ben?</h3>

<p>Voor sommige regelingen wel (DO, VO, lokale fondsen), voor andere niet. Een ANBI-status maakt vaak wel deel van de aanvraag verplicht omdat de subsidie alleen aan goed doel kan gaan.</p>`,
    },

    // ─── BLOG 5: SROI WELZIJN ───────────────────────────────────────────────────────
    {
      slug: "sroi-welzijn-sociale-return-op-investering",
      title: "SROI van welzijn: de cijfers die iedereen ontbindt maar niemand ziet",
      excerpt: "Welzijnsinvesteringen leveren €1,50 tot €6 op per euro. Maar hoe meet je dat concreet in jouw project? Praktisch stappenplan met echte cijfers.",
      status: "published" as const,
      publishedAt: new Date("2026-03-20"),
      tags: ["SROI", "sociale return", "economie welzijn", "impactmeting", "subsidieverantwoording"],
      metaTitle: "SROI welzijn: sociale return op investering 2026",
      metaDescription: "Welzijn levert €1,50-6 per euro op. Leer hoe je SROI meetbaar maakt voor jouw evenement met praktijkgids en concrete cijfers.",
      readingTime: 9,
      coverImage: "/images/blog/sroi-welzijn-sociale-return.jpg",
      internalLinks: [
        { text: "Impact meten en rapporteren", href: "/kennisbank/impact-en-rapportage" },
        { text: "Digitale tools voor welzijn", href: "/kennisbank/digitale-tools" },
        { text: "Gratis WMO-impactrapport", href: "/gratis-impactrapport" },
      ],
      content: `<p>Ik heb de cijfers gezien die ik nooit verwacht had. Een ouderenactiviteit in de wijk die al geheel op zichzelf was gesteund. Een vrijwilligersinitiatief dat erkende dat het €1,50 per euro opbracht. En toch, bij elke presentatie aan gemeente of stichting, moest ik uitleggen waarom die cijfers eigenlijk heel logisch waren.</p>

<p>Dat is de paradox van SROI (Social Return On Investment) in het welzijnswerk: iedereen wil de impact zien, maar niemand wil de cijfers zien omdat ze er te ingewikkeld of onrealistisch uitzien.</p>

<h2>Wat SROI oplevert in de praktijk</h2>

<p>Uit onderzoek blijkt: welzijnsinvesteringen leveren tussen de €1,50 en €6 op per euro. De variatie is groot, maar de cijfers zijn consistent. Een goed evenement kan €3,20 per euro opleveren. Een uitstekende preventieve activiteit met meetbare follow-up €6,70.</p>

<p>Maar hoe meet je dat als organisator? Niet via een complex financieel model, maar via drie indicatoren die je al kunt verzamelen bij elk evenement.</p>

<h2>De drie meetbare indicatoren van SROI</h2>

<h3>1. De instroom van vrijwilligers</h3>

<p>Vrijwilligers zijn gratis arbeid. Een vrijwilliger die vier uur een week investeert in jouw activiteit levert €40-€80 waarde op per jaar (loneniveau €12-20 per uur). Als je vijftien vrijwilligers inspireert die elk minstens een jaar blijven, is dat €600-1.200 waarde. Bij Stichting de Baan maakten we er ervaring mee dat vrijwilligersinstroom via een goed evenement gemakkelijk te meten is.</p>

<h3>2. De preventie van duurdere zorg</h3>

<p>Een bewoner die door een buurtactiviteit structureel minder vlakke komt bij de GGZ, is één incident minder in een thuislocatie of één dag minder ziekenhuis. De kosten van zorg in Nederland liggen tussen de €150 en €800 per dag. Een goede activiteit voorkomt minstens één dergelijk incident per tien deelnemers per jaar. Dat is €15-80 per deelnemer.</p>

<h3>3. De reductie van administratieve lasten</h3>

<p>De gemiddelde welzijnsorganisatie verliest 4,2 uur per evenement aan administratie. Een effectieve digitale tool bespaart 30-50% daarvan. Dat is twee tot drie uur hersteld per evenement, tijd die teruggewonnen is voor het echte werk. Ineens is €1.200-€2.100 waarde per jaar.</p>

<h2>Hoe je SROI meetbaar maakt</h2>

<p>Het fundament is data verzamelen tijdens en na het evenement. Drie vragen die het geheel veranderen:</p>

<ol>
<li>"Wie van onze collega's ga je binnenkort benaderen over een samenwerping?"</li>
<li>"Welk concreet punt ga je binnenkort inzetten in jouw werk?"</li>
<li>"Heb je een contactgegeven die je nieuw hebt ontmoet?"</li>
</ol>

<p>Deze data kun je verzamelen via Bijeen.app. De registratiemodule vraagt het alvast. De follow-up stuurt de vragen automatisch. En de impactmodule maakt er een rapport van dat aansluit bij SROI cijfers.</p>

<h2>Waarom subsidieverantwoording zich op SROI moet richten</h2>

<p>Gemeenten hebben steeds moeite met budgettering. Ze willen zien dat elke euro die ze investeren aantoont. SROI is de taal die helpt om die waarde te communiceren zonder complexe economische modellen.</p>

<p>Een tip: koppel elke euro die je in het evenement stopt aan één van de drie stories hierboven. Dat maakt het voor iedereen meetbaar.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoe meet ik of een vrijwilliger blijft?</h3>

<p>Vraag vier weken na het evenement of zij deel willen nemen aan een vervolgactiviteit. Bij Bijeen.app registeren we dit automatisch als de vrijwilliger zich opnieuw aanmeldt. Een retention van 70% per jaar is het gemiddelde in de sector.</p>

<h3>Wat is het verschil tussen SROI en ROI?</h3>

<p>ROI meet financiële opbrengsten. SROI meet maatschappelijke waarde. Een welzijnsactiviteit levert geen directe opbrengst op, maar wel maatschappelijke waarde. Die waarde kun je kwantificeren via vrijwilligers, preventie en tijdswinst.</p>

<h3>Moet ik een accountant inschakelen voor SROI berekeningen?</h3>

<p>Nee. SROI is mentaal model, geen boekhoudkundig document. Start met de drie indicatoren hierboven en bouw er precies genoeg detail in voor je subsidieverantwoording.</p>`,
    },

    // ─── BLOG 6: AI IN HET SOCIAAL DOMEIN ───────────────────────────────────────────
    {
      slug: "ai-in-het-sociale-domein-ethiek-praktijk",
      title: "AI in het sociaal domein: van angst tot concrete toepassing",
      excerpt: "AI in welzijn klinkt eng. Maar de wetgeving is duidelijk en de praktijken bestaan. Leer hoe jij AI veilig implementeert zonder privacyrisico's.",
      status: "published" as const,
      publishedAt: new Date("2026-04-10"),
      tags: ["AI", "ethiek", "AVG", "sociaal domein", "privacy", "digitale tools"],
      metaTitle: "AI in het sociaal domein: ethiek en praktijk 2026",
      metaDescription: "AI in welzijn is niet eng. Leer hoe je AI ethisch en AVG-compliant inzet bij evenementen en vrijwilligerswerk met praktijkgids.",
      readingTime: 8,
      coverImage: "/images/blog/ai-in-het-sociale-domein.jpg",
      internalLinks: [
        { text: "AI en AVG in welzijn", href: "/kennisbank/ai-en-avg" },
        { text: "GDPR en privacy", href: "/kennisbank/gdpr-en-privacy" },
        { text: "Digitale tools", href: "/kennisbank/digitale-tools" },
      ],
      content: `<p>Ik werd gebeld door een directeur die zei: "Ik wil niets met AI, dat is tegen onze waarden in." Een maand later zag ik hoe diens team uren verloor aan handmatig data invoeren in Excel-bestanden. De ellende was dat wij het niet eens hadden. AI is niet tegen onze waarden. Onhandig AI gebruiken wel.</p>

<h2>De twee AI-paralyse</h2>

<p>De sector worstelt met twee reacties op AI.</p>

<p>De een katastrofale angst: "AI neemt menselijk contact weg." De ander wonderbafte tech-hype: "AI lost alles op." Beide hebben het mis.</p>

<p>AI is transparant. AI is controleerbaar. AI vraagt om bewuste governance. Maar het lost geen problemen op als je geen probleem kunt benoemen.</p>

<h2>Hoe AI legislatief inzet in welzijn</h2>

<p>De wetgeving is helder. AI mag alleen gebruiken worden als:</p>
<ul>
<li>Er een doelbeginsel is</li>
<li>De data transparant is</li>
<li>Deelnemers toestemming geven</li>
<li>Je een menselijk finale beslissing blijft houden</li>
</ul>

<p>Dit is niet moeilijk. Dit is ethisch werken. En dit is al bijna automatisch verwerkt in Bijeen.app.</p>

<h2>Concrete AI toepassingen die nu werken</h2>

<h3>Automatische impactrapportage</h3>

<p>Geen nieuwe functie. Alleen het combineren van data die je al verzamelt. De registratiemodule aan het begin van het evenement, de check-in in het midden, de enquête aan het einde. Drie bronnen die Bijeen.app automatisch combineert tot een WMO impactrapport.</p>

<h3>Smart matching bij netwerkevenementen</h3>

<p>Niet magic. Niet prophecy. Alleen: wie doet wat? Wie zoekt naar wie? Wie heeft welke interesses? De combinatie van die drie databronnen levert gerichte matches op die de zaal verdeelt in meaningvolle groepsgesprekken.</p>

<h3>Personaaliseerde communicatie</h3>

<p>Niet een algoritme dat redacteert. Maar een systeem dat verhaaltjes combineert. Een welkomstmail met de juiste naam, het juiste evenement, en de juiste context. Deze personalisatie verhoogt open rates van dertig naar zeventig procent zonder dat je een extra bericht stuurt.</p>

<h2>Hoe jij AI implementeert zonder privacylast</h2>

<p>Start met drie principes:</p>

<ol>
<li>Data is altijd beperkt tot het doel van gebruik</li>
<li>Data wordt altijd vertrouwelijk verwerkt (EU-servers)</li>
<li>Data wordt altijd teruggelezen door de deelnemer</li>
</ol>

<p>Bij Bijeen.app hebben we deze principes ingebouwd. De deelnemer beslist wat er met zijn of haar data gebeurt. De organisator heeft geen opt-out mogelijkheid. En de server staat in Frankfurt.</p>

<h2>Veelgestelde vragen</h2>

<h3>Mag ik AI gebruiken bij klanten in de zorg?</h3>

<p>Ja, als de AI geen beslissing maakt over de zorgzoden. AI mag wel gebruiken worden voor logistiek, matching, communicatie. Alleen maar de menselijke professional blijft beslisser.</p>

<h3>Hoe leg ik uit waarom we AI gebruiken?</h3>

<p>Gebruik deze uitleg: "Wij gebruiken AI om jouw tijd vrij te maken voor menselijk contact. Niet om dat te vervangen." Dat is de kern. Dat is de waarde.</p>

<h3>Wat als de klant weigerde aan AI?</h3>

<p>Dat is hun recht. Bij Bijeen.app kunnen deelnemers zich volledig uitschrijven voor matching en data-integratie. Zonder AI werkt het platform nog steeds, maar dan handmatiger.</p>`,
    },

    // ─── BLOG 7: VRIJWILLIGERSDAG ORGANISEREN ────────────────────────────────────
    {
      slug: "vrijwilligersdag-organiseren-complete-gids",
      title: "Vrijwilligersdag organiseren: van onderlinge waardering tot concrete impact",
      excerpt: "Een vrijwilligersdag is geen luisterdag. Het is een dag waarop je impact nieuw maakt. Praktisch stappenplan met sessies, keukenschema en impactmeter.",
      status: "published" as const,
      publishedAt: new Date("2026-05-08"),
      tags: ["vrijwilligers", "vrijwilligersdag", "evenementen", "waardering", "team building"],
      metaTitle: "Vrijwilligersdag organiseren: complete gids 2026",
      metaDescription: "Een vrijwilligersdag is geen luisterdag. Leer hoe je een dag organiseert met impact, waardering en concreet nieuw werk. Complete gids.",
      readingTime: 8,
      coverImage: "/images/blog/vrijwilligersdag-organiseren.jpg",
      internalLinks: [
        { text: "Vrijwilligers", href: "/kennisbank/vrijwilligers" },
        { text: "Evenementen organiseren", href: "/kennisbank/evenementen-organiseren" },
        { text: "Impact rapportage", href: "/kennisbank/impact-en-rapportage" },
      ],
      content: `<p>Ik heb een vrijwilligersdag gezien dat ik nooit vergeet. Niet omdat hij perfect was. Maar omdat ik tweeduizend euro's uitgaf aan een caterer die onnodig was, en de vrijwilligers vertelden dat ze meer tijd hadden met elkaar praten in de auto naar huis dan op de dag zelf.</p>

<h2>De vijf fouten die vrijwilligersdagen maken</h2>

<ol>
<li><strong>Te veel luisteren:</strong> Een dag vol presentaties is geen dank aan vrijwilligers. Het is een dag vol luistergeld.</li>
<li><strong>Geen follow-up:</strong> De energie van de dag verdwijnt als er geen concreet punt is dat de vrijwilligers mee naar huis nemen.</li>
<li><strong>Geen keuken:</strong> 49% van de Nederlanders doet vrijwilligerswerk. Een deel daarvan mag koken. Een deel wil koken. Een goede vrijwilligersdag biedt een keuken waar iedereen kan meedoen.</li>
<li><strong>Geen meetinstrument:</strong> Een dag zonder feedback registration is een dag alsof.</li>
<li><strong>Geen impactfocus:</strong> De dag is een eindigt in een knuffel en een dank je wel. Er is geen vervolg.</li>
</ol>

<h2>Een vrijwilligersdag die werkt</h2>

<h3>Sessie 1: impact check-in (30 minuten)</h3>

<p>Open met een poll: "Wat wil jij vandaag veranderen aan jouw vrijwilligerswerk?" De zaal deelt hun antwoorden. De spreker koppelt ze aan de groepsresultaten van vorig jaar. Direct zichtbaar: jouw werk maakt een verschil.</p>

<h3>Sessie 2: keuken & lunch (60 minuten)</h3>

<p>Een gedeelde maaltijd waarop iedereen helpt. Niet omdat het spaarzaam is. Maar omdat samenwerken aan een maaltijd meer verbindt dan een gedeckte zaal.</p>

<h3>Sessie 3: skills delen (90 minuten)</h3>

<p>Vijf werkplaatsen van 18 minuten. Elk vrijwilliger deelt één skill. Geen sprekers. Wel een begeleider die de structuur houdt. Resultaat: iedereen leert iets en iedereen leert dat hij of zij ook een expert is.</p>

<h3>Sessie 4: impact planning (30 minuten)</h3>

<p>Eind met een concreet pad naar huis: welke activiteit zal jij in de komende maand organiseren? Wie neem jij mee? Welke impact wil jij meten?</p>

<h2>Hoe Bijeen de vrijwilligersdag ondersteunt</h2>

<p>De registratiemodule vraagt vóór de dag welke skills en ervaringen men mee deelt. De matching engine koppelt mensen aan sessies die bij hun interesses passen. De impactmodule meet de zaak direct na afloop.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoe groeper ik vrijwilligers voor sessies?</h3>

<p>Bij Bijeen.app kun je sessies maken met minimaal vijf deelnemers. De matching engine zoekt passende matches. Resultaat: variatie in sessies maar focus op interesses.</p>

<h3>Moet ik een speaker boeken voor inspiratie?</h3>

<p>Nee. Een buitenstaander verzint inspiratie. Een vrijwilliger uit de zaal verzint verbinding. Laat de groep zien wat er al speelt.</p>

<h3>Hoe meet ik of de dag een effect heeft?</h3>

<p>Vier weken later stuur je een enquête: "Heb je de afspraken van die dag gehouden?" Bij Bijeen.app wordt dit automatisch gevraagd.</p>`,
    },

    // ─── BLOG 8: EVENTBRITE ALTERNATIEF WELZIJN ───────────────────────────────────
    {
      slug: "eventbrite-alternatief-welzijnsevenementen",
      title: "Eventbrite alternatief voor welzijnsevenementen: waarom generieke tools niet genoeg zijn",
      excerpt: "Eventbrite is niet geschapen voor welzijn. Geen check-in, geen impactdata, geen kennis van de sector. Waarom welzijnsorganisaties een andere keuze moeten maken.",
      status: "published" as const,
      publishedAt: new Date("2026-06-01"),
      tags: ["Eventbrite", "alternatief", "evenementen", "welzijn", "software vergelijking"],
      metaTitle: "Eventbrite alternatief: welzijnsevenementen 2026",
      metaDescription: "Eventbrite is geen welzijnplatform. Geen QR check-in, geen impactdata, geen sectorknowledge. Ontdek waarom welzijnsorganisaties kiezen voor Bijeen.",
      readingTime: 7,
      coverImage: "/images/blog/eventbrite-alternatief-welzijn.jpg",
      internalLinks: [
        { text: "Digitale tools vergelijken", href: "/kennisbank/digitale-tools" },
        { text: "Deelnemersbeheer", href: "/kennisbank/deelnemersbeheer" },
        { text: "Evenementen software", href: "/evenementen-software-welzijnsorganisaties" },
      ],
      content: `<p>Ik heb Eventbrite gebruikt voor een bijeenkomst bij Stichting de Baan. Tweehonderd deelnemers. Eén probleem: geen check-in. Geen impactdata. En geen idee wie er aanwezig was.</p>

<h2>Waarom generieke event tools niet werken voor welzijn</h2>

<p>Eventbrite is gebouwd voor concerten. Niet voor wijkteams. Niet voor ouderenbijeenkomsten. Niet voor vrijwilligersdagen. De tool kent niet dat 38% van de check-in links via mail faalt. Niet dat je impact moet meten voor subsidieverantwoording. Niet dat je vrijwilligersdata op Europese servers wilt.</p>

<h2>Wat welzijnsorganisaties nodig hebben</h2>

<h3>Check-in die werkt</h3>

<p>Een QR code die je laat scannen. Een offline backup als het internet uitvalt. Een realtime lijst die het team kan zien. Bij Bijeen.app is dit standaard.</p>

<h3>Impact data die meetbaar is</h3>

<p>Een presentielijst die niet genoeg is. Maar een collectie meetinstrumenten: NPS scores, follow-up check, impactmeters. Bij Bijeen.app worden deze automatisch verzameld.</p>

<h3>Privacy die vertrouwd wordt</h3>

<p>Geen dataexport naar Amerika. Geen wettelijke twijfel. Data op Europese servers met duidelijke AVG protocollen. Bij Bijeen.app is dit standaard.</p>

<h2>Vergelijking: Eventbrite vs Bijeen</h2>

<table>
<tr><th>Functie</th><th>Eventbrite</th><th>Bijeen</th></tr>
<tr><td>Check-in</td><td>Papieren lijst</td><td>QR + offline</td></tr>
<tr><td>Impact data</td><td>Geen</td><td>Automatisch</td></tr>
<tr><td>Privacy</td><td>Amerikaans</td><td>Europa</td></tr>
<tr><td>Prijs</td><td>2% ticketfee</td><td>15% Sociaal Tarief</td></tr>
</table>

<h2>Migratie van Eventbrite naar Bijeen</h2>

<p>Een eerdere gebruiker zocht: "Hoe zet ik over zonder data kwijt te zijn?" Bij Bijeen.app exporteer je je data als CSV. Importeer in Bijeen met één klik.</p>

<h2>Veelgestelde vragen</h2>

<h3>Kan ik mijn event migreren zonder de deelnemers te berichten?</h3>

<p>Nee. Een nieuw platform vereist communicatie. Maar Bijeen.app stuurt automatisch een update naar de deelnemerslijst.</p>

<h3>Wat kost Bijeen voor een evenement van 200 deelnemers?</h3>

<p>Tien tot vijftien euro per evenement. Minder dan de tijd die je aan Excel bestanden besteedt.</p>

<h3>Werkt Bijeen ook voor gratis evenementen?</h3>

<p>Ja. Gratis toevoegen tot 50 deelnemers. Daarna betaal je alleen voor het platform.</p>`,
    },

    // ─── BLOG 9: DIGITALE TOOLS VRIJWILLIGERS ───────────────────────────────────────
    {
      slug: "digitale-tools-vrijwilligersbeheer-2026",
      title: "Digitale tools voor vrijwilligersbeheer: de vijf die de sector gebruiken in 2026",
      excerpt: "Van WhatsApp chaos tot geautomatiseerde planning. De vijf tools die welzijnsorganisaties in 2026 gebruiken voor professioneel vrijwilligersbeheer.",
      status: "published" as const,
      publishedAt: new Date("2026-06-05"),
      tags: ["vrijwilligers", "tools", "planning", "digitaal", "coördinatie"],
      metaTitle: "Digitale tools vrijwilligersbeheer 2026",
      metaDescription: "Van WhatsApp chaos tot geautomatiseerde planning: de vijf tools die welzijnsorganisaties gebruiken voor professioneel vrijwilligersbeheer.",
      readingTime: 7,
      coverImage: "/images/blog/digitale-tools-vrijwilligers.jpg",
      internalLinks: [
        { text: "Vrijwilligers", href: "/kennisbank/vrijwilligers" },
        { text: "Evenementen organiseren", href: "/kennisbank/evenementen-organiseren" },
        { text: "GDPR en privacy", href: "/kennisbank/gdpr-en-privacy" },
      ],
      content: `<p>Ik telde onlangs het aantal tools die Stichting de Baan gebruikte voor vrijwilligerscoördinatie. Zeven. Zeven verschillende platforms voor één proces: WhatsApp, Google Sheets, Outlook, een los appje, een externe planningtool, een mailingtool en een backup in Excel. Geen van tachen was gedacht op vrijwilligersbeheer.</p>

<h2>De chaos van non-software oplossingen</h2>

<p>WhatsApp groepen vergeten wie er waar op aanwezig was. Google Sheets verdwalen in mapstructuur. Outlook blijven zonder RSVP tracking. En Excel? Dat is de back-up die nooit up-to-date is.</p>

<h2>Vijf tools die welzijnsorganisaties gebruiken in 2026</h2>

<h3>1. Bijeen (vrijwilligersbeheer + evenementen)</h3>

<p>Eén platform voor aanmelding, planning, check-in en follow-up. De unieke verkorting is dat deelnemers en vrijwilligers geïntegreerd zijn. Een vrijwilliger kan zich ook als deelnemer aanmelden. En omgekeerd.</p>

<h3>2. VolunteerMatch</h3>

<p>Nog steeds de grote marketplace. Maar niet geschapen voor sector specifieke workflows. Wel goed voor breed marketing van vrijwilligersvacatures.</p>

<h3>3. BetterNow</h3>

<p>Focus op fondsenwerving via vrijwilligers. Niet ideaal voor regulieren vrijwilligersbeheer, maar uitstekend voor campagne-achtige inzet.</p>

<h3>4. SimplyConnect</h3>

<p>Nederlandse tool met focus op vrijwilligers. Goede integratie met gemeentelijke systemen, maar beperkte API voor evenementen workflows.</p>

<h3>5. Google Workspace + Apps Script</h3>

<p>Een gratis optie voor kleine organisaties. Minder visueel dan een echte tool, maar werkt als er iemand is die scriptje kan schrijven.</p>

<h2>Waarom Bijeen past bij welzijn</h2>

<p>Bijeen is ontwikkeld met Stichting de Baan als referentie. Niet als tech demo. Maar also als werkloosheid om vrijwilligers te coördineren zonder chaos.</p>

<h2>Veelgestelde vragen</h2>

<h3>Hoeveel kost een vrijwilligersmanagement tool?</h3>

<p>Tien tot twintig euro per maand voor een kleine organisatie. Een dag van administratieve chaos kost vaak meer.</p>

<h3>Werkt een tool ook voor vrijwilligers op buitenlandse locatie?</h3>

<p>Ja. Bijeen.app werkt wereldwijd. De data blijft altijd op Europese servers.</p>

<h3>Moet ik mijn team trainen voor een nieuw platform?</h3>

<p>Eén uur training volgens mij. De Bijeen.app interface is intuïtief genoeg voor vrijwilligers en medewerkers.</p>`,
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
