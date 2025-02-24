const CACHE_NAME = 'qr-generator-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css'
];

// Instalar el service worker con menos archivos para evitar errores
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia de caché modificada para ser más robusta: Network first, then cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, intenta guardarla en caché
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            })
            .catch(err => console.log('Error guardando en caché:', err));
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, intenta buscar en la caché
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no está en caché y es una navegación, redirige al index
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('Recurso no disponible sin conexión');
          });
      })
  );
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});