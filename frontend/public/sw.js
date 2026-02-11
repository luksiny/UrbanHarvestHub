const CACHE_NAME = 'urban-harvest-hub-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install: precache app shell so start_url returns 200 when offline (Lighthouse PWA)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  // Do not skipWaiting here – wait for user to click "Refresh" so we can show update notification
});

// When the page asks to activate the new worker (user clicked "Refresh")
// or to cache specific URLs for offline (e.g. event detail page)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          event.data.urls.map((url) =>
            fetch(url, { credentials: 'same-origin' })
              .then((res) => {
                if (res && res.status === 200) return cache.put(url, res);
              })
              .catch(() => {})
          )
        );
      }).then(() => {
        if (event.source) event.source.postMessage({ type: 'CACHE_URLS_DONE' });
      })
    );
  }
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate for same-origin GET; serve 200 for start_url when offline (PWA)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Navigation (start_url): serve precached / or /index.html for 200 offline
            if (event.request.mode === 'navigate') {
              return cache.match('/').then((r) => r || cache.match('/index.html'));
            }
            return cachedResponse || undefined;
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
