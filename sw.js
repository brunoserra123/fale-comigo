// Ao publicar uma nova versão, basta mudar este número (e o ?v= no index.html).
const CACHE_NAME = 'caa-comunicador-v90';

// Arquivos guardados na instalação para o app abrir 100% offline.
// Sem "?v=": o cache é consultado ignorando a query string, então a versão pedida
// pelo index.html (ex.: app.js?v=81) sempre encontra o arquivo mesmo sem internet.
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './pix_qr.png',
  './backup_comunicador_caa_mauro.json',
  './img/card_eu.jpg',
  './img/card_voce.jpg',
  './img/card_comer.jpg',
  './img/card_beber.jpg',
  './img/card_sim.jpg',
  './img/card_nao.jpg',
  './img/card_agua.jpg',
  './img/card_banheiro.jpg',
  './img/card_dormir.jpg',
  './img/card_brincar.jpg',
  './img/card_feliz.jpg',
  './img/card_triste.jpg',
  './img/card_porfavor.jpg'
];

// Instalação: guarda os recursos essenciais
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const cacheRequests = ASSETS.map(url => new Request(url, { cache: 'reload' }));
      return cache.addAll(cacheRequests);
    })
  );
  self.skipWaiting();
});

// Ativação: remove caches de versões antigas
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
    })
  );
  self.clients.claim();
});

// Requisições
self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Só interceptamos GET (POST do formulário/backup, por exemplo, segue direto para a rede)
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Ignora esquemas que não são http(s) (extensões do navegador etc.)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Ignora chamadas externas de nuvem (Google Apps Script / Drive) para não dar erro offline
  if (
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('script.googleusercontent.com') ||
    url.hostname.includes('drive.google.com')
  ) {
    return;
  }

  // Estratégia Network-First com fallback para o cache
  e.respondWith(
    fetch(req).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache)).catch(() => {});
      }
      return networkResponse;
    }).catch(() => {
      // ignoreSearch: app.js?v=81 encontra app.js guardado na instalação
      return caches.match(req, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        if (req.mode === 'navigate') {
          return caches.match('./index.html', { ignoreSearch: true });
        }
        return Response.error();
      });
    })
  );
});
