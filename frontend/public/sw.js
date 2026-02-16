const CACHE_NAME = 'urban-harvest-hub-v17'; // Version 16 forces the browser to update
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icons/favicon.jpg' // Update this to .jpg
];

// Install: precache app shell so start_url returns 200 when offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.log("Precaching failed, check file paths:", err);
      });
    })
  );
});

// Message handler for UI updates or manual caching
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
              .catch(() => { })
          )
        );
      }).then(() => {
        if (event.source) event.source.postMessage({ type: 'CACHE_URLS_DONE' });
      })
    );
  }
});

// Activate: This is the part that actually DELETES the green box cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate strategy
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