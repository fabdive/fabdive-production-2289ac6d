// Service Worker désactivé - force le rechargement complet
self.addEventListener('install', () => {
  // Désinstaller immédiatement
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Nettoyer tous les caches existants
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Tous les caches supprimés');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ne pas utiliser le cache - toujours aller chercher sur le réseau
  event.respondWith(
    fetch(event.request, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }).catch(() => {
      // En cas d'erreur réseau, essayer le cache comme fallback
      return caches.match(event.request);
    })
  );
});