# 🚀 WelzijnsEvent — Claude Code Bouwprompt

## Wat je gaat bouwen
Een professioneel **event management platform voor de Nederlandse welzijnssector** — "WelzijnsEvent.nl".
Organisaties kunnen evenementen beheren, deelnemers inchecken, live Q&A en polls doen, en impactrapportages genereren.

Het design is gebaseerd op de bijgevoegde screenshot (Google Stitch design) met 5 mobiele schermen.

---

## Tech Stack
| Onderdeel | Keuze |
|-----------|-------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Realtime | Pusher |
| Hosting | Vercel |
| Charts | Recharts |
| Icons | Lucide React |

---

## Stap 1 — Project aanmaken (PowerShell)

```powershell
npx create-next-app@latest welzijnsevent --typescript --tailwind --app --src-dir --import-alias "@/*"
cd welzijnsevent
```

## Stap 2 — Dependencies installeren

```powershell
npm install @neondatabase/serverless drizzle-orm drizzle-kit
npm install @clerk/nextjs
npm install pusher pusher-js
npm install lucide-react date-fns date-fns
npm install recharts
npm install clsx tailwind-merge tailwindcss-animate class-variance-authority
npm install qrcode @types/qrcode
npm install -D @types/node
```

## Stap 3 — Bestanden kopiëren

Kopieer alle meegeleverde bestanden naar je project:
- `package.json` → root
- `tailwind.config.ts` → root
- `next.config.js` → root
- `tsconfig.json` → root
- `drizzle.config.ts` → root
- `.env.example` → root (kopieer naar `.env.local` en vul in)
- `src/` map → volledig overschrijven

## Stap 4 — Omgevingsvariabelen

Maak `.env.local` aan op basis van `.env.example`:

```
DATABASE_URL=postgres://...           # van neon.tech
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...  # van clerk.com
CLERK_SECRET_KEY=sk_...
PUSHER_APP_ID=...                     # van pusher.com (cluster: eu)
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=eu
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=eu
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stap 5 — Database opzetten

```powershell
# Genereer migraties
npm run db:generate

# Push naar Neon
npm run db:push

# Vul met testdata
npx tsx src/db/seed.ts
```

## Stap 6 — Dev server starten

```powershell
npm run dev
```

Open http://localhost:3000

---

## Stap 7 — GitHub + Vercel deployen

```powershell
# GitHub repo aanmaken
git init
git add .
git commit -m "init: WelzijnsEvent"
gh repo create welzijnsevent --public --push

# Vercel deployen
npx vercel login
npx vercel --prod
```

**In Vercel dashboard:**
1. Settings → Environment Variables → voeg alle `.env.local` vars toe
2. Settings → Git → koppel GitHub repo voor auto-deploy

---

## Claude Code Prompt — gebruik dit in `claude` sessie

Start Claude Code in je projectmap:
```powershell
cd welzijnsevent
claude
```

Plak dan deze prompt:

```
Je werkt aan WelzijnsEvent — een professioneel Dutch welfare sector event platform.
De basisbestanden zijn al aangemaakt. Jouw taak is de app af te bouwen en werkend te maken.

DESIGN REFERENTIE: Zie bijgevoegde screenshot met 5 schermen:
1. Organizer Dashboard (links)
2. Event Detail — Programma
3. Attendee List Management
4. Live Event Control Panel
5. Impact & Analytics Report

KLEURENPALET:
- Primair: #C8522A (terracotta)
- Secundair: #2D5A3D (forest green)
- Achtergrond: #FAF6F0 (cream)
- Tekst: #1C1814 (ink)

TAKEN — voer ze uit in volgorde:

## TAAK 1: Ontbrekende route-structuur aanmaken
Next.js gebruikt [id] voor dynamische routes. Hernoem de tijdelijke "id" mappen:
- src/app/dashboard/events/id/ → src/app/dashboard/events/[id]/
- src/app/dashboard/events/id/deelnemers/ → src/app/dashboard/events/[id]/deelnemers/
- src/app/dashboard/events/id/live/ → src/app/dashboard/events/[id]/live/
- src/app/dashboard/events/id/analytics/ → src/app/dashboard/events/[id]/analytics/
- src/app/dashboard/events/id/netwerk/ → src/app/dashboard/events/[id]/netwerk/

Fix alle "params.id" referenties zodat ze kloppen na de hernoeming.

## TAAK 2: Ontbrekende pagina's bouwen

### 2a. Events overzicht pagina
Maak: src/app/dashboard/events/page.tsx
- Lijst van alle evenementen van de organisatie
- Filter tabs: Alle | Actief | Live | Concept | Afgelopen
- Zoekbalk bovenaan
- EventCard component per event (al aangemaakt in src/components/events/event-card.tsx)
- "Nieuw evenement" knop rechtsboven

### 2b. Nieuw evenement aanmaken
Maak: src/app/dashboard/events/new/page.tsx
- Formulier met: titel, beschrijving, locatie, datum/tijd, max. deelnemers
- Submit POST naar /api/events
- Redirect naar event detail na aanmaken
- Gebruik controlled form state (useState), GEEN HTML <form> tags maar button met onClick

### 2c. Netwerk pagina
Maak: src/app/dashboard/events/[id]/netwerk/page.tsx
- Toon network matches voor het event
- Twee kolommen: Deelnemer A ↔ Deelnemer B
- Match score als percentage badge
- "Reden van match" tekst
- Als geen matches: lege staat met uitleg

### 2d. Instellingen pagina
Maak: src/app/dashboard/instellingen/page.tsx
- Organisatie naam en logo
- Primaire kleur kiezen (kleurpicker)
- Account instellingen
- Betalingsplan (Basis / Welzijn Pro / Congres)

## TAAK 3: API routes completeren

### 3a. Polls API
Maak: src/app/api/polls/route.ts
- GET: haal actieve poll op voor een event (?eventId=)
- POST: maak nieuwe poll aan
- PATCH: update poll (sluit poll, update votes)
- Broadcast via Pusher op poll:updated event

### 3b. Events [id] API
Maak: src/app/api/events/[id]/route.ts
- GET: haal één event op met sessies en statistieken
- PATCH: update event (status, details)
- DELETE: verwijder event

### 3c. Sessions API
Maak: src/app/api/sessions/route.ts
- GET: sessies voor een event (?eventId=)
- POST: nieuwe sessie aanmaken
- PATCH: start/stop live status van sessie

### 3d. Check-in via QR
Maak: src/app/api/checkin/qr/route.ts
- POST met { qrCode: string }
- Zoek deelnemer op via qrCode veld
- Zet status op "ingecheckt" + timestamp
- Return deelnemer naam voor bevestigingsscherm

## TAAK 4: Realtime features

### 4a. Live Q&A realtime in live/page.tsx
Het Pusher kanaal is al opgezet. Controleer:
- useEffect subscribet op `live-{eventId}` kanaal
- Bindt aan qa:new → voeg toe aan messages state
- Bindt aan qa:updated → update bestaand bericht
- Cleanup: unsubscribe bij unmount

### 4b. Live poll updates
- Bind aan poll:updated in hetzelfde kanaal
- Update poll state realtime
- Animated progress bars bij stemmen

### 4c. Check-in toast notificatie
- Bij attendee:checkin event: toon toast met deelnemers naam
- Gebruik een simpele toast state bovenaan het scherm

## TAAK 5: QR Code generatie

In de attendee detail view:
- Genereer QR code met het `qrcode` package
- toon als <img> met data URL
- Knop "Download QR" 
- Knop "Stuur per e-mail" (placeholder)

```typescript
import QRCode from 'qrcode';
const qrDataUrl = await QRCode.toDataURL(attendee.qrCode);
```

## TAAK 6: Responsive polish

- Controleer alle pagina's op mobile (max-w-md mx-auto)
- Bottom navigation consistent op alle event-subpagina's
- Loading states: voeg skeleton loaders toe waar async data geladen wordt
- Error boundaries: wrap pagina's in try/catch met nette foutmelding
- Lege staten: elke lijst heeft een "nog niets hier" staat met icon en CTA

## TAAK 7: Seed data verifiëren

Draai: `npx tsx src/db/seed.ts`

Als dat mislukt, fix de seed zodat hij werkt met de Neon database.
Verifieer dat je op /dashboard data ziet.

## VERIFICATIE CHECKLIST

Na alle taken, controleer:
- [ ] npm run dev start zonder errors
- [ ] /dashboard laadt met KPI kaarten en evenementen lijst
- [ ] /dashboard/events/[id] toont programma met sessies
- [ ] /dashboard/events/[id]/deelnemers toont deelnemerslijst
- [ ] /dashboard/events/[id]/live toont control panel
- [ ] /dashboard/events/[id]/analytics toont grafieken
- [ ] Alle Tailwind klassen gebruiken terra-500 voor terracotta
- [ ] npm run build slaagt zonder TypeScript errors

Begin met Taak 1. Draai na elke taak `npm run dev` en check op errors.
Meld wanneer je klaar bent met een taak voordat je de volgende begint.
```

---

## Mappenstructuur eindresultaat

```
welzijnsevent/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          ← sidebar layout
│   │   │   ├── page.tsx            ← overzicht + KPIs
│   │   │   ├── events/
│   │   │   │   ├── page.tsx        ← events lijst
│   │   │   │   ├── new/page.tsx    ← nieuw event
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        ← programma
│   │   │   │       ├── deelnemers/     ← attendee list
│   │   │   │       ├── live/           ← live control
│   │   │   │       ├── netwerk/        ← matching
│   │   │   │       └── analytics/      ← impact
│   │   │   └── instellingen/page.tsx
│   │   ├── api/
│   │   │   ├── events/route.ts
│   │   │   ├── attendees/route.ts
│   │   │   ├── sessions/route.ts
│   │   │   ├── polls/route.ts
│   │   │   ├── qa/route.ts
│   │   │   └── checkin/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   └── kpi-card.tsx
│   │   ├── events/
│   │   │   ├── event-card.tsx
│   │   │   └── session-card.tsx
│   │   ├── attendees/
│   │   │   └── attendee-row.tsx
│   │   ├── live/
│   │   │   ├── qa-message.tsx
│   │   │   └── poll-widget.tsx
│   │   └── analytics/
│   │       └── impact-chart.tsx
│   ├── db/
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── seed.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── pusher.ts
│   ├── types/
│   └── middleware.ts
├── .env.example
├── drizzle.config.ts
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Handige commando's

```powershell
npm run dev          # lokale dev server
npm run build        # productie build
npm run db:push      # schema naar Neon pushen
npm run db:studio    # Drizzle Studio (database UI)
npx tsx src/db/seed.ts  # testdata laden
npx vercel --prod    # deployen naar Vercel
```

---

## Externe services aanmaken

### Neon (database)
1. Ga naar https://neon.tech → Sign up
2. New Project → naam: "welzijnsevent"
3. Kopieer "Connection string" → plak in DATABASE_URL

### Clerk (auth)
1. Ga naar https://clerk.com → Sign up
2. New Application → naam: "WelzijnsEvent"
3. Dashboard → API Keys → kopieer Publishable Key + Secret Key

### Pusher (realtime)
1. Ga naar https://pusher.com → Sign up
2. Create app → naam: "welzijnsevent", cluster: eu
3. App Keys → kopieer alle 4 keys

### Vercel (hosting)
1. Ga naar https://vercel.com → Sign up met GitHub
2. New Project → importeer GitHub repo
3. Environment Variables → voeg alle vars toe
4. Deploy!
