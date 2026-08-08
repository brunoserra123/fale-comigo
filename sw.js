const CACHE_NAME = 'caa-comunicador-v73';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=73',
  './app.js?v=73',
  './manifest.json',
  './icon.png',
  './pix_qr.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Instalando Service Worker: Fazendo cache dos recursos essenciais...');
      // Mapeia os assets para requests com cache: 'reload' para contornar o cache HTTP do navegador
      const cacheRequests = ASSETS.map(url => new Request(url, { cache: 'reload' }));
      return cache.addAll(cacheRequests);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch events
self.addEventListener('fetch', (e) => {
  // Ignora chamadas externas de nuvem (como o Google Apps Script) para não dar erros de rede offline
  if (
    e.request.url.includes('script.google.com') || 
    e.request.url.includes('script.googleusercontent.com') || 
    e.request.url.includes('drive.google.com')
  ) {
    return;
  }

  // Estratégia Network-First com Fallback para Cache
  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
