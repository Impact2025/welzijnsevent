const CACHE_VERSION = "v1";
const STATIC_CACHE  = `bijeen-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `bijeen-dynamic-${CACHE_VERSION}`;

// ── Install: pre-cache shell ──────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/offline", "/manifest.json"])
    )
  );
  self.skipWaiting();
});

// ── Activate: purge stale caches ─────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch strategies ──────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // API routes: always network, never cache
  if (url.pathname.startsWith("/api/")) return;

  // Next.js static chunks: cache-first (immutable)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Static assets (images, fonts): cache-first
  if (/\.(png|jpg|jpeg|svg|ico|woff2?|ttf|webp)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) => hit ?? fetch(request).then((res) => {
          if (res.ok) caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Public event pages (/e/...): network-first, cache fallback
  if (url.pathname.startsWith("/e/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/offline")))
    );
    return;
  }

  // All other pages: network-first, /offline fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match("/offline")))
  );
});

// ── Push: show notification ───────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { return; }

  const { title = "Bijeen", body = "", icon, badge, url = "/" } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:  icon  ?? "/Bijeen-logo-icon.png",
      badge: badge ?? "/Bijeen-logo-icon.png",
      data:  { url },
      vibrate: [100, 50, 100],
    })
  );
});

// ── Notification click: focus or open the target URL ─────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(url) && "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
