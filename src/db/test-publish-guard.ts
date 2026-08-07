/**
 * Regressietest voor de publicatie-guard, zonder testrunner-afhankelijkheid.
 * Draai met: npx tsx src/db/test-publish-guard.ts
 *
 * Dekt het faalpatroon dat twee keer live is misgegaan: dezelfde titel opnieuw
 * aanbieden mag géén "-2" meer opleveren.
 */
import { decideSlug, blockedSlugReason, slugify } from "../lib/publish-guard.js";

let failed = 0;
function check(naam: string, voorwaarde: boolean, detail = "") {
  if (voorwaarde) {
    console.log(`  ✓ ${naam}`);
  } else {
    console.log(`  ✗ ${naam}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function main() {
  const bestaand = new Set([
    "vrijwilligersdag-organiseren-complete-gids-2",
    "een-bestaand-artikel",
  ]);
  const exists = async (s: string) => bestaand.has(s);

  console.log("decideSlug");

  const nieuw = await decideSlug("een-nieuw-artikel", exists);
  check("onbekende slug wordt aangemaakt", nieuw.action === "create" && nieuw.slug === "een-nieuw-artikel");

  const her = await decideSlug("een-bestaand-artikel", exists);
  check("bestaande slug wordt geüpdatet, niet opgehoogd",
    her.action === "update" && her.slug === "een-bestaand-artikel",
    `kreeg ${her.action}/${"slug" in her ? her.slug : "-"}`);

  const opt = await decideSlug("een-bestaand-artikel", exists, true);
  check("expliciete opt-in maakt wél een -2 variant",
    opt.action === "create" && opt.slug === "een-bestaand-artikel-2");

  console.log("\nblockedSlugReason");

  const gearchiveerd = await decideSlug("one-pager-optimaliseren-zo-val-je-op-als-interimmer", exists);
  check("gearchiveerde off-topic slug wordt geweigerd", gearchiveerd.action === "reject");

  const geconsolideerd = await decideSlug("vrijwilligersdag-organiseren-complete-gids", exists);
  check("geconsolideerde slug wordt geweigerd", geconsolideerd.action === "reject");

  check("het canonieke doel zelf mag wél",
    blockedSlugReason("vrijwilligersdag-organiseren-complete-gids-2") === null);

  console.log("\nslugify");
  check("diakrieten en leestekens", slugify("Wat is Bijéén? Een gids!") === "wat-is-bijeen-een-gids",
    slugify("Wat is Bijéén? Een gids!"));

  console.log(failed === 0 ? "\nAlles groen." : `\n${failed} test(s) gefaald.`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
