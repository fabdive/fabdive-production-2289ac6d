const CACHE_NAME = 'fabdive-v4';
const urlsToCache = [
  '/',
  '/home',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/fabdive-icon.png',
  '/lovable-uploads/7b9debb8-1272-476b-8829-072b56cf0c5d.png'
];

self.addEventListener('install', (event) => {
  // Force immediate activation of new service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Force immediate control of all clients
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});