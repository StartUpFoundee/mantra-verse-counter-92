/**
 * Account Storage Management - Enhanced with Bulletproof Device Identification
 * Integrated with 6-layer device persistence for maximum reliability
 */

import { getDeviceId, getCurrentDeviceId } from './deviceIdentification';

// Account storage configuration
export const STORAGE_CONFIG = {
  MAX_ACCOUNTS: 3,
  ACCOUNT_PREFIXES: ['acc1_', 'acc2_', 'acc3_'],
  DB_NAME: 'NaamJapaAccounts',
  DB_VERSION: 6 // Incremented for device integration
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
 * Get device-specific storage key using bulletproof device identification
 */
const getDeviceKey = async (): Promise<string> => {
  try {
    // Use the bulletproof device identification system
    const deviceId = await getDeviceId();
    console.log('AccountStorage: Using device ID:', deviceId);
    return deviceId;
  } catch (error) {
    console.error('AccountStorage: Device ID retrieval failed:', error);
    // Fallback to cached device ID if available
    const cachedId = getCurrentDeviceId();
    if (cachedId) {
      console.warn('AccountStorage: Using cached device ID:', cachedId);
      return cachedId;
    }
    // Ultimate fallback
    const fallbackId = `fallback_${Date.now().toString(36)}`;
    console.warn('AccountStorage: Using fallback ID:', fallbackId);
    return fallbackId;
  }
};

/**
 * Initialize IndexedDB with enhanced error handling
 */
const initAccountDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(STORAGE_CONFIG.DB_NAME, STORAGE_CONFIG.DB_VERSION);
      let isResolved = false;
      
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error('IndexedDB initialization timeout'));
        }
      }, 8000);
      
      request.onerror = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          console.error('IndexedDB error:', request.error);
          reject(request.error || new Error('IndexedDB failed to open'));
        }
      };
      
      request.onsuccess = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          console.log('IndexedDB opened successfully');
          resolve(request.result);
        }
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
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(upgradeError);
          }
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
  const deviceId = getCurrentDeviceId() || 'unknown';
  const deviceSuffix = deviceId.slice(-6);
  
  return `${cleanName}_${dobFormatted}_${timestamp}_${deviceSuffix}`;
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
 * Enhanced account slots retrieval with bulletproof device identification
 */
export const getAccountSlots = async (): Promise<AccountSlot[]> => {
  const deviceId = await getDeviceKey();
  console.log('Getting account slots for device:', deviceId);
  
  const slots: AccountSlot[] = [];
  
  // Initialize empty slots first
  for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
    slots.push({
      slotId: i,
      userId: null,
      name: null,
      lastLogin: null,
      createdAt: null,
      isActive: false
    });
  }
  
  try {
    // Layer 1: Try IndexedDB first
    try {
      const db = await initAccountDB();
      const transaction = db.transaction(['accountSlots'], 'readonly');
      const store = transaction.objectStore('accountSlots');
      
      for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
        const key = `${deviceId}_slot_${i}`;
        
        try {
          const result = await new Promise<any>((resolve, reject) => {
            const request = store.get(key);
            const timeout = setTimeout(() => reject(new Error('Get timeout')), 2000);
            
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
            slots[i - 1] = result.slotData;
            console.log(`Found account in IndexedDB slot ${i}:`, result.slotData.name);
          }
        } catch (error) {
          console.warn(`Error getting slot ${i} from IndexedDB:`, error);
        }
      }
      
      db.close();
    } catch (dbError) {
      console.warn('IndexedDB failed, trying localStorage:', dbError);
    }
    
    // Layer 2: Check localStorage for any missing slots
    for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
      if (!slots[i - 1].userId) {
        const key = `${deviceId}_slot_${i}`;
        try {
          const slotData = localStorage.getItem(key);
          if (slotData) {
            const parsed = JSON.parse(slotData);
            slots[i - 1] = parsed;
            console.log(`Found account in localStorage slot ${i}:`, parsed.name);
          }
        } catch (error) {
          console.warn(`Error parsing slot ${i} from localStorage:`, error);
        }
      }
    }
    
    // Layer 3: Check for legacy storage patterns (for migration)
    for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
      if (!slots[i - 1].userId) {
        try {
          // Check alternative key patterns for migration
          const legacyKeys = [
            `account_slot_${i}_${deviceId}`,
            `mantra_slot_${i}`,
            `slot_${i}_data`,
            // Also check with previous device identification methods
            `device_*_slot_${i}` // Will need manual checking
          ];
          
          for (const legacyKey of legacyKeys) {
            const data = localStorage.getItem(legacyKey);
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.name && parsed.userId) {
                  slots[i - 1] = {
                    slotId: i,
                    userId: parsed.userId || parsed.id,
                    name: parsed.name,
                    lastLogin: parsed.lastLogin || parsed.createdAt,
                    createdAt: parsed.createdAt,
                    isActive: false
                  };
                  console.log(`Migrated account from legacy storage slot ${i}:`, parsed.name);
                  
                  // Store in new format
                  const newKey = `${deviceId}_slot_${i}`;
                  localStorage.setItem(newKey, JSON.stringify(slots[i - 1]));
                  
                  // Remove legacy key
                  localStorage.removeItem(legacyKey);
                  break;
                }
              } catch (e) {
                console.warn(`Error parsing legacy data for ${legacyKey}:`, e);
              }
            }
          }
        } catch (error) {
          console.warn(`Error checking legacy storage for slot ${i}:`, error);
        }
      }
    }
    
    console.log('Retrieved slots:', slots.filter(s => s.userId).length, 'accounts found');
    return slots;
    
  } catch (error) {
    console.error('Critical error getting account slots:', error);
    return slots; // Return empty slots rather than throw
  }
};

/**
 * Save account to available slot
 */
export const saveAccountToSlot = async (account: UserAccount): Promise<number> => {
  const deviceId = await getDeviceKey();
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
    db.close();
    
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
  const deviceId = await getDeviceKey();
  
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
    
    db.close();
    
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
  const deviceId = await getDeviceKey();
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
        
        db.close();
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
      
      db.close();
    } catch (error) {
      console.warn('IndexedDB active slot update failed:', error);
    }
    
    // Update localStorage backup
    localStorage.setItem(`${deviceId}_slot_${slotId}`, JSON.stringify(activeSlot));
    
    // Set session storage for quick access
    sessionStorage.setItem(`${deviceId}_activeAccountSlot`, slotId.toString());
    
    console.log('Active account slot set successfully:', slotId);
  }
};

/**
 * Enhanced active account detection with bulletproof device identification
 */
export const getActiveAccount = async (): Promise<UserAccount | null> => {
  const deviceId = await getDeviceKey();
  
  try {
    // Layer 1: Check session storage for quick access
    const sessionSlot = sessionStorage.getItem(`${deviceId}_activeAccountSlot`);
    if (sessionSlot) {
      const account = await getAccountBySlot(parseInt(sessionSlot));
      if (account) {
        console.log('Found active account from session:', account.name);
        return account;
      }
    }
    
    // Layer 2: Check localStorage for active flag
    const slots = await getAccountSlots();
    const activeSlot = slots.find(slot => slot.isActive && slot.userId);
    if (activeSlot) {
      const account = await getAccountBySlot(activeSlot.slotId);
      if (account) {
        console.log('Found active account from storage:', account.name);
        // Update session storage for next time
        sessionStorage.setItem(`${deviceId}_activeAccountSlot`, activeSlot.slotId.toString());
        return account;
      }
    }
    
    // Layer 3: Check for any recent login
    const recentSlots = slots
      .filter(slot => slot.userId && slot.lastLogin)
      .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime());
    
    if (recentSlots.length > 0) {
      const account = await getAccountBySlot(recentSlots[0].slotId);
      if (account) {
        console.log('Found most recent account:', account.name);
        // Set as active
        await setActiveAccountSlot(recentSlots[0].slotId);
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
  const deviceId = await getDeviceKey();
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
    
    db.close();
    
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
  const deviceId = await getDeviceKey();
  
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    const slotStore = transaction.objectStore('accountSlots');
    await new Promise<void>((resolve, reject) => {
      const request = slotStore.delete(`${deviceId}_slot_${slotId}`);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.warn('IndexedDB clear failed:', error);
  }
  
  // Clear localStorage
  localStorage.removeItem(`${deviceId}_slot_${slotId}`);
  localStorage.removeItem(`${deviceId}_account_${slotId}`);
  
  const activeSlot = sessionStorage.getItem(`${deviceId}_activeAccountSlot`);
  if (activeSlot === slotId.toString()) {
    sessionStorage.removeItem(`${deviceId}_activeAccountSlot`);
  }
};

/**
 * Clear active account session (for logout)
 */
export const clearActiveAccount = async (): Promise<void> => {
  const deviceId = await getDeviceKey();
  
  try {
    // Clear session storage
    sessionStorage.removeItem(`${deviceId}_activeAccountSlot`);
    
    // Update all slots to inactive in storage
    const slots = await getAccountSlots();
    for (const slot of slots) {
      if (slot.userId && slot.isActive) {
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
          
          db.close();
        } catch (error) {
          console.warn('IndexedDB clear failed:', error);
        }
        
        // Update localStorage backup
        localStorage.setItem(`${deviceId}_slot_${slot.slotId}`, JSON.stringify(slot));
      }
    }
    
    console.log('Active account session cleared');
  } catch (error) {
    console.error('Failed to clear active account:', error);
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
  clearActiveAccount,
  verifyAccountPassword
};
