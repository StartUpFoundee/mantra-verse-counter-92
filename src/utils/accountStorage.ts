/**
 * Account Storage Management - Enhanced Device-Specific Storage System
 * Simplified approach to avoid JSON corruption issues
 */

// Account storage configuration
export const STORAGE_CONFIG = {
  MAX_ACCOUNTS: 3,
  ACCOUNT_PREFIXES: ['acc1_', 'acc2_', 'acc3_'],
  DB_NAME: 'NaamJapaAccounts',
  DB_VERSION: 4 // Incremented to force refresh
};

// Account slot interface
export interface AccountSlot {
  slotId: number;
  userId: string | null;
  name: string | null;
  lastLogin: string | null;
  createdAt: string | null;
  isActive: boolean;
}

// User account interface
export interface UserAccount {
  id: string;
  name: string;
  dob: string;
  hashedPassword: string;
  salt: string;
  createdAt: string;
  lastLogin: string;
  slotId: number;
  userData: any;
}

/**
 * Generate device fingerprint for better device identification
 */
const generateDeviceFingerprint = (): string => {
  try {
    // Use multiple device characteristics for better identification
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    const canvasFingerprint = canvas.toDataURL().slice(-10);
    
    const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'en';
    const platform = navigator.platform || 'unknown';
    
    const deviceString = `${screenInfo}_${timezone}_${language}_${platform}_${canvasFingerprint}`;
    
    // Create a simple hash
    let hash = 0;
    for (let i = 0; i < deviceString.length; i++) {
      const char = deviceString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36).slice(0, 8);
  } catch (error) {
    console.warn('Device fingerprinting failed, using fallback:', error);
    return Date.now().toString(36).slice(-8);
  }
};

/**
 * Get device-specific storage key
 */
const getDeviceKey = (): string => {
  try {
    const stored = localStorage.getItem('device_id');
    if (stored) {
      return stored;
    }
    
    const deviceId = `device_${generateDeviceFingerprint()}_${Date.now().toString(36)}`;
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  } catch (error) {
    console.warn('Device key generation failed:', error);
    return `fallback_${Date.now().toString(36)}`;
  }
};

/**
 * Initialize IndexedDB for account management with better error handling
 */
const initAccountDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(STORAGE_CONFIG.DB_NAME, STORAGE_CONFIG.DB_VERSION);
      
      const timeout = setTimeout(() => {
        request.abort();
        reject(new Error('IndexedDB initialization timeout'));
      }, 5000);
      
      request.onerror = () => {
        clearTimeout(timeout);
        console.error('IndexedDB error:', request.error);
        reject(request.error || new Error('IndexedDB failed to open'));
      };
      
      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Clear old stores if they exist
          const storeNames = ['accountSlots', 'accountData', 'appData'];
          storeNames.forEach(storeName => {
            if (db.objectStoreNames.contains(storeName)) {
              db.deleteObjectStore(storeName);
            }
          });
          
          // Create fresh stores
          db.createObjectStore('accountSlots', { keyPath: 'key' });
          db.createObjectStore('accountData', { keyPath: 'id' });
          db.createObjectStore('appData', { keyPath: ['deviceId', 'accountId', 'key'] });
          
          console.log('IndexedDB stores created successfully');
        } catch (upgradeError) {
          console.error('IndexedDB upgrade failed:', upgradeError);
          reject(upgradeError);
        }
      };
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate unique user ID
 */
export const generateUserId = (name: string, dob: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dobFormatted = dob.replace(/-/g, '');
  const timestamp = Date.now();
  const deviceId = getDeviceKey().slice(-6);
  
  return `${cleanName}_${dobFormatted}_${timestamp}_${deviceId}`;
};

/**
 * Hash password with PBKDF2
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    return Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Generate random salt
 */
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Get all account slots for current device with better error handling
 */
export const getAccountSlots = async (): Promise<AccountSlot[]> => {
  const deviceId = getDeviceKey();
  console.log('Getting account slots for device:', deviceId);
  
  try {
    // Try IndexedDB first with timeout
    const db = await Promise.race([
      initAccountDB(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('DB init timeout')), 3000)
      )
    ]);
    
    const transaction = db.transaction(['accountSlots'], 'readonly');
    const store = transaction.objectStore('accountSlots');
    
    const slots: AccountSlot[] = [];
    for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
      const key = `${deviceId}_slot_${i}`;
      
      try {
        const result = await new Promise<any>((resolve, reject) => {
          const request = store.get(key);
          const timeout = setTimeout(() => reject(new Error('Get timeout')), 1000);
          
          request.onsuccess = () => {
            clearTimeout(timeout);
            resolve(request.result);
          };
          request.onerror = () => {
            clearTimeout(timeout);
            reject(request.error);
          };
        });
        
        if (result && result.slotData) {
          slots.push(result.slotData);
        } else {
          slots.push({
            slotId: i,
            userId: null,
            name: null,
            lastLogin: null,
            createdAt: null,
            isActive: false
          });
        }
      } catch (error) {
        console.warn(`Error getting slot ${i} from IndexedDB:`, error);
        slots.push({
          slotId: i,
          userId: null,
          name: null,
          lastLogin: null,
          createdAt: null,
          isActive: false
        });
      }
    }
    
    console.log('Retrieved slots from IndexedDB:', slots.length);
    return slots;
    
  } catch (error) {
    console.warn('IndexedDB failed, using localStorage fallback:', error);
    return getAccountSlotsFromLocalStorage(deviceId);
  }
};

/**
 * Fallback: Get account slots from localStorage with better error handling
 */
const getAccountSlotsFromLocalStorage = (deviceId: string): AccountSlot[] => {
  const slots: AccountSlot[] = [];
  for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
    const key = `${deviceId}_slot_${i}`;
    
    try {
      const slotData = localStorage.getItem(key);
      if (slotData) {
        const parsed = JSON.parse(slotData);
        slots.push(parsed);
      } else {
        slots.push({
          slotId: i,
          userId: null,
          name: null,
          lastLogin: null,
          createdAt: null,
          isActive: false
        });
      }
    } catch (error) {
      console.warn(`Error parsing slot ${i} from localStorage:`, error);
      slots.push({
        slotId: i,
        userId: null,
        name: null,
        lastLogin: null,
        createdAt: null,
        isActive: false
      });
    }
  }
  return slots;
};

/**
 * Save account to available slot
 */
export const saveAccountToSlot = async (account: UserAccount): Promise<number> => {
  const deviceId = getDeviceKey();
  console.log('Saving account to device:', deviceId);
  
  const slots = await getAccountSlots();
  const availableSlot = slots.find(slot => !slot.userId);
  
  if (!availableSlot) {
    throw new Error('No available account slots. Maximum 3 accounts per device.');
  }
  
  const slotId = availableSlot.slotId;
  account.slotId = slotId;
  
  try {
    // Save to IndexedDB
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    const slotData: AccountSlot = {
      slotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    
    // Store slot info
    const slotsStore = transaction.objectStore('accountSlots');
    await new Promise<void>((resolve, reject) => {
      const request = slotsStore.put({ 
        key: `${deviceId}_slot_${slotId}`, 
        slotData 
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Store account data
    const accountStore = transaction.objectStore('accountData');
    await new Promise<void>((resolve, reject) => {
      const request = accountStore.put(account);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('Account saved to IndexedDB successfully');
    
  } catch (error) {
    console.warn('IndexedDB save failed, using localStorage:', error);
  }
  
  // Always save to localStorage as backup
  const slotData: AccountSlot = {
    slotId,
    userId: account.id,
    name: account.name,
    lastLogin: account.lastLogin,
    createdAt: account.createdAt,
    isActive: true
  };
  
  localStorage.setItem(`${deviceId}_slot_${slotId}`, JSON.stringify(slotData));
  localStorage.setItem(`${deviceId}_account_${account.id}`, JSON.stringify(account));
  
  console.log('Account saved to localStorage as backup');
  
  return slotId;
};

/**
 * Get account by slot ID
 */
export const getAccountBySlot = async (slotId: number): Promise<UserAccount | null> => {
  const deviceId = getDeviceKey();
  
  try {
    // Try to get from IndexedDB first
    const db = await initAccountDB();
    const transaction = db.transaction(['accountData'], 'readonly');
    const store = transaction.objectStore('accountData');
    
    // Get all accounts and find by slotId
    const allAccounts = await new Promise<UserAccount[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    const account = allAccounts.find(acc => acc.slotId === slotId);
    if (account) {
      console.log('Retrieved account from IndexedDB:', account.name);
      return account;
    }
    
  } catch (error) {
    console.warn('IndexedDB account retrieval failed:', error);
  }
  
  // Fallback to localStorage
  const slots = await getAccountSlots();
  const slot = slots.find(s => s.slotId === slotId);
  if (slot && slot.userId) {
    const accountData = localStorage.getItem(`${deviceId}_account_${slot.userId}`);
    if (accountData) {
      try {
        const account = JSON.parse(accountData);
        console.log('Retrieved account from localStorage:', account.name);
        return account;
      } catch (error) {
        console.error('Error parsing account from localStorage:', error);
      }
    }
  }
  
  return null;
};

/**
 * Set active account slot
 */
export const setActiveAccountSlot = async (slotId: number): Promise<void> => {
  const deviceId = getDeviceKey();
  console.log('Setting active account slot:', slotId, 'for device:', deviceId);
  
  // Clear all active flags first
  const slots = await getAccountSlots();
  for (const slot of slots) {
    if (slot.userId) {
      slot.isActive = false;
      
      try {
        // Update in IndexedDB
        const db = await initAccountDB();
        const transaction = db.transaction(['accountSlots'], 'readwrite');
        const store = transaction.objectStore('accountSlots');
        
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ 
            key: `${deviceId}_slot_${slot.slotId}`, 
            slotData: slot 
          });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn('IndexedDB update failed:', error);
      }
      
      // Update localStorage backup
      localStorage.setItem(`${deviceId}_slot_${slot.slotId}`, JSON.stringify(slot));
    }
  }
  
  // Set the selected slot as active
  const activeSlot = slots.find(s => s.slotId === slotId);
  if (activeSlot && activeSlot.userId) {
    activeSlot.isActive = true;
    activeSlot.lastLogin = new Date().toISOString();
    
    try {
      // Update in IndexedDB
      const db = await initAccountDB();
      const transaction = db.transaction(['accountSlots'], 'readwrite');
      const store = transaction.objectStore('accountSlots');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ 
          key: `${deviceId}_slot_${slotId}`, 
          slotData: activeSlot 
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB active slot update failed:', error);
    }
    
    // Update localStorage backup
    localStorage.setItem(`${deviceId}_slot_${slotId}`, JSON.stringify(activeSlot));
    
    // Set session and window data for cross-tab sync
    sessionStorage.setItem(`${deviceId}_activeAccountSlot`, slotId.toString());
    try {
      window.name = `${deviceId}_activeSlot_${slotId}`;
    } catch (error) {
      console.warn('Window.name setting failed:', error);
    }
    
    console.log('Active account slot set successfully:', slotId);
  }
};

/**
 * Get current active account with improved error handling
 */
export const getActiveAccount = async (): Promise<UserAccount | null> => {
  const deviceId = getDeviceKey();
  
  try {
    // Check session first (fastest)
    const sessionSlot = sessionStorage.getItem(`${deviceId}_activeAccountSlot`);
    if (sessionSlot) {
      const account = await getAccountBySlot(parseInt(sessionSlot));
      if (account) {
        console.log('Found active account from session:', account.name);
        return account;
      }
    }
    
    // Check window.name
    try {
      if (window.name && window.name.startsWith(`${deviceId}_activeSlot_`)) {
        const slotId = parseInt(window.name.split('_')[2]);
        if (!isNaN(slotId)) {
          const account = await getAccountBySlot(slotId);
          if (account) {
            console.log('Found active account from window.name:', account.name);
            return account;
          }
        }
      }
    } catch (error) {
      console.warn('Window.name check failed:', error);
    }
    
    // Find active slot from storage
    const slots = await getAccountSlots();
    const activeSlot = slots.find(slot => slot.isActive);
    if (activeSlot) {
      const account = await getAccountBySlot(activeSlot.slotId);
      if (account) {
        console.log('Found active account from storage:', account.name);
        return account;
      }
    }
    
    console.log('No active account found');
    return null;
    
  } catch (error) {
    console.error('getActiveAccount failed:', error);
    return null;
  }
};

/**
 * Replace account in slot
 */
export const replaceAccountInSlot = async (account: UserAccount, targetSlotId: number): Promise<void> => {
  const deviceId = getDeviceKey();
  account.slotId = targetSlotId;
  
  try {
    // Save to IndexedDB
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    const slotData: AccountSlot = {
      slotId: targetSlotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    
    // Update slot
    const slotStore = transaction.objectStore('accountSlots');
    await new Promise<void>((resolve, reject) => {
      const request = slotStore.put({ 
        key: `${deviceId}_slot_${targetSlotId}`, 
        slotData 
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Save account data
    const accountStore = transaction.objectStore('accountData');
    await new Promise<void>((resolve, reject) => {
      const request = accountStore.put(account);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
  } catch (error) {
    console.warn('IndexedDB replace failed:', error);
  }
  
  // Update localStorage backup
  const slotData: AccountSlot = {
    slotId: targetSlotId,
    userId: account.id,
    name: account.name,
    lastLogin: account.lastLogin,
    createdAt: account.createdAt,
    isActive: true
  };
  
  localStorage.setItem(`${deviceId}_slot_${targetSlotId}`, JSON.stringify(slotData));
  localStorage.setItem(`${deviceId}_account_${account.id}`, JSON.stringify(account));
};

/**
 * Clear account slot
 */
export const clearAccountSlot = async (slotId: number): Promise<void> => {
  const deviceId = getDeviceKey();
  
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    const slotStore = transaction.objectStore('accountSlots');
    await new Promise<void>((resolve, reject) => {
      const request = slotStore.delete(`${deviceId}_slot_${slotId}`);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
  
  // Clear localStorage
  localStorage.removeItem(`${deviceId}_slot_${slotId}`);
  
  const activeSlot = sessionStorage.getItem(`${deviceId}_activeAccountSlot`);
  if (activeSlot === slotId.toString()) {
    sessionStorage.removeItem(`${deviceId}_activeAccountSlot`);
    try {
      window.name = '';
    } catch (error) {
      console.warn('Window.name clear failed:', error);
    }
  }
};

/**
 * Verify password for account
 */
export const verifyAccountPassword = async (account: UserAccount, password: string): Promise<boolean> => {
  try {
    const hashedInput = await hashPassword(password, account.salt);
    return hashedInput === account.hashedPassword;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

export default {
  generateUserId,
  hashPassword,
  generateSalt,
  getAccountSlots,
  saveAccountToSlot,
  getAccountBySlot,
  setActiveAccountSlot,
  getActiveAccount,
  replaceAccountInSlot,
  clearAccountSlot,
  verifyAccountPassword
};
