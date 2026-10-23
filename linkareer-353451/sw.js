/* GitHub Pages 재방문 시 오프라인 실행. file://에서는 등록하지 않습니다. */
const CACHE = 'firstliving-static-v5';
const ASSETS = ['./', './index.html', './full.html', './style.css', './data.js', './engine.js', './app.js', './fonts/PretendardVariable.woff2'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('firstliving-static-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request)));
});
