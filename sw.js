const CACHE = 'caa-comunicador-3.0.0';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js', './conversation.js', './ui.js', './storage.js', './driveSync.js', './gestures.js',
  './manifest.json',
  './icon.png',
  './icon-192.png',
  './icon-512.png', './icon-512-maskable.png',
  './apple-touch-icon.png',
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
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url,{cache:'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name.startsWith('caa-comunicador-') && name !== CACHE)
        .map(name => caches.delete(name)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const request = event.request, url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const match = await cache.match(request,{ignoreSearch:true});
        if (match) return match;
        if (request.mode === 'navigate') {
            const shell = await cache.match('./index.html');
            if (shell) return shell;
        }
        const response = await fetch(request);
        if (response.ok) await cache.put(request,response.clone());
        return response;
    })());
});
