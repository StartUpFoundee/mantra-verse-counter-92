/**
 * Account Storage Management - Enhanced 8-Layer Storage System
 * IndexedDB → localStorage → sessionStorage → window.name → historyState → cssVariables → serviceWorker → broadcastChannel
 */

import { enhancedStore, enhancedRetrieve, initEnhancedStorage } from './enhancedStorage';

// Account storage configuration
export const STORAGE_CONFIG = {
  MAX_ACCOUNTS: 3,
  ACCOUNT_PREFIXES: ['acc1_', 'acc2_', 'acc3_'],
  DB_NAME: 'NaamJapaAccounts',
  DB_VERSION: 2
};

// Storage layers enum
export enum StorageLayer {
  INDEXED_DB = 'indexeddb',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  WINDOW_NAME = 'windowName'
}

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
  userData: any; // All app-specific data
}

/**
 * Initialize enhanced storage on module load
 */
let enhancedStorageInitialized = false;

const ensureEnhancedStorage = async () => {
  if (!enhancedStorageInitialized) {
    await initEnhancedStorage();
    enhancedStorageInitialized = true;
  }
};

/**
 * Initialize IndexedDB for account management
 */
const initAccountDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORAGE_CONFIG.DB_NAME, STORAGE_CONFIG.DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Account slots store
      if (!db.objectStoreNames.contains('accountSlots')) {
        const slotsStore = db.createObjectStore('accountSlots', { keyPath: 'slotId' });
        slotsStore.createIndex('userId', 'userId', { unique: false });
      }
      
      // Account data store
      if (!db.objectStoreNames.contains('accountData')) {
        const dataStore = db.createObjectStore('accountData', { keyPath: 'id' });
        dataStore.createIndex('slotId', 'slotId', { unique: false });
      }
      
      // App data store (isolated per account)
      if (!db.objectStoreNames.contains('appData')) {
        const appStore = db.createObjectStore('appData', { keyPath: ['accountId', 'key'] });
        appStore.createIndex('accountId', 'accountId', { unique: false });
      }
    };
  });
};

/**
 * Generate unique user ID with new format
 */
export const generateUserId = (name: string, dob: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const dobFormatted = dob.replace(/-/g, '');
  const timestamp = Date.now();
  const deviceFingerprint = generateDeviceFingerprint();
  
  return `${cleanName}_${dobFormatted}_${timestamp}_${deviceFingerprint}`;
};

/**
 * Generate simple device fingerprint
 */
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('device-id', 10, 10);
  const canvasFingerprint = canvas.toDataURL().slice(-6);
  
  const screenFingerprint = `${screen.width}x${screen.height}`;
  const timezoneFingerprint = Intl.DateTimeFormat().resolvedOptions().timeZone.slice(-3);
  
  return btoa(`${canvasFingerprint}${screenFingerprint}${timezoneFingerprint}`).slice(0, 6);
};

/**
 * Hash password with PBKDF2
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
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
 * Get all account slots with enhanced storage
 */
export const getAccountSlots = async (): Promise<AccountSlot[]> => {
  await ensureEnhancedStorage();
  
  try {
    // Try enhanced storage first
    const slots = await enhancedRetrieve('accountSlots');
    if (slots && Array.isArray(slots)) {
      return slots;
    }
  } catch (error) {
    console.warn('Enhanced storage retrieval failed, trying legacy methods');
  }

  // Fallback to traditional methods
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots'], 'readonly');
    const store = transaction.objectStore('accountSlots');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const slots = request.result;
        const allSlots: AccountSlot[] = [];
        for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
          const existingSlot = slots.find((s: AccountSlot) => s.slotId === i);
          allSlots.push(existingSlot || {
            slotId: i,
            userId: null,
            name: null,
            lastLogin: null,
            createdAt: null,
            isActive: false
          });
        }
        
        // Store in enhanced storage for future use
        enhancedStore('accountSlots', allSlots).catch(console.warn);
        
        resolve(allSlots);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    return getAccountSlotsFromLocalStorage();
  }
};

/**
 * Fallback: Get account slots from localStorage
 */
const getAccountSlotsFromLocalStorage = (): AccountSlot[] => {
  const slots: AccountSlot[] = [];
  for (let i = 1; i <= STORAGE_CONFIG.MAX_ACCOUNTS; i++) {
    const slotData = localStorage.getItem(`acc${i}_slot`);
    if (slotData) {
      slots.push(JSON.parse(slotData));
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
  }
  return slots;
};

/**
 * Save account to available slot with enhanced storage
 */
export const saveAccountToSlot = async (account: UserAccount): Promise<number> => {
  await ensureEnhancedStorage();
  
  const slots = await getAccountSlots();
  const availableSlot = slots.find(slot => !slot.userId);
  
  if (!availableSlot) {
    throw new Error('No available account slots. Maximum 3 accounts per device.');
  }
  
  const slotId = availableSlot.slotId;
  account.slotId = slotId;
  
  try {
    // Store in enhanced storage system
    await enhancedStore(`account_${account.id}`, account);
    await enhancedStore(`slot_${slotId}`, {
      slotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    });
    
    // Update slots array and store
    const updatedSlots = slots.map(slot => 
      slot.slotId === slotId 
        ? { ...slot, userId: account.id, name: account.name, lastLogin: account.lastLogin, createdAt: account.createdAt, isActive: true }
        : slot
    );
    await enhancedStore('accountSlots', updatedSlots);
    
    // Traditional storage as backup
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    const slotStore = transaction.objectStore('accountSlots');
    const slotData: AccountSlot = {
      slotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    slotStore.put(slotData);
    
    const accountStore = transaction.objectStore('accountData');
    accountStore.put(account);
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(transaction.error);
    });
    
    // localStorage backup
    localStorage.setItem(`acc${slotId}_slot`, JSON.stringify(slotData));
    localStorage.setItem(`acc${slotId}_data`, JSON.stringify(account));
    
  } catch (error) {
    console.error('Enhanced storage save failed, using fallback:', error);
    // Fallback to localStorage only
    const slotData: AccountSlot = {
      slotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    localStorage.setItem(`acc${slotId}_slot`, JSON.stringify(slotData));
    localStorage.setItem(`acc${slotId}_data`, JSON.stringify(account));
  }
  
  return slotId;
};

/**
 * Get account by slot ID with enhanced storage
 */
export const getAccountBySlot = async (slotId: number): Promise<UserAccount | null> => {
  await ensureEnhancedStorage();
  
  try {
    // Try to get slot info first
    const slotData = await enhancedRetrieve(`slot_${slotId}`);
    if (slotData && slotData.userId) {
      // Get full account data
      const account = await enhancedRetrieve(`account_${slotData.userId}`);
      if (account) {
        return account;
      }
    }
  } catch (error) {
    console.warn('Enhanced storage account retrieval failed, trying traditional methods');
  }

  // Fallback to traditional methods
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountData'], 'readonly');
    const store = transaction.objectStore('accountData');
    const index = store.index('slotId');
    
    return new Promise((resolve, reject) => {
      const request = index.get(slotId);
      request.onsuccess = () => {
        const account = request.result || null;
        if (account) {
          // Store in enhanced storage for future use
          enhancedStore(`account_${account.id}`, account).catch(console.warn);
        }
        resolve(account);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    const accountData = localStorage.getItem(`acc${slotId}_data`);
    return accountData ? JSON.parse(accountData) : null;
  }
};

/**
 * Set active account slot with enhanced storage
 */
export const setActiveAccountSlot = async (slotId: number): Promise<void> => {
  await ensureEnhancedStorage();
  
  // Clear all active flags first
  const slots = await getAccountSlots();
  for (const slot of slots) {
    if (slot.userId) {
      slot.isActive = false;
      try {
        await enhancedStore(`slot_${slot.slotId}`, slot);
        
        const db = await initAccountDB();
        const transaction = db.transaction(['accountSlots'], 'readwrite');
        const store = transaction.objectStore('accountSlots');
        store.put(slot);
      } catch (error) {
        localStorage.setItem(`acc${slot.slotId}_slot`, JSON.stringify(slot));
      }
    }
  }
  
  // Set the selected slot as active
  const activeSlot = slots.find(s => s.slotId === slotId);
  if (activeSlot && activeSlot.userId) {
    activeSlot.isActive = true;
    activeSlot.lastLogin = new Date().toISOString();
    
    try {
      await enhancedStore(`slot_${slotId}`, activeSlot);
      await enhancedStore('activeAccountSlot', slotId);
      
      const db = await initAccountDB();
      const transaction = db.transaction(['accountSlots'], 'readwrite');
      const store = transaction.objectStore('accountSlots');
      store.put(activeSlot);
    } catch (error) {
      localStorage.setItem(`acc${slotId}_slot`, JSON.stringify(activeSlot));
    }
    
    // Update slots array
    const updatedSlots = slots.map(slot => 
      slot.slotId === slotId ? activeSlot : slot
    );
    await enhancedStore('accountSlots', updatedSlots);
    
    // Set session data
    sessionStorage.setItem('activeAccountSlot', slotId.toString());
    window.name = `activeSlot_${slotId}`;
  }
};

/**
 * Get current active account with enhanced storage
 */
export const getActiveAccount = async (): Promise<UserAccount | null> => {
  await ensureEnhancedStorage();
  
  try {
    // Try enhanced storage first
    const activeSlotId = await enhancedRetrieve('activeAccountSlot');
    if (activeSlotId) {
      return await getAccountBySlot(activeSlotId);
    }
  } catch (error) {
    console.warn('Enhanced storage active account retrieval failed, trying fallbacks');
  }

  // Check session first
  const sessionSlot = sessionStorage.getItem('activeAccountSlot');
  if (sessionSlot) {
    return await getAccountBySlot(parseInt(sessionSlot));
  }
  
  // Check window.name
  if (window.name.startsWith('activeSlot_')) {
    const slotId = parseInt(window.name.split('_')[1]);
    return await getAccountBySlot(slotId);
  }
  
  // Find active slot from storage
  const slots = await getAccountSlots();
  const activeSlot = slots.find(slot => slot.isActive);
  if (activeSlot) {
    return await getAccountBySlot(activeSlot.slotId);
  }
  
  return null;
};

/**
 * Replace account in slot with enhanced storage
 */
export const replaceAccountInSlot = async (account: UserAccount, targetSlotId: number): Promise<void> => {
  await ensureEnhancedStorage();
  
  account.slotId = targetSlotId;
  
  try {
    // Get old account to clean up
    const oldAccount = await getAccountBySlot(targetSlotId);
    
    // Store new account in enhanced storage
    await enhancedStore(`account_${account.id}`, account);
    await enhancedStore(`slot_${targetSlotId}`, {
      slotId: targetSlotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    });
    
    // Clean up old account data
    if (oldAccount) {
      try {
        // Note: In a real implementation, you might want to keep old data for recovery
        console.log(`Replacing account ${oldAccount.id} with ${account.id}`);
      } catch (error) {
        console.warn('Old account cleanup failed:', error);
      }
    }
    
    // Traditional storage as backup
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData', 'appData'], 'readwrite');
    
    // Clear existing app data for this slot
    const appStore = transaction.objectStore('appData');
    const appIndex = appStore.index('accountId');
    if (oldAccount) {
      const deleteRequest = appIndex.openCursor(IDBKeyRange.only(oldAccount.id));
      deleteRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
    
    // Update slot
    const slotStore = transaction.objectStore('accountSlots');
    const slotData: AccountSlot = {
      slotId: targetSlotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    slotStore.put(slotData);
    
    // Save new account data
    const accountStore = transaction.objectStore('accountData');
    accountStore.put(account);
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(transaction.error);
    });
    
    // Update localStorage backup
    localStorage.setItem(`acc${targetSlotId}_slot`, JSON.stringify(slotData));
    localStorage.setItem(`acc${targetSlotId}_data`, JSON.stringify(account));
    
  } catch (error) {
    console.error('Enhanced storage replace failed, using localStorage:', error);
    // Fallback to localStorage
    const slotData: AccountSlot = {
      slotId: targetSlotId,
      userId: account.id,
      name: account.name,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      isActive: true
    };
    localStorage.setItem(`acc${targetSlotId}_slot`, JSON.stringify(slotData));
    localStorage.setItem(`acc${targetSlotId}_data`, JSON.stringify(account));
  }
};

/**
 * Clear account slot
 */
export const clearAccountSlot = async (slotId: number): Promise<void> => {
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData', 'appData'], 'readwrite');
    
    const account = await getAccountBySlot(slotId);
    if (account) {
      const appStore = transaction.objectStore('appData');
      const appIndex = appStore.index('accountId');
      const deleteRequest = appIndex.openCursor(IDBKeyRange.only(account.id));
      deleteRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }
    
    const slotStore = transaction.objectStore('accountSlots');
    slotStore.delete(slotId);
    
    if (account) {
      const accountStore = transaction.objectStore('accountData');
      accountStore.delete(account.id);
    }
    
  } catch (error) {
    console.error('IndexedDB clear failed:', error);
  }
  
  localStorage.removeItem(`acc${slotId}_slot`);
  localStorage.removeItem(`acc${slotId}_data`);
  
  const activeSlot = sessionStorage.getItem('activeAccountSlot');
  if (activeSlot === slotId.toString()) {
    sessionStorage.removeItem('activeAccountSlot');
    window.name = '';
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
