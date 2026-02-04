// ===============================
//  SW — Tuinmo (versión v11)
// ===============================
const SW_VERSION = "tuinmo-sw-v11";
const STATIC_CACHE = `${SW_VERSION}-static`;
const ASSETS_CACHE = `${SW_VERSION}-assets`;
const CONTRACTS_CACHE = `${SW_VERSION}-contracts`;

const API_PREFIX = "/api";
const CONTRACTS_API = "/api/contratos";

const STATIC_ASSETS = [
  "/manifest.json",
  "/logoInmo192.png",
  "/logoInmo512.png",
];

// ==========================
// INSTALL
// ==========================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activar nueva versión ya mismo
});

// ==========================
// HELPERS
// ==========================
// Helper genérico
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  if (cached) {
    // Devuelvo rápido desde cache y actualizo en segundo plano
    networkPromise;
    return cached;
  }

  // Si no hay nada en cache, espero la red
  const res = await networkPromise;
  return res || Response.error();
}


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
  /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|eot)$/.test(p);

// ==========================
// ASSETS — Stale-While-Revalidate
// ==========================
async function handleAsset(request) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || networkPromise || Response.error();
}

// ==========================
// API /contratos — NetworkFirst
// ==========================
async function handleContracts(request) {
  // ahora CONTRATS_CACHE se usa con stale-while-revalidate
  return staleWhileRevalidate(request, CONTRACTS_CACHE);
}
// ==========================
// MENSAJES (para futuras órdenes)
// ==========================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ==========================
// FETCH
// ==========================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Sólo GET
  if (request.method !== "GET") return;

  // Misma origin
  if (!isSameOrigin(url)) return;

  // API /contratos
  if (url.pathname.startsWith(CONTRACTS_API)) {
    event.respondWith(handleContracts(request));
    return;
  }

  // Otras APIs → que las maneje el navegador/servidor, sin cache SW
  if (url.pathname.startsWith(API_PREFIX)) {
    return;
  }

  // Assets estáticos
  if (isAssetPath(url.pathname)) {
    event.respondWith(handleAsset(request));
  }

  // ⚠️ IMPORTANTE: No tocamos request.mode === "navigate"
  // Deja que el navegador y el servidor resuelvan el HTML.
});

// ==========================
// PUSH NOTIFICATIONS (si las usás)
// ==========================
// ====== NOTIFICACIONES ======
self.addEventListener("push", (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    data = {};
  }

  const payload = data || {};
  const notifyClients = self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "PUSH_NOTIFICATION",
        payload,
      });
    });
  });

  const showNotification = self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/logoInmo512.png",
    badge: "/logoInmo192.png",
    vibrate: [200, 100, 200],
    actions: [{ action: "view", title: "Ver recibo" }],
  });

  event.waitUntil(Promise.all([notifyClients, showNotification]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "view") {
    clients.openWindow("/recibos");
  } else {
    clients.openWindow("/");
  }
});

// ====== Mensajes ======
self.addEventListener("message", async (event) => {
  if (event.data?.type === "CLEAR_CONTRACTS_CACHE") {
    await caches.delete(CONTRACTS_CACHE);
    event.ports?.[0]?.postMessage?.({ ok: true });
  }
});
