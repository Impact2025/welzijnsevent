import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS rapport_leads (
      id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      email             TEXT        NOT NULL,
      naam              TEXT,
      organisatie_naam  TEXT,
      evenement_naam    TEXT,
      gemeente          TEXT,
      aantal_deelnemers INTEGER,
      doelgroepen       JSONB,
      themas            JSONB,
      email_sent        BOOLEAN     DEFAULT false,
      created_at        TIMESTAMP   DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS rapport_leads_email_idx ON rapport_leads(email)`;
  await sql`CREATE INDEX IF NOT EXISTS rapport_leads_created_at_idx ON rapport_leads(created_at DESC)`;

  console.log("rapport_leads aangemaakt");
}

migrate().catch(console.error);
