const CACHE_NAME = 'qr-generator-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './scripts/functions.js',
    './data/countries.js',
    './assets/img/site.webmanifest',
    './assets/img/qr.svg',
    './assets/img/qrPagina.png',
    './assets/img/apple-touch-icon.png',
    './assets/img/favicon.ico',
    './assets/img/favicon-96x96.png',
    './assets/img/web-app-manifest-icon.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Instalar el service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caché abierta');
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

// Estrategia de caché: caché primero, luego red
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en caché, devuelve la respuesta cacheada
                if (response) {
                    return response;
                }

                // Clonamos la solicitud porque la vamos a usar y solo se puede usar una vez
                const fetchRequest = event.request.clone();

                // Buscamos en la red
                return fetch(fetchRequest)
                    .then(response => {
                        // Verifica que sea una respuesta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clona la respuesta porque va a ser consumida dos veces
                        const responseToCache = response.clone();

                        // Solo cachea recursos de nuestro dominio o CDNs específicos
                        if (event.request.url.includes(self.location.origin) ||
                            event.request.url.includes('cdn.jsdelivr.net') ||
                            event.request.url.includes('cdnjs.cloudflare.com')) {

                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch(() => {
                        // Si la red falla y es una página HTML, muestra la versión offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
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