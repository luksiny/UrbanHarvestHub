const CACHE_NAME = 'urban-harvest-hub-v19'; // Bumped version for PWA fix
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icons/favicon.jpg'
].filter(url => url);

// Install: precache app shell
self.addEventListener('install', (event) => {
  console.log('🛡️ SW: Installing v19...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll but catch errors so one missing file doesn't break the entire install
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("🛡️ SW: Precache warning (some files might be missing in dev):", err);
      });
    }).then(() => {
      console.log('🛡️ SW: Install complete, skipping waiting...');
      return self.skipWaiting();
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

// Activate: This is the part that actually DELETES the old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🛡️ SW: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate strategy for the app shell and assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip browser extensions and non-http schemes
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Skip API calls for caching (we handle those via application logic or separate cache)
  if (url.pathname.startsWith('/api')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Check for valid response before caching
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((err) => {
            console.log("🛡️ SW: Fetch failed (offline?):", err);
            // If it's a navigation request and we're offline, return the root
            if (event.request.mode === 'navigate') {
              return cache.match('/').then((r) => r || cache.match('/index.html'));
            }
            return cachedResponse;
          });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});