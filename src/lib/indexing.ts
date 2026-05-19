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
        keyLocation: `${origin}/api/indexnow-key`,
        urlList: urls,
      }),
    });
    console.log(`[IndexNow] status=${res.status} urls=${urls.join(", ")}`);
  } catch (err) {
    console.error("[IndexNow] Fout bij aanmelden:", err);
  }
}

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
