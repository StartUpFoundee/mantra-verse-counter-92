
/**
 * Account Storage Management - 4-Layer Storage System
 * IndexedDB (primary) → localStorage (backup) → sessionStorage (session) → window.name (navigation)
 */

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
 * Get all account slots
 */
export const getAccountSlots = async (): Promise<AccountSlot[]> => {
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots'], 'readonly');
    const store = transaction.objectStore('accountSlots');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const slots = request.result;
        // Ensure we have exactly 3 slots
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
        resolve(allSlots);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage
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
 * Save account to available slot
 */
export const saveAccountToSlot = async (account: UserAccount): Promise<number> => {
  const slots = await getAccountSlots();
  const availableSlot = slots.find(slot => !slot.userId);
  
  if (!availableSlot) {
    throw new Error('No available account slots. Maximum 3 accounts per device.');
  }
  
  const slotId = availableSlot.slotId;
  account.slotId = slotId;
  
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData'], 'readwrite');
    
    // Update slot
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
    
    // Save account data
    const accountStore = transaction.objectStore('accountData');
    accountStore.put(account);
    
    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(undefined);
      transaction.onerror = () => reject(transaction.error);
    });
    
    // Backup to localStorage
    localStorage.setItem(`acc${slotId}_slot`, JSON.stringify(slotData));
    localStorage.setItem(`acc${slotId}_data`, JSON.stringify(account));
    
  } catch (error) {
    console.error('IndexedDB save failed, using localStorage:', error);
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
 * Get account by slot ID
 */
export const getAccountBySlot = async (slotId: number): Promise<UserAccount | null> => {
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountData'], 'readonly');
    const store = transaction.objectStore('accountData');
    const index = store.index('slotId');
    
    return new Promise((resolve, reject) => {
      const request = index.get(slotId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    // Fallback to localStorage
    const accountData = localStorage.getItem(`acc${slotId}_data`);
    return accountData ? JSON.parse(accountData) : null;
  }
};

/**
 * Set active account slot
 */
export const setActiveAccountSlot = async (slotId: number): Promise<void> => {
  // Clear all active flags first
  const slots = await getAccountSlots();
  for (const slot of slots) {
    if (slot.userId) {
      slot.isActive = false;
      try {
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
      const db = await initAccountDB();
      const transaction = db.transaction(['accountSlots'], 'readwrite');
      const store = transaction.objectStore('accountSlots');
      store.put(activeSlot);
    } catch (error) {
      localStorage.setItem(`acc${slotId}_slot`, JSON.stringify(activeSlot));
    }
    
    // Set session data
    sessionStorage.setItem('activeAccountSlot', slotId.toString());
    window.name = `activeSlot_${slotId}`;
  }
};

/**
 * Get current active account
 */
export const getActiveAccount = async (): Promise<UserAccount | null> => {
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
 * Replace account in slot (for import when device is full)
 */
export const replaceAccountInSlot = async (account: UserAccount, targetSlotId: number): Promise<void> => {
  account.slotId = targetSlotId;
  
  try {
    const db = await initAccountDB();
    const transaction = db.transaction(['accountSlots', 'accountData', 'appData'], 'readwrite');
    
    // Clear existing app data for this slot
    const appStore = transaction.objectStore('appData');
    const appIndex = appStore.index('accountId');
    const oldAccount = await getAccountBySlot(targetSlotId);
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
    console.error('IndexedDB replace failed, using localStorage:', error);
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
    
    // Get account to clear app data
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
    
    // Clear slot
    const slotStore = transaction.objectStore('accountSlots');
    slotStore.delete(slotId);
    
    // Clear account data
    if (account) {
      const accountStore = transaction.objectStore('accountData');
      accountStore.delete(account.id);
    }
    
  } catch (error) {
    console.error('IndexedDB clear failed:', error);
  }
  
  // Clear localStorage backup
  localStorage.removeItem(`acc${slotId}_slot`);
  localStorage.removeItem(`acc${slotId}_data`);
  
  // Clear session if this was the active slot
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
