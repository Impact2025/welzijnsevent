/**
 * Migratie: nieuwe functies (social wall, survey, custom fields, GDPR, white-label)
 *
 * Gebruik:
 *   npx tsx src/db/migrate-features.ts
 */

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🚀 Migratie starten...");

  // ── organizations: custom domain ──────────────────────────
  await sql`
    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS custom_domain TEXT
  `;
  console.log("✓ organizations.custom_domain");

  // ── events: survey + email tracking ───────────────────────
  await sql`
    ALTER TABLE events
    ADD COLUMN IF NOT EXISTS survey_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS survey_questions JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS thank_you_sent_at TIMESTAMP
  `;
  console.log("✓ events: survey_enabled, survey_questions, reminder_sent_at, thank_you_sent_at");

  // ── attendees: networking opt-in + custom responses ───────
  await sql`
    ALTER TABLE attendees
    ADD COLUMN IF NOT EXISTS networking_opt_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS custom_responses JSONB DEFAULT '{}'
  `;
  console.log("✓ attendees: networking_opt_in, custom_responses");

  // ── social_wall_posts ─────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS social_wall_posts (
      id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id    UUID REFERENCES events(id) NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      content     TEXT NOT NULL,
      image_url   TEXT,
      reactions   JSONB DEFAULT '{}',
      status      TEXT DEFAULT 'visible',
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ social_wall_posts");

  // ── survey_responses ──────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS survey_responses (
      id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id         UUID REFERENCES events(id) NOT NULL,
      attendee_id      UUID REFERENCES attendees(id),
      overall_rating   INTEGER,
      nps_score        INTEGER,
      highlights       TEXT,
      improvements     TEXT,
      would_recommend  BOOLEAN,
      custom_answers   JSONB DEFAULT '{}',
      created_at       TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ survey_responses");

  // ── custom_form_fields ────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS custom_form_fields (
      id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_id   UUID REFERENCES events(id) NOT NULL,
      label      TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'text',
      options    JSONB DEFAULT '[]',
      required   BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✓ custom_form_fields");

  console.log("\n✅ Alle migraties succesvol uitgevoerd!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("❌ Migratie mislukt:", err);
  process.exit(1);
});
