
/**
 * Enhanced 8-Layer Data Persistence System
 * Implements bulletproof storage with advanced backup mechanisms
 */

import LZString from 'lz-string';

// Storage layer types
export enum StorageLayer {
  INDEXED_DB = 'indexeddb',
  LOCAL_STORAGE = 'localStorage', 
  SESSION_STORAGE = 'sessionStorage',
  WINDOW_NAME = 'windowName',
  HISTORY_STATE = 'historyState',
  CSS_VARIABLES = 'cssVariables',
  SERVICE_WORKER = 'serviceWorker',
  BROADCAST_CHANNEL = 'broadcastChannel'
}

// Storage configuration
const STORAGE_CONFIG = {
  MAX_RETRIES: 3,
  COMPRESSION_THRESHOLD: 1000, // bytes
  ENCRYPTION_KEY: 'mantra-verse-secure-key',
  CSS_PREFIX: '--backup-',
  BROADCAST_CHANNEL: 'mantra-verse-sync'
};

// Broadcast channel for cross-tab synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel(STORAGE_CONFIG.BROADCAST_CHANNEL);
} catch (error) {
  console.warn('BroadcastChannel not supported');
}

/**
 * Initialize Service Worker for cache storage
 */
export const initServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
};

/**
 * Compress data using LZ-String
 */
const compressData = (data: string): string => {
  if (data.length > STORAGE_CONFIG.COMPRESSION_THRESHOLD) {
    return LZString.compress(data) || data;
  }
  return data;
};

/**
 * Decompress data using LZ-String
 */
const decompressData = (data: string): string => {
  try {
    const decompressed = LZString.decompress(data);
    return decompressed || data;
  } catch {
    return data;
  }
};

/**
 * Simple encryption using Web Crypto API
 */
const encryptData = async (data: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = encoder.encode(STORAGE_CONFIG.ENCRYPTION_KEY);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.warn('Encryption failed, using plain text:', error);
    return data;
  }
};

/**
 * Simple decryption using Web Crypto API
 */
const decryptData = async (encryptedData: string): Promise<string> => {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const encoder = new TextEncoder();
    const keyBuffer = encoder.encode(STORAGE_CONFIG.ENCRYPTION_KEY);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.warn('Decryption failed, returning as-is:', error);
    return encryptedData;
  }
};

/**
 * Store data in IndexedDB (Layer 1)
 */
const storeInIndexedDB = async (key: string, data: any): Promise<void> => {
  try {
    const dbRequest = indexedDB.open('MantraVerseStorage', 1);
    
    return new Promise((resolve, reject) => {
      dbRequest.onerror = () => reject(dbRequest.error);
      
      dbRequest.onupgradeneeded = () => {
        const db = dbRequest.result;
        if (!db.objectStoreNames.contains('storage')) {
          db.createObjectStore('storage');
        }
      };
      
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(['storage'], 'readwrite');
        const store = transaction.objectStore('storage');
        
        const compressed = compressData(JSON.stringify(data));
        store.put(compressed, key);
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  } catch (error) {
    console.warn('IndexedDB storage failed:', error);
    throw error;
  }
};

/**
 * Store data in localStorage (Layer 2)
 */
const storeInLocalStorage = (key: string, data: any): void => {
  try {
    const compressed = compressData(JSON.stringify(data));
    localStorage.setItem(key, compressed);
  } catch (error) {
    console.warn('localStorage storage failed:', error);
    throw error;
  }
};

/**
 * Store data in sessionStorage (Layer 3)
 */
const storeInSessionStorage = (key: string, data: any): void => {
  try {
    const compressed = compressData(JSON.stringify(data));
    sessionStorage.setItem(key, compressed);
  } catch (error) {
    console.warn('sessionStorage storage failed:', error);
    throw error;
  }
};

/**
 * Store data in window.name (Layer 4)
 */
const storeInWindowName = (key: string, data: any): void => {
  try {
    const existing = window.name ? JSON.parse(window.name) : {};
    existing[key] = data;
    const compressed = compressData(JSON.stringify(existing));
    window.name = compressed;
  } catch (error) {
    console.warn('window.name storage failed:', error);
    throw error;
  }
};

/**
 * Store data in History State API (Layer 5)
 */
const storeInHistoryState = async (key: string, data: any): Promise<void> => {
  try {
    const encrypted = await encryptData(JSON.stringify(data));
    const compressed = compressData(encrypted);
    
    const state = { [key]: compressed };
    history.replaceState(state, '', window.location.href);
  } catch (error) {
    console.warn('History state storage failed:', error);
    throw error;
  }
};

/**
 * Store data in CSS Custom Properties (Layer 6)
 */
const storeInCSSVariables = async (key: string, data: any): Promise<void> => {
  try {
    const encrypted = await encryptData(JSON.stringify(data));
    const compressed = compressData(encrypted);
    
    // Split large data into chunks
    const chunks = compressed.match(/.{1,1000}/g) || [];
    
    chunks.forEach((chunk, index) => {
      const cssKey = `${STORAGE_CONFIG.CSS_PREFIX}${key}-${index}`;
      document.documentElement.style.setProperty(cssKey, chunk);
    });
    
    // Store chunk count
    document.documentElement.style.setProperty(
      `${STORAGE_CONFIG.CSS_PREFIX}${key}-count`,
      chunks.length.toString()
    );
  } catch (error) {
    console.warn('CSS variables storage failed:', error);
    throw error;
  }
};

/**
 * Store data in Service Worker Cache (Layer 7)
 */
const storeInServiceWorker = async (key: string, data: any): Promise<void> => {
  try {
    if ('caches' in window) {
      const cache = await caches.open('mantra-verse-data');
      const encrypted = await encryptData(JSON.stringify(data));
      const compressed = compressData(encrypted);
      
      const response = new Response(compressed);
      await cache.put(`/data/${key}`, response);
    }
  } catch (error) {
    console.warn('Service Worker cache storage failed:', error);
    throw error;
  }
};

/**
 * Store data in Broadcast Channel (Layer 8)
 */
const storeInBroadcastChannel = async (key: string, data: any): Promise<void> => {
  try {
    if (broadcastChannel) {
      const encrypted = await encryptData(JSON.stringify(data));
      const compressed = compressData(encrypted);
      
      broadcastChannel.postMessage({
        type: 'STORE_DATA',
        key,
        data: compressed,
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.warn('Broadcast channel storage failed:', error);
    throw error;
  }
};

/**
 * Enhanced storage function using all 8 layers
 */
export const enhancedStore = async (key: string, data: any): Promise<void> => {
  const tasks = [
    () => storeInIndexedDB(key, data),
    () => storeInLocalStorage(key, data),
    () => storeInSessionStorage(key, data),
    () => storeInWindowName(key, data),
    () => storeInHistoryState(key, data),
    () => storeInCSSVariables(key, data),
    () => storeInServiceWorker(key, data),
    () => storeInBroadcastChannel(key, data)
  ];

  // Execute all storage operations in parallel
  const results = await Promise.allSettled(tasks.map(task => task()));
  
  const successCount = results.filter(result => result.status === 'fulfilled').length;
  console.log(`Enhanced storage completed: ${successCount}/8 layers successful`);
  
  if (successCount === 0) {
    throw new Error('All storage layers failed');
  }
};

/**
 * Enhanced retrieval function with fallback chain
 */
export const enhancedRetrieve = async (key: string): Promise<any> => {
  // Try IndexedDB first
  try {
    const dbRequest = indexedDB.open('MantraVerseStorage', 1);
    const data = await new Promise((resolve, reject) => {
      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction(['storage'], 'readonly');
        const store = transaction.objectStore('storage');
        const request = store.get(key);
        
        request.onsuccess = () => {
          if (request.result) {
            const decompressed = decompressData(request.result);
            resolve(JSON.parse(decompressed));
          } else {
            reject(new Error('Not found'));
          }
        };
        request.onerror = () => reject(request.error);
      };
    });
    return data;
  } catch (error) {
    console.warn('IndexedDB retrieval failed, trying localStorage');
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const decompressed = decompressData(stored);
      return JSON.parse(decompressed);
    }
  } catch (error) {
    console.warn('localStorage retrieval failed, trying sessionStorage');
  }

  // Fallback to sessionStorage
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const decompressed = decompressData(stored);
      return JSON.parse(decompressed);
    }
  } catch (error) {
    console.warn('sessionStorage retrieval failed, trying window.name');
  }

  // Fallback to window.name
  try {
    if (window.name) {
      const decompressed = decompressData(window.name);
      const data = JSON.parse(decompressed);
      if (data[key]) {
        return data[key];
      }
    }
  } catch (error) {
    console.warn('window.name retrieval failed, trying history state');
  }

  // Fallback to history state
  try {
    if (history.state && history.state[key]) {
      const decompressed = decompressData(history.state[key]);
      const decrypted = await decryptData(decompressed);
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.warn('History state retrieval failed, trying CSS variables');
  }

  // Fallback to CSS variables
  try {
    const countProp = `${STORAGE_CONFIG.CSS_PREFIX}${key}-count`;
    const countValue = getComputedStyle(document.documentElement).getPropertyValue(countProp);
    const chunkCount = parseInt(countValue);
    
    if (chunkCount > 0) {
      let reconstructed = '';
      for (let i = 0; i < chunkCount; i++) {
        const chunkProp = `${STORAGE_CONFIG.CSS_PREFIX}${key}-${i}`;
        const chunk = getComputedStyle(document.documentElement).getPropertyValue(chunkProp);
        reconstructed += chunk;
      }
      
      const decompressed = decompressData(reconstructed);
      const decrypted = await decryptData(decompressed);
      return JSON.parse(decrypted);
    }
  } catch (error) {
    console.warn('CSS variables retrieval failed, trying service worker cache');
  }

  // Fallback to service worker cache
  try {
    if ('caches' in window) {
      const cache = await caches.open('mantra-verse-data');
      const response = await cache.match(`/data/${key}`);
      if (response) {
        const compressed = await response.text();
        const decompressed = decompressData(compressed);
        const decrypted = await decryptData(decompressed);
        return JSON.parse(decrypted);
      }
    }
  } catch (error) {
    console.warn('Service worker cache retrieval failed');
  }

  throw new Error(`Data not found in any storage layer: ${key}`);
};

/**
 * Storage health check
 */
export const checkStorageHealth = async (): Promise<Record<StorageLayer, boolean>> => {
  const health: Record<StorageLayer, boolean> = {
    [StorageLayer.INDEXED_DB]: false,
    [StorageLayer.LOCAL_STORAGE]: false,
    [StorageLayer.SESSION_STORAGE]: false,
    [StorageLayer.WINDOW_NAME]: false,
    [StorageLayer.HISTORY_STATE]: false,
    [StorageLayer.CSS_VARIABLES]: false,
    [StorageLayer.SERVICE_WORKER]: false,
    [StorageLayer.BROADCAST_CHANNEL]: false
  };

  // Test each storage layer
  const testKey = 'health-check';
  const testData = { test: true, timestamp: Date.now() };

  try {
    await storeInIndexedDB(testKey, testData);
    health[StorageLayer.INDEXED_DB] = true;
  } catch (error) {
    console.warn('IndexedDB health check failed');
  }

  try {
    storeInLocalStorage(testKey, testData);
    health[StorageLayer.LOCAL_STORAGE] = true;
  } catch (error) {
    console.warn('localStorage health check failed');
  }

  try {
    storeInSessionStorage(testKey, testData);
    health[StorageLayer.SESSION_STORAGE] = true;
  } catch (error) {
    console.warn('sessionStorage health check failed');
  }

  try {
    storeInWindowName(testKey, testData);
    health[StorageLayer.WINDOW_NAME] = true;
  } catch (error) {
    console.warn('window.name health check failed');
  }

  try {
    await storeInHistoryState(testKey, testData);
    health[StorageLayer.HISTORY_STATE] = true;
  } catch (error) {
    console.warn('History state health check failed');
  }

  try {
    await storeInCSSVariables(testKey, testData);
    health[StorageLayer.CSS_VARIABLES] = true;
  } catch (error) {
    console.warn('CSS variables health check failed');
  }

  try {
    await storeInServiceWorker(testKey, testData);
    health[StorageLayer.SERVICE_WORKER] = true;
  } catch (error) {
    console.warn('Service worker health check failed');
  }

  try {
    await storeInBroadcastChannel(testKey, testData);
    health[StorageLayer.BROADCAST_CHANNEL] = !!broadcastChannel;
  } catch (error) {
    console.warn('Broadcast channel health check failed');
  }

  return health;
};

/**
 * Initialize enhanced storage system
 */
export const initEnhancedStorage = async (): Promise<void> => {
  console.log('Initializing enhanced 8-layer storage system...');
  
  // Initialize service worker
  await initServiceWorker();
  
  // Set up broadcast channel listener
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', (event) => {
      if (event.data.type === 'STORE_DATA') {
        // Store received data in local storage as backup
        try {
          localStorage.setItem(`bc_${event.data.key}`, event.data.data);
        } catch (error) {
          console.warn('Failed to store broadcast channel data locally');
        }
      }
    });
  }
  
  // Perform health check
  const health = await checkStorageHealth();
  const healthyLayers = Object.values(health).filter(Boolean).length;
  
  console.log(`Enhanced storage initialized: ${healthyLayers}/8 layers healthy`);
  
  return;
};

export default {
  enhancedStore,
  enhancedRetrieve,
  checkStorageHealth,
  initEnhancedStorage,
  StorageLayer
};
