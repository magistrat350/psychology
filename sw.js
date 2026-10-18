/* Service Worker: macht die App offline nutzbar.
 * Strategie: App-Dateien beim Installieren vorladen, danach „stale-while-revalidate“ –
 * sofort aus dem Cache antworten und im Hintergrund aktualisieren.
 * Bei Änderungen an der Dateiliste VERSION erhöhen (tests/unit/sw.test.mjs prüft die Liste). */
const VERSION = "psychopfad-v2";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "data/meta.js",
  "data/modules/0_vorbereitung.js",
  "data/modules/a_steop.js",
  "data/modules/b_basis1.js",
  "data/modules/c_basis2.js",
  "data/modules/d_methoden.js",
  "data/modules/e_diagnostik.js",
  "data/modules/f_anwendung.js",
  "data/modules/g_beruf.js",
  "data/modules/h_bachelorarbeit.js",
  "data/modules/w_wahl.js",
  "data/datasets.js",
  "data/verify.js",
  "data/link-status.js",
  "data/datasets/lernstudie.csv",
  "data/datasets/achtsamkeit.csv",
  "data/datasets/therapie.csv",
  "data/datasets/fragebogen.csv",
  "data/datasets/screening.csv",
  "js/stats.js",
  "js/trainer.js",
  "js/srs.js",
  "js/anki.js",
  "js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { event.waitUntil(network); return cached; }
      const res = await network;
      if (res) return res;
      if (req.mode === "navigate") return (await cache.match("index.html")) || Response.error();
      return Response.error();
    })
  );
});
