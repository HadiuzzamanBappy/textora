// Minimal service worker to satisfy PWA installability requirements
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Simple pass-through fetch handler
  event.respondWith(fetch(event.request));
});
