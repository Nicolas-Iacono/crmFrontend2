// ===============================
//  SW — Tuinmo (versión estable)
// ===============================
const SW_VERSION = "tuinmo-sw-v10";
const STATIC_CACHE = `${SW_VERSION}-static`;
const RUNTIME_CACHE = `${SW_VERSION}-runtime`;
const CONTRACTS_CACHE = `${SW_VERSION}-contracts`;

const API_PREFIX = "/api";
const CONTRACTS_API = "/api/contratos";

// ⚠️ NO precachear index.html (Causa pantalla blanca)
const PRECACHE_URLS = [
  "/manifest.json",
  "/logoInmo192.png",
  "/logoInmo512.png",
];

// ==========================
// INSTALL
// ==========================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );

  self.skipWaiting(); // activar nueva versión ya mismo
});

// ==========================
// ACTIVATE
// ==========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(SW_VERSION))
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// ==========================
// HELPERS
// ==========================
const isSameOrigin = (url) =>
  new URL(url, self.location.origin).origin === self.location.origin;

const isAssetPath = (p) =>
  /\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot)$/.test(p);

// ==========================
// NAVIGATION — NetworkFirst
// ==========================
async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (
      (await cache.match("/index.html")) ||
      new Response("Offline", { status: 503 })
    );
  }
}

// ==========================
// ASSETS — Stale-While-Revalidate
// ==========================
async function handleAsset(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || network;
}

// ==========================
// API /contratos — NetworkFirst
// ==========================
async function handleContracts(request) {
  const cache = await caches.open(CONTRACTS_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return (
      (await cache.match(request)) ||
      new Response(JSON.stringify({ offline: true }), { status: 503 })
    );
  }
}

// ==========================
// FETCH
// ==========================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo GET
  if (request.method !== "GET") return;

  // Misma origin
  if (!isSameOrigin(url)) return;

  // API /contratos
  if (url.pathname.startsWith(CONTRACTS_API)) {
    event.respondWith(handleContracts(request));
    return;
  }

  // Otras API
  if (url.pathname.startsWith(API_PREFIX)) {
    return;
  }

  // Navegación (HTML)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Assets
  if (isAssetPath(url.pathname)) {
    event.respondWith(handleAsset(request));
  }
});
