
// Service Worker for Mantra Verse
// Provides cache-based data persistence (Layer 7)

const CACHE_NAME = 'mantra-verse-data-v1';
const DATA_CACHE = 'mantra-verse-data';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Handle data requests
  if (event.request.url.includes('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(event.request);
      })
    );
    return;
  }

  // Handle regular requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for data persistence
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-data') {
    event.waitUntil(performBackgroundSync());
  }
});

// Perform background data synchronization
async function performBackgroundSync() {
  try {
    // Sync data between different storage layers
    const dataCache = await caches.open(DATA_CACHE);
    const keys = await dataCache.keys();
    
    // Process each cached data item
    for (const request of keys) {
      try {
        const response = await dataCache.match(request);
        if (response) {
          const data = await response.text();
          // Broadcast to all clients for synchronization
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_DATA',
              key: request.url.split('/').pop(),
              data: data,
              timestamp: Date.now()
            });
          });
        }
      } catch (error) {
        console.warn('Failed to sync data item:', error);
      }
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Message handler for data storage requests
self.addEventListener('message', (event) => {
  if (event.data.type === 'STORE_DATA') {
    const { key, data } = event.data;
    
    caches.open(DATA_CACHE).then((cache) => {
      const response = new Response(data);
      return cache.put(`/data/${key}`, response);
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
  
  if (event.data.type === 'GET_DATA') {
    const { key } = event.data;
    
    caches.open(DATA_CACHE).then((cache) => {
      return cache.match(`/data/${key}`);
    }).then((response) => {
      if (response) {
        return response.text();
      }
      throw new Error('Data not found');
    }).then((data) => {
      event.ports[0].postMessage({ success: true, data });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  }
});
