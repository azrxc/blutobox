// Network-first navigation. Never cache user data, responses, files or API calls.
const CACHE = "blutobox-offline-v1";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add("/offline.html")).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("blutobox-offline-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || req.mode !== "navigate" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(fetch(req).catch(async () => (await caches.match("/offline.html")) || new Response("Bluto Box is offline. Reconnect and try again.", {status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}})));
});
