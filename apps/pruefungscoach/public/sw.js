/* Minimaler Service Worker: macht die App installierbar und liefert eine
 * Offline-Hinweisseite. Lerndaten brauchen den Server — kein Offline-Caching
 * von API-Antworten (verhindert veraltete Lernstände). */
const CACHE = 'pc-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).pathname.startsWith('/api/')) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (req.destination === 'style' || req.destination === 'script' || req.destination === 'image')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(
          (hit) =>
            hit ??
            new Response(
              '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;padding:2rem;text-align:center"><h1>Offline</h1><p>Der Prüfungscoach braucht eine Internetverbindung, damit dein Lernstand gespeichert wird.</p></body></html>',
              { headers: { 'content-type': 'text/html; charset=utf-8' }, status: 503 },
            ),
        ),
      ),
  );
});
