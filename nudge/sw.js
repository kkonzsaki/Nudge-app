/* ============================================================
   Nudge Service Worker — enables offline use + PWA install
   ============================================================ */

const CACHE = 'nudge-v1780106514';
const ASSETS = [
  '/',
  '/index.html',
];

/* Install — cache the app shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activate — clean up old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — serve from cache, fall back to network */
self.addEventListener('fetch', e => {
  /* Don't cache API calls to Vercel proxy or Anthropic */
  if(e.request.url.includes('vercel.app') || 
     e.request.url.includes('anthropic.com')){
    return; /* Let these go straight to network */
  }

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if(cached) return cached;
        return fetch(e.request).then(response => {
          /* Cache successful GET responses */
          if(e.request.method === 'GET' && response.status === 200){
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, copy));
          }
          return response;
        });
      })
      .catch(() => caches.match('/index.html')) /* Offline fallback */
  );
});
