const CACHE_NAME = 'memory-game-v8.1.3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png',
  '/assets/images/creator-mobile.png',
  '/assets/sounds/match.mp3',
  '/assets/sounds/mismatch.mp3',
  '/assets/sounds/win.mp3',
  '/assets/sounds/flip.mp3',
  '/assets/sounds/toggle.mp3',
  '/assets/sounds/info.mp3',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
