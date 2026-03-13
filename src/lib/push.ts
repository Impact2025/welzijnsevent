import webpush from "web-push";
import { db, pushSubscriptions } from "@/db";
import { eq } from "drizzle-orm";

// Initialise VAPID once at module load
// Generate keys once with: npx web-push generate-vapid-keys
// Then add to .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...
//   VAPID_EMAIL=info@bijeen.app
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  icon?: string;
}

export async function sendEventPush(eventId: string, payload: PushPayload) {
  if (!process.env.VAPID_PRIVATE_KEY) return; // silently skip if not configured

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.eventId, eventId));

  if (subs.length === 0) return;

  const message = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    icon:  payload.icon ?? "/Bijeen-logo-icon.png",
    badge: "/Bijeen-logo-icon.png",
    url:   payload.url ?? "/",
  });

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
        message
      )
    )
  );

  // Prune expired subscriptions (HTTP 410 Gone)
  const expired = subs.filter((_, i) => {
    const r = results[i];
    return r.status === "rejected" && (r.reason as { statusCode?: number })?.statusCode === 410;
  });
  if (expired.length > 0) {
    await Promise.all(
      expired.map((sub) => db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id)))
    );
  }
}
