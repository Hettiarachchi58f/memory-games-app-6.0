const CACHE_NAME = 'memory-game-v8.1.4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './creator-mobile.png',
  './match.mp3',
  './mismatch.mp3',
  './win.mp3',
  './flip.mp3',
  './toggle.mp3',
  './info.mp3',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.error('Cache addAll failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // මෙය ඉවත් කරන්න
  // if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            if (event.request.mode === 'navigate') {
              return caches.match('./offline.html');
            }
            return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});
[file content end]
