const CACHE_NAME = 'caa-comunicador-v40';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.png',
  './pix_qr.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Instalando Service Worker: Fazendo cache dos recursos essenciais...');
      return cache.addAll(ASSETS);
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

  // Estratégia Stale-While-Revalidate para recursos locais
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(e.request).then((cachedResponse) => {
        const fetchPromise = fetch(e.request).then((networkResponse) => {
          // Salva a cópia mais recente no cache
          if (networkResponse.status === 200) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Retorna index.html como fallback em falhas de rede se o recurso for um documento
          if (e.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
        });

        // Retorna o cache imediatamente se houver, ou espera pela rede
        return cachedResponse || fetchPromise;
      });
    })
  );
});
