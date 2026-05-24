const CACHE = 'fotoropa-pro-v1';

const PRECACHE = [
  '/FotoRopaPro.html',
  '/manifest.json',
  '/icon.svg',
];

/* Instalar: pre-cachear archivos propios */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

/* Activar: eliminar caches viejos */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Fetch: cache-first para archivos propios, network-first para externos */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isOwn = url.origin === self.location.origin;

  if (isOwn) {
    /* Cache first para recursos propios */
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        });
      }).catch(() => caches.match('/FotoRopaPro.html'))
    );
  } else {
    /* Network first + cache para CDN (fonts, jszip) */
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
