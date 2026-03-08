// sw.js - මතක තරඟය සඳහා සම්පූර්ණ සේවා සේවකය
const CACHE_NAME = 'memory-game-cache-v5'; // අනුවාදය වෙනස් කිරීමට අමතක නොකරන්න

// Cache කළ යුතු සියලු ගොනු
const urlsToCache = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',        // මෙම ගොනුව නොමැති නම් ඉවත් කරන්න
  './level-up.mp3',
  './assistantSound.mp3',
  './timeSound.mp3',
  './time-up.mp3',
  './match.mp3',
  './mismatch.mp3',
  './win.mp3',
  './flip.mp3',
  './toggle.mp3',
  './info.mp3'
];

// Install ඉසව්ව - සියලු ගොනු cache කරන්න
self.addEventListener('install', event => {
  console.log('Service Worker ස්ථාපනය වෙමින්...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache විවෘත කරන ලදී');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // නව SW වහාම සක්‍රීය කරන්න
  );
});

// Activate ඉසව්ව - පැරණි cache ඉවත් කර වහාම පාලනය ගන්න
self.addEventListener('activate', event => {
  console.log('Service Worker සක්‍රීය වෙමින්...');
  event.waitUntil(
    Promise.all([
      // පැරණි cache මකා දමන්න
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('පැරණි cache ඉවත් කරමින්:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // වහාම සියලු පිටු පාලනයට ගන්න
      self.clients.claim()
    ])
  );
});

// Fetch ඉසව්ව - ඉල්ලීම් සඳහා පිළිතුරු සපයන්න
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // cache එකේ තිබේ නම් එය return කරන්න
        if (response) {
          return response;
        }

        // cache එකේ නැතිනම්, ජාලයෙන් ලබාගන්න
        return fetch(event.request)
          .then(networkResponse => {
            // ලැබුණු ප්‍රතිචාරය cache එකට එකතු කරන්න (අවශ්‍ය නම් පමණක්)
            // නමුත් අපි මෙහිදී අලුත් ගොනු cache නොකරමු (විකල්ප)
            return networkResponse;
          })
          .catch(error => {
            // ජාලය අසමත් වූ විට, HTML ඉල්ලීමක් නම් offline පිටුව පෙන්වන්න
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./offline.html');
            }
            // වෙනත් ගොනු සඳහා දෝෂය දිගටම යවන්න
            throw error;
          });
      })
  );
});
