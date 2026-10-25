/*
 * Service worker de KODI (hors ligne du contenu déjà consulté).
 *
 * - Fichiers de l'application (_next/static, icônes) : cache d'abord, ils sont
 *   versionnés par Next.js.
 * - Pages : réseau d'abord ; hors ligne, dernière version consultée, sinon la
 *   page « Hors ligne ».
 * - Jamais mis en cache : /api/ (professeur, paiements), /auth/, les requêtes
 *   autres que GET et les autres sites (Supabase, Stripe).
 */
const VERSION = "kodi-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/hors-ligne";
const PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

function isStatic(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/contenus/");
}

function cacheable(response) {
  return response && response.ok && response.type === "basic" && !/no-store/.test(response.headers.get("Cache-Control") || "");
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (cacheable(response)) (await caches.open(STATIC_CACHE)).put(request, response.clone());
  return response;
}

async function networkFirst(request, isNavigation) {
  try {
    const response = await fetch(request);
    if (cacheable(response)) (await caches.open(PAGE_CACHE)).put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (isNavigation) {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname === "/sw.js") return;

  if (isStatic(url)) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request, request.mode === "navigate"));
  }
});
