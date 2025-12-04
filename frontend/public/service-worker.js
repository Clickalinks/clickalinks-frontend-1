/**
 * Service Worker for Clickalinks
 * Provides offline caching and faster asset loading
 */

const CACHE_NAME = 'clickalinks-v1';
const RUNTIME_CACHE = 'clickalinks-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Service Worker: Some assets failed to cache', err);
      });
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension:// URLs (cannot be cached)
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip Firebase/Firestore requests (let them go to network)
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    return;
  }

  // Skip backend API requests (let them go to network, don't cache)
  if (url.hostname.includes('onrender.com') || url.hostname.includes('clickalinks-backend')) {
    return;
  }

  // Skip all API requests (any /api/* path)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return;
  }

  // Helper function to safely cache a response
  const safeCachePut = (cache, request, response) => {
    try {
      // Only cache http/https URLs
      if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
        return cache.put(request, response);
      }
    } catch (error) {
      // Silently ignore cache errors (e.g., chrome-extension URLs)
      console.warn('Service Worker: Cache put failed (non-critical):', error.message);
    }
  };

  // Cache strategy: Cache First for static assets, Network First for HTML
  if (request.destination === 'document') {
    // HTML: Network first, fallback to cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses (only http/https)
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              safeCachePut(cache, request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  } else {
    // Static assets: Cache first, fallback to network
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          // Cache successful responses (only http/https)
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              safeCachePut(cache, request, clone);
            });
          }
          return response;
        });
      })
    );
  }
});

