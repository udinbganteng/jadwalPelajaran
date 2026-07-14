const CACHE_NAME = 'jadwal-rpl2-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp5xC35qmxA.woff2'
];

// 1. Install Event: Membuat & mengisi cache awal
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Membuka cache & menyimpan asset statis');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Langsung aktifkan service worker yang baru diinstall tanpa menunggu reload
  self.skipWaiting();
});

// 2. Activate Event: Menghapus cache versi lama jika ada perubahan sistem
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Strategi Caching (Cache First, jika gagal ambil dari jaringan)
self.addEventListener('fetch', (event) => {
  // Hanya intercept request dengan skema http/https (mencegah error eksternal extension)
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Jangan cache response jika tidak valid
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Gandakan response untuk disimpan ke cache secara dinamis jika ada asset baru
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback jika network mati dan file tidak ada di cache
        console.log('[Service Worker] Resource tidak ditemukan secara offline');
      });
    })
  );
});