// sw.js
const CACHE_NAME = 'memory-game-cache-v1';
const urlsToCache = [
  '/memory-games-app-6.0/',
  '/memory-games-app-6.0/index.html',
  '/memory-games-app-6.0/style.css',
  '/memory-games-app-6.0/script.js',
  '/memory-games-app-6.0/icon-192.png',
  '/memory-games-app-6.0/icon-512.png',
  '/memory-games-app-6.0/manifest.json',
  '/memory-games-app-6.0/match.mp3',
  '/memory-games-app-6.0/mismatch.mp3',
  '/memory-games-app-6.0/flip.mp3',
  '/memory-games-app-6.0/win.mp3',
  '/memory-games-app-6.0/toggle.mp3',
  '/memory-games-app-6.0/info.mp3',
  '/memory-games-app-6.0/time-up.mp3',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
