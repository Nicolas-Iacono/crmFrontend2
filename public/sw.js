// sw.js — Tuinmo (Opción A: network-first para /api/contratos)
// ====== CONFIG ======
const SW_VERSION       = "tuinmo-sw-v2"; // <-- cambiá esto en cada release del SW
const STATIC_CACHE     = `${SW_VERSION}-static`;
const RUNTIME_CACHE    = `${SW_VERSION}-runtime`;
const CONTRACTS_CACHE  = `${SW_VERSION}-contratos`;

const API_PREFIX       = "/api";
const CONTRACTS_API    = "/api/contratos";
const LOGIN_PATH       = "/login";

// Precache básico (shell + manifest + íconos)
const PRECACHE_URLS = [
  "/",
  "/index.html",       // si tu server la expone directamente
  "/manifest.json",
  "/assets/logoInmo192.png",
  "/assets/logoInmo512.png"
];

// ====== INSTALL ======
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

// ====== ACTIVATE ======
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE, CONTRACTS_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// ====== HELPERS ======
const isSameOrigin = (url) => new URL(url, self.location.origin).origin === self.location.origin;
const isAssetPath = (p) => /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot|map)$/.test(p);

// Navegaciones (HTML): network-first con fallback al shell (SPA)
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith(LOGIN_PATH)) return fetch(request);

  try {
    const preload = await eventPreloadResponse();
    if (preload) return preload;
  } catch {}

  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match("/index.html")) || (await cache.match("/")) || Response.error();
  }
}

async function eventPreloadResponse() {
  try {
    // @ts-ignore
    if (typeof event !== "undefined" && event.preloadResponse) {
      // @ts-ignore
      return await event.preloadResponse;
    }
  } catch {}
  return null;
}

// Assets: stale-while-revalidate
async function handleAssetRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((res) => {
    if (res && res.status === 200) cache.put(request, res.clone());
    return res;
  });
  return cached || networkPromise;
}

// API /api/contratos: NETWORK-FIRST con fallback a caché
async function networkFirstJSON(request) {
  const cache = await caches.open(CONTRACTS_CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: "offline" }), { status: 503 });
  }
}

// ====== FETCH ======
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  // /api/contratos → network-first
  if (url.pathname.startsWith(CONTRACTS_API)) {
    event.respondWith(networkFirstJSON(request));
    return;
  }

  // Otras APIs: no cachear (van directas a la red)
  if (url.pathname.startsWith(API_PREFIX)) {
    return;
  }

  // Navegaciones (HTML)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Assets estáticos
  if (isAssetPath(url.pathname)) {
    event.respondWith(handleAssetRequest(request));
  }
});

// ====== Mensajes (ej. limpiar cache de contratos al logout) ======
self.addEventListener("message", async (event) => {
  const { type } = event.data || {};
  if (type === "CLEAR_CONTRACTS_CACHE") {
    await caches.delete(CONTRACTS_CACHE);
    event.ports?.[0]?.postMessage?.({ ok: true });
  }
});
