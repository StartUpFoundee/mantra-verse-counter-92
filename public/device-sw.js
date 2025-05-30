
// Device Identification Service Worker
// Layer 3: Service Worker Cache for Device ID Persistence

const CACHE_NAME = 'device-identification-v1';
const DEVICE_CACHE_KEY = '/device-id';

// Install event
self.addEventListener('install', (event) => {
  console.log('Device SW: Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Device SW: Cache opened');
      return cache;
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Device SW: Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Device SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intercept device ID requests
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/device-id')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(DEVICE_CACHE_KEY);
      }).then((response) => {
        if (response) {
          console.log('Device SW: Serving cached device ID');
          return response;
        } else {
          console.log('Device SW: No cached device ID found');
          return new Response('', { status: 404 });
        }
      })
    );
  }
});

// Message handler for device ID storage
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_DEVICE_ID') {
    const deviceId = event.data.deviceId;
    console.log('Device SW: Storing device ID:', deviceId);
    
    caches.open(CACHE_NAME).then((cache) => {
      return cache.put(DEVICE_CACHE_KEY, new Response(deviceId));
    }).then(() => {
      console.log('Device SW: Device ID stored successfully');
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      console.error('Device SW: Failed to store device ID:', error);
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});
