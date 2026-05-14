/**
 * Migratie: vrijwilligersmodule (volunteer_vacancies, volunteer_profiles,
 * vacancy_applications, vacancy_invitations, volunteer_messages)
 *
 * Gebruik:
 *   npx tsx src/db/migrate-volunteers.ts
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
} catch { /* no .env.local */ }

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🚀 Vrijwilligersmodule migratie starten...");

  await sql`
    CREATE TABLE IF NOT EXISTS volunteer_vacancies (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      title            TEXT NOT NULL,
      description      TEXT,
      category         TEXT DEFAULT 'overig',
      spots_available  INTEGER DEFAULT 1,
      location         TEXT,
      shift_date       TIMESTAMP,
      shift_start      TEXT,
      shift_end        TEXT,
      requirements     JSONB DEFAULT '[]',
      status           TEXT DEFAULT 'draft',
      sort_order       INTEGER DEFAULT 0,
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ volunteer_vacancies");

  await sql`
    CREATE TABLE IF NOT EXISTS volunteer_profiles (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id         UUID REFERENCES events(id) ON DELETE SET NULL,
      organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      attendee_id      UUID REFERENCES attendees(id),
      name             TEXT NOT NULL,
      email            TEXT NOT NULL,
      phone            TEXT,
      skills           JSONB DEFAULT '[]',
      availability     TEXT,
      bio              TEXT,
      status           TEXT DEFAULT 'actief',
      created_at       TIMESTAMP DEFAULT NOW(),
      updated_at       TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ volunteer_profiles");

  await sql`
    CREATE TABLE IF NOT EXISTS vacancy_applications (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vacancy_id            UUID NOT NULL REFERENCES volunteer_vacancies(id) ON DELETE CASCADE,
      volunteer_profile_id  UUID NOT NULL REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
      motivation            TEXT,
      status                TEXT DEFAULT 'pending',
      internal_notes        TEXT,
      reviewed_by           TEXT,
      applied_at            TIMESTAMP DEFAULT NOW(),
      reviewed_at           TIMESTAMP
    )
  `;
  console.log("✓ vacancy_applications");

  await sql`
    CREATE TABLE IF NOT EXISTS vacancy_invitations (
      id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vacancy_id            UUID NOT NULL REFERENCES volunteer_vacancies(id) ON DELETE CASCADE,
      volunteer_profile_id  UUID REFERENCES volunteer_profiles(id),
      invited_email         TEXT NOT NULL,
      invited_name          TEXT,
      invited_by            TEXT NOT NULL,
      personal_message      TEXT,
      token                 TEXT UNIQUE NOT NULL,
      status                TEXT DEFAULT 'pending',
      expires_at            TIMESTAMP NOT NULL,
      responded_at          TIMESTAMP,
      created_at            TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ vacancy_invitations");

  await sql`
    CREATE TABLE IF NOT EXISTS volunteer_messages (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      event_id         UUID REFERENCES events(id),
      vacancy_id       UUID REFERENCES volunteer_vacancies(id),
      sender_id        TEXT NOT NULL REFERENCES auth_users(id),
      recipient_email  TEXT NOT NULL,
      recipient_name   TEXT,
      subject          TEXT NOT NULL,
      body             TEXT NOT NULL,
      read_at          TIMESTAMP,
      created_at       TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ volunteer_messages");

  console.log("\n✅ Vrijwilligersmodule migratie succesvol uitgevoerd!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Migratie mislukt:", err);
  process.exit(1);
});
