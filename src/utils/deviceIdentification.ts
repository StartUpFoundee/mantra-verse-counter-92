
/**
 * Bulletproof Device Identification System
 * 6-Layer Persistence Strategy for Maximum Reliability
 */

// Device identification configuration
export const DEVICE_CONFIG = {
  DB_NAME: 'device_registry',
  DB_VERSION: 1,
  STORAGE_KEYS: {
    PRIMARY: 'device_permanent_id',
    METADATA: 'device_metadata',
    CSS_PREFIX: '--device-',
    HISTORY_KEY: 'device_state_data',
    WINDOW_NAME_PREFIX: 'device_token_',
    SW_CACHE_NAME: 'device-identification-v1'
  },
  ENCRYPTION_KEY: 'mantra_verse_device_2024',
  MAX_RECOVERY_ATTEMPTS: 3
};

// Device metadata interface
export interface DeviceMetadata {
  id: string;
  createdAt: string;
  lastAccess: string;
  browserInfo: {
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
    screen: string;
  };
  fingerprint: string;
  layerStatus: {
    localStorage: boolean;
    indexedDB: boolean;
    serviceWorker: boolean;
    cssProperties: boolean;
    historyState: boolean;
    windowName: boolean;
  };
}

/**
 * Simple encryption/decryption for device tokens
 */
const encryptDeviceToken = (token: string): string => {
  try {
    const key = DEVICE_CONFIG.ENCRYPTION_KEY;
    let encrypted = '';
    for (let i = 0; i < token.length; i++) {
      encrypted += String.fromCharCode(token.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  } catch (error) {
    console.warn('Device encryption failed:', error);
    return token;
  }
};

const decryptDeviceToken = (encryptedToken: string): string => {
  try {
    const key = DEVICE_CONFIG.ENCRYPTION_KEY;
    const encrypted = atob(encryptedToken);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  } catch (error) {
    console.warn('Device decryption failed:', error);
    return encryptedToken;
  }
};

/**
 * Generate browser fingerprint for device validation
 */
const generateBrowserFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('MantraVerse Device Fingerprint', 2, 2);
    }
    const canvasFingerprint = canvas.toDataURL().slice(-12);
    
    const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'en';
    const platform = navigator.platform || 'unknown';
    const cores = (navigator as any).hardwareConcurrency || 'unknown';
    
    const fingerprintString = `${screen}_${timezone}_${language}_${platform}_${cores}_${canvasFingerprint}`;
    
    // Generate hash
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36).slice(0, 10);
  } catch (error) {
    console.warn('Fingerprint generation failed:', error);
    return Date.now().toString(36).slice(-8);
  }
};

/**
 * Generate new device ID
 */
const generateDeviceId = (): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const fingerprint = generateBrowserFingerprint().slice(0, 6);
  return `device_${timestamp}_${randomString}_${fingerprint}`;
};

/**
 * Validate device ID format
 */
const isValidDeviceId = (deviceId: string): boolean => {
  return /^device_\d+_[a-z0-9]+_[a-z0-9]+$/.test(deviceId);
};

/**
 * Layer 1: localStorage Operations
 */
const layer1_localStorage = {
  store: (deviceId: string): boolean => {
    try {
      const encrypted = encryptDeviceToken(deviceId);
      localStorage.setItem(DEVICE_CONFIG.STORAGE_KEYS.PRIMARY, encrypted);
      console.log('Layer 1 (localStorage): Device ID stored');
      return true;
    } catch (error) {
      console.warn('Layer 1 (localStorage): Storage failed:', error);
      return false;
    }
  },

  retrieve: (): string | null => {
    try {
      const encrypted = localStorage.getItem(DEVICE_CONFIG.STORAGE_KEYS.PRIMARY);
      if (encrypted) {
        const deviceId = decryptDeviceToken(encrypted);
        if (isValidDeviceId(deviceId)) {
          console.log('Layer 1 (localStorage): Device ID retrieved');
          return deviceId;
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 1 (localStorage): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Layer 2: IndexedDB Operations
 */
const layer2_indexedDB = {
  store: async (deviceId: string, metadata: DeviceMetadata): Promise<boolean> => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DEVICE_CONFIG.DB_NAME, DEVICE_CONFIG.DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('deviceRegistry')) {
            db.createObjectStore('deviceRegistry', { keyPath: 'id' });
          }
        };
      });

      const transaction = db.transaction(['deviceRegistry'], 'readwrite');
      const store = transaction.objectStore('deviceRegistry');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: 'primary',
          deviceId: encryptDeviceToken(deviceId),
          metadata: metadata,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      console.log('Layer 2 (IndexedDB): Device ID stored');
      return true;
    } catch (error) {
      console.warn('Layer 2 (IndexedDB): Storage failed:', error);
      return false;
    }
  },

  retrieve: async (): Promise<string | null> => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DEVICE_CONFIG.DB_NAME, DEVICE_CONFIG.DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => reject(new Error('DB needs upgrade'));
      });

      const transaction = db.transaction(['deviceRegistry'], 'readonly');
      const store = transaction.objectStore('deviceRegistry');
      
      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get('primary');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();

      if (result && result.deviceId) {
        const deviceId = decryptDeviceToken(result.deviceId);
        if (isValidDeviceId(deviceId)) {
          console.log('Layer 2 (IndexedDB): Device ID retrieved');
          return deviceId;
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 2 (IndexedDB): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Layer 3: Service Worker Cache Operations
 */
const layer3_serviceWorker = {
  store: async (deviceId: string): Promise<boolean> => {
    try {
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cache = await caches.open(DEVICE_CONFIG.STORAGE_KEYS.SW_CACHE_NAME);
        const deviceData = new Response(encryptDeviceToken(deviceId));
        await cache.put('/device-id', deviceData);
        console.log('Layer 3 (ServiceWorker): Device ID stored');
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Layer 3 (ServiceWorker): Storage failed:', error);
      return false;
    }
  },

  retrieve: async (): Promise<string | null> => {
    try {
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cache = await caches.open(DEVICE_CONFIG.STORAGE_KEYS.SW_CACHE_NAME);
        const response = await cache.match('/device-id');
        if (response) {
          const encryptedDeviceId = await response.text();
          const deviceId = decryptDeviceToken(encryptedDeviceId);
          if (isValidDeviceId(deviceId)) {
            console.log('Layer 3 (ServiceWorker): Device ID retrieved');
            return deviceId;
          }
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 3 (ServiceWorker): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Layer 4: CSS Custom Properties Steganography
 */
const layer4_cssProperties = {
  store: (deviceId: string): boolean => {
    try {
      const root = document.documentElement;
      const encrypted = encryptDeviceToken(deviceId);
      
      // Split device ID across multiple CSS variables for redundancy
      const chunks = [];
      const chunkSize = Math.ceil(encrypted.length / 3);
      for (let i = 0; i < encrypted.length; i += chunkSize) {
        chunks.push(encrypted.slice(i, i + chunkSize));
      }
      
      root.style.setProperty(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}main`, chunks[0] || '');
      root.style.setProperty(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}backup`, chunks[1] || '');
      root.style.setProperty(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}fallback`, chunks[2] || '');
      
      console.log('Layer 4 (CSS Properties): Device ID stored');
      return true;
    } catch (error) {
      console.warn('Layer 4 (CSS Properties): Storage failed:', error);
      return false;
    }
  },

  retrieve: (): string | null => {
    try {
      const root = document.documentElement;
      const main = root.style.getPropertyValue(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}main`);
      const backup = root.style.getPropertyValue(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}backup`);
      const fallback = root.style.getPropertyValue(`${DEVICE_CONFIG.STORAGE_KEYS.CSS_PREFIX}fallback`);
      
      const encrypted = main + backup + fallback;
      if (encrypted) {
        const deviceId = decryptDeviceToken(encrypted);
        if (isValidDeviceId(deviceId)) {
          console.log('Layer 4 (CSS Properties): Device ID retrieved');
          return deviceId;
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 4 (CSS Properties): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Layer 5: Browser History State Operations
 */
const layer5_historyState = {
  store: (deviceId: string): boolean => {
    try {
      const currentState = history.state || {};
      const newState = {
        ...currentState,
        [DEVICE_CONFIG.STORAGE_KEYS.HISTORY_KEY]: encryptDeviceToken(deviceId)
      };
      history.replaceState(newState, '', window.location.href);
      console.log('Layer 5 (History State): Device ID stored');
      return true;
    } catch (error) {
      console.warn('Layer 5 (History State): Storage failed:', error);
      return false;
    }
  },

  retrieve: (): string | null => {
    try {
      const state = history.state;
      if (state && state[DEVICE_CONFIG.STORAGE_KEYS.HISTORY_KEY]) {
        const deviceId = decryptDeviceToken(state[DEVICE_CONFIG.STORAGE_KEYS.HISTORY_KEY]);
        if (isValidDeviceId(deviceId)) {
          console.log('Layer 5 (History State): Device ID retrieved');
          return deviceId;
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 5 (History State): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Layer 6: Window.name Cross-Session Storage
 */
const layer6_windowName = {
  store: (deviceId: string): boolean => {
    try {
      const encrypted = encryptDeviceToken(deviceId);
      window.name = `${DEVICE_CONFIG.STORAGE_KEYS.WINDOW_NAME_PREFIX}${encrypted}`;
      console.log('Layer 6 (Window.name): Device ID stored');
      return true;
    } catch (error) {
      console.warn('Layer 6 (Window.name): Storage failed:', error);
      return false;
    }
  },

  retrieve: (): string | null => {
    try {
      const windowName = window.name;
      if (windowName && windowName.startsWith(DEVICE_CONFIG.STORAGE_KEYS.WINDOW_NAME_PREFIX)) {
        const encrypted = windowName.replace(DEVICE_CONFIG.STORAGE_KEYS.WINDOW_NAME_PREFIX, '');
        const deviceId = decryptDeviceToken(encrypted);
        if (isValidDeviceId(deviceId)) {
          console.log('Layer 6 (Window.name): Device ID retrieved');
          return deviceId;
        }
      }
      return null;
    } catch (error) {
      console.warn('Layer 6 (Window.name): Retrieval failed:', error);
      return null;
    }
  }
};

/**
 * Create device metadata
 */
const createDeviceMetadata = (deviceId: string): DeviceMetadata => {
  return {
    id: deviceId,
    createdAt: new Date().toISOString(),
    lastAccess: new Date().toISOString(),
    browserInfo: {
      userAgent: navigator.userAgent.slice(0, 100),
      language: navigator.language || 'en',
      platform: navigator.platform || 'unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
    },
    fingerprint: generateBrowserFingerprint(),
    layerStatus: {
      localStorage: false,
      indexedDB: false,
      serviceWorker: false,
      cssProperties: false,
      historyState: false,
      windowName: false
    }
  };
};

/**
 * Store device ID across all 6 layers
 */
const storeDeviceIdAllLayers = async (deviceId: string): Promise<DeviceMetadata> => {
  console.log('Storing device ID across all layers:', deviceId);
  const metadata = createDeviceMetadata(deviceId);
  
  // Store in all layers
  metadata.layerStatus.localStorage = layer1_localStorage.store(deviceId);
  metadata.layerStatus.indexedDB = await layer2_indexedDB.store(deviceId, metadata);
  metadata.layerStatus.serviceWorker = await layer3_serviceWorker.store(deviceId);
  metadata.layerStatus.cssProperties = layer4_cssProperties.store(deviceId);
  metadata.layerStatus.historyState = layer5_historyState.store(deviceId);
  metadata.layerStatus.windowName = layer6_windowName.store(deviceId);
  
  console.log('Device ID storage status:', metadata.layerStatus);
  return metadata;
};

/**
 * Device ID recovery flow - tries each layer in order
 */
const recoverDeviceId = async (): Promise<string | null> => {
  console.log('Starting device ID recovery process...');
  
  const recoveryLayers = [
    { name: 'localStorage', fn: () => layer1_localStorage.retrieve() },
    { name: 'IndexedDB', fn: () => layer2_indexedDB.retrieve() },
    { name: 'ServiceWorker', fn: () => layer3_serviceWorker.retrieve() },
    { name: 'CSS Properties', fn: () => layer4_cssProperties.retrieve() },
    { name: 'History State', fn: () => layer5_historyState.retrieve() },
    { name: 'Window.name', fn: () => layer6_windowName.retrieve() }
  ];
  
  for (const layer of recoveryLayers) {
    try {
      const deviceId = await layer.fn();
      if (deviceId && isValidDeviceId(deviceId)) {
        console.log(`Device ID recovered from ${layer.name}:`, deviceId);
        return deviceId;
      }
    } catch (error) {
      console.warn(`Recovery failed for ${layer.name}:`, error);
    }
  }
  
  console.log('Device ID recovery failed - no valid ID found in any layer');
  return null;
};

/**
 * Synchronize device ID across all layers
 */
const synchronizeDeviceId = async (deviceId: string): Promise<void> => {
  console.log('Synchronizing device ID across all layers...');
  await storeDeviceIdAllLayers(deviceId);
};

/**
 * Main device identification class
 */
export class DeviceIdentificationSystem {
  private static instance: DeviceIdentificationSystem;
  private deviceId: string | null = null;
  private metadata: DeviceMetadata | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DeviceIdentificationSystem {
    if (!DeviceIdentificationSystem.instance) {
      DeviceIdentificationSystem.instance = new DeviceIdentificationSystem();
    }
    return DeviceIdentificationSystem.instance;
  }

  /**
   * Initialize device identification system
   */
  async initialize(): Promise<string> {
    if (this.isInitialized && this.deviceId) {
      return this.deviceId;
    }

    console.log('Initializing Device Identification System...');
    
    // Try to recover existing device ID
    let deviceId = await recoverDeviceId();
    
    if (!deviceId) {
      // Generate new device ID if recovery failed
      deviceId = generateDeviceId();
      console.log('Generated new device ID:', deviceId);
    }
    
    // Store/sync across all layers
    this.metadata = await storeDeviceIdAllLayers(deviceId);
    this.deviceId = deviceId;
    this.isInitialized = true;
    
    // Set up periodic synchronization
    this.setupPeriodicSync();
    
    console.log('Device Identification System initialized successfully');
    return deviceId;
  }

  /**
   * Get current device ID
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Get device metadata
   */
  getMetadata(): DeviceMetadata | null {
    return this.metadata;
  }

  /**
   * Force synchronization across all layers
   */
  async forceSynchronization(): Promise<void> {
    if (this.deviceId) {
      await synchronizeDeviceId(this.deviceId);
    }
  }

  /**
   * Validate device ID integrity
   */
  async validateIntegrity(): Promise<boolean> {
    if (!this.deviceId) return false;
    
    const recoveredId = await recoverDeviceId();
    return recoveredId === this.deviceId;
  }

  /**
   * Get storage health status
   */
  getStorageHealth(): { [key: string]: boolean } {
    return this.metadata?.layerStatus || {};
  }

  /**
   * Setup periodic synchronization
   */
  private setupPeriodicSync(): void {
    // Sync every 5 minutes
    setInterval(async () => {
      if (this.deviceId) {
        await synchronizeDeviceId(this.deviceId);
      }
    }, 5 * 60 * 1000);

    // Sync on page visibility change
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.deviceId) {
        await synchronizeDeviceId(this.deviceId);
      }
    });
  }
}

/**
 * Utility functions for external use
 */
export const getDeviceId = async (): Promise<string> => {
  const system = DeviceIdentificationSystem.getInstance();
  return await system.initialize();
};

export const getCurrentDeviceId = (): string | null => {
  const system = DeviceIdentificationSystem.getInstance();
  return system.getDeviceId();
};

export const validateDeviceIntegrity = async (): Promise<boolean> => {
  const system = DeviceIdentificationSystem.getInstance();
  return await system.validateIntegrity();
};

export const getStorageHealthStatus = (): { [key: string]: boolean } => {
  const system = DeviceIdentificationSystem.getInstance();
  return system.getStorageHealth();
};

export default DeviceIdentificationSystem;
