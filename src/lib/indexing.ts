import { google } from "googleapis";

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) { console.warn("[IndexNow] INDEXNOW_KEY niet ingesteld — sla over"); return; }
  if (!urls.length) return;

  try {
    const origin = new URL(urls[0]).origin;
    const host   = new URL(urls[0]).hostname;

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        // De conventionele locatie: public/<key>.txt. Wees hier voorzichtig met
        // een route onder /api/ — die valt onder de auth-middleware en gaf een
        // 307 naar /sign-in, waardoor IndexNow de sleutel niet kon ophalen en
        // élke ping met 422 werd afgewezen.
        keyLocation: `${origin}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (!res.ok) {
      // Niet stil laten falen: dit heeft maandenlang onopgemerkt 422 gegeven.
      const body = await res.text().catch(() => "");
      console.error(`[IndexNow] AFGEWEZEN status=${res.status} ${body.slice(0, 200)} (${urls.length} urls)`);
      return;
    }
    console.log(`[IndexNow] status=${res.status} — ${urls.length} urls aangemeld`);
  } catch (err) {
    console.error("[IndexNow] Fout bij aanmelden:", err);
  }
}

/**
 * LET OP — beperkt inzetbaar. Google's Indexing API ondersteunt officieel
 * alléén pagina's met JobPosting- of BroadcastEvent-structured data. Voor
 * blog- en kennisbankartikelen is dit geen ondersteund gebruik: die aanroepen
 * deden niets nuttigs en zaten in een Promise.allSettled, dus ze faalden stil.
 * Ze zijn in augustus 2026 uit de publicatie-routes gehaald.
 *
 * De functie blijft staan omdat de vrijwilligersvacatures
 * (/e/[slug]/vacatures/[id]) wél binnen het bereik van deze API vallen zodra
 * die pagina's JobPosting-structured data krijgen — nu hebben ze die nog niet.
 * Roep dit dus niet aan voor gewone content; gebruik daarvoor pingIndexNow plus
 * de sitemap.
 */
export async function pingGoogleIndexingAPI(url: string): Promise<void> {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) { console.warn("[Google Indexing] GOOGLE_SERVICE_ACCOUNT_JSON niet ingesteld — sla over"); return; }

  try {
    const credentials = JSON.parse(json) as object;

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });
    const client      = await auth.getClient();
    const tokenResp   = await client.getAccessToken();
    const accessToken = tokenResp.token;

    if (!accessToken) { console.warn("[Google Indexing] Geen access token verkregen"); return; }

    const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    });

    const data = await res.json();
    console.log(`[Google Indexing] status=${res.status}`, data);
  } catch (err) {
    console.error("[Google Indexing] Fout bij aanmelden:", err);
  }
}
