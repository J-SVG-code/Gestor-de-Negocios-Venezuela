const CACHE_NAME = 'gestorpro-v18-fast-offline';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png',
  './qr-pagomovil.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(ASSETS.map((url) => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cachedRes) => {
        const networkFetch = fetch(e.request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        }).catch(() => cachedRes);

        return cachedRes || networkFetch;
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedRes) => {
      return cachedRes || fetch(e.request).then((res) => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cachedRes);
    })
  );
});
