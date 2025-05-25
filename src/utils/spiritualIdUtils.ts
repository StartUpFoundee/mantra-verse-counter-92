/**
 * Generates a unique user ID based on DOB, timestamp, and random component
 * Ensures uniqueness even for users with same DOB
 */
export const generateUserID = (dob: string): string => {
  // Extract date components from the date picker value
  const dobDate = new Date(dob);
  const day = String(dobDate.getDate()).padStart(2, '0');
  const month = String(dobDate.getMonth() + 1).padStart(2, '0');
  const year = dobDate.getFullYear();
  
  // Format DOB part as DDMMYYYY
  const dobPart = `${day}${month}${year}`;
  
  // Get current timestamp and take last 6 digits for better uniqueness
  const timestamp = new Date().getTime().toString();
  const timePart = timestamp.slice(-6);
  
  // Add random component for extra uniqueness
  const randomPart = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  
  // Combine to create final ID: DDMMYYYY_TTTTTT_RRR
  return `${dobPart}_${timePart}_${randomPart}`;
};

/**
 * Validates if the provided ID follows the enhanced spiritual ID format
 */
export const validateUserID = (id: string): boolean => {
  // Validate format: DDMMYYYY_TTTTTT_RRR (enhanced format)
  const enhancedRegex = /^\d{8}_\d{6}_\d{3}$/;
  // Also support old format: DDMMYYYY_XXXX for backward compatibility
  const oldRegex = /^\d{8}_\d{4}$/;
  return enhancedRegex.test(id) || oldRegex.test(id);
};

/**
 * Corrects common mistakes in user ID input
 */
export const correctUserID = (id: string): string => {
  // Remove spaces
  let corrected = id.trim();
  
  // Handle both old and new formats
  if (!corrected.includes('_')) {
    // Try to format as new format if length matches
    if (corrected.length === 17) {
      corrected = `${corrected.substring(0, 8)}_${corrected.substring(8, 14)}_${corrected.substring(14)}`;
    } else if (corrected.length === 12) {
      // Old format
      corrected = `${corrected.substring(0, 8)}_${corrected.substring(8)}`;
    }
  }
  
  return corrected;
};

/**
 * Extract date of birth from a user ID (works with both old and new formats)
 */
export const extractDOBFromID = (id: string): string | null => {
  if (!id.includes('_')) return null;
  
  const dobPart = id.split('_')[0];
  if (dobPart.length !== 8) return null;
  
  const day = dobPart.substring(0, 2);
  const month = dobPart.substring(2, 4);
  const year = dobPart.substring(4, 8);
  
  // Return in format YYYY-MM-DD for HTML date input
  return `${year}-${month}-${day}`;
};

/**
 * Spiritual icons available for profile selection
 */
export const spiritualIcons = [
  { id: "om", symbol: "🕉️", name: "Om" },
  { id: "lotus", symbol: "🪷", name: "Lotus" },
  { id: "namaste", symbol: "🙏", name: "Namaste" },
  { id: "peace", symbol: "☮️", name: "Peace" },
  { id: "chakra", symbol: "⚛️", name: "Chakra" },
  { id: "star", symbol: "✨", name: "Star" },
  { id: "moon", symbol: "🌙", name: "Moon" },
  { id: "sun", symbol: "☀️", name: "Sun" },
  { id: "bell", symbol: "🔔", name: "Bell" },
  { id: "incense", symbol: "🧘", name: "Meditation" },
  { id: "mandala", symbol: "🔯", name: "Mandala" },
];

// Import IndexedDB utilities
import { 
  getUserData as getDBUserData, 
  saveUserData as saveDBUserData, 
  logoutUser as logoutDBUser, 
  isUserLoggedIn as isDBUserLoggedIn,
  getItem,
  setItem,
  removeItem
} from './indexedDBUtils';

/**
 * Checks if user is logged in
 * Retains localStorage check for backward compatibility but adds IndexedDB support
 */
export const isUserLoggedIn = (): boolean => {
  // Check localStorage first for faster response (sync operation)
  return localStorage.getItem('chantTrackerUserData') !== null;
};

/**
 * Gets user data from storage
 * Maintains localStorage compatibility but adds IndexedDB support
 */
export const getUserData = () => {
  // For synchronous access, use localStorage first
  const userData = localStorage.getItem('chantTrackerUserData');
  
  // Start async fetch from IndexedDB (which will be used next time)
  if (userData) {
    const parsedData = JSON.parse(userData);
    // This is async but we don't wait for it
    getDBUserData().catch(console.error);
    return parsedData;
  }
  
  return null;
};

/**
 * Save user data to storage
 * Writes to both localStorage and IndexedDB
 */
export const saveUserData = (userData: any) => {
  localStorage.setItem('chantTrackerUserData', JSON.stringify(userData));
  // Async save to IndexedDB
  saveDBUserData(userData).catch(console.error);
};

/**
 * Log out user by clearing storage
 */
export const logoutUser = () => {
  localStorage.removeItem('chantTrackerUserData');
  // Async logout from IndexedDB
  logoutDBUser().catch(console.error);
};

/**
 * Generate a spiritual ID based on name (enhanced uniqueness)
 */
export const generateSpiritualId = (name: string): string => {
  const timestamp = new Date().getTime().toString();
  const timePart = timestamp.slice(-6);
  const randomPart = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `OM${name}${timePart}_${randomPart}`;
};

/**
 * Validate a spiritual ID format
 * This is for compatibility with the SpiritualIdPage
 */
export const validateSpiritualId = (id: string): boolean => {
  // Simple validation - check if ID starts with OM and has at least 5 characters
  return id.startsWith('OM') && id.length >= 5;
};

/**
 * Extract name from a spiritual ID
 * This is for compatibility with the SpiritualIdPage
 */
export const extractNameFromId = (id: string): string | null => {
  if (!id.startsWith('OM')) return null;
  
  // Extract the middle part (name) by removing "OM" prefix and last 4 characters
  const nameWithoutPrefix = id.substring(2);
  if (nameWithoutPrefix.length <= 4) return null;
  
  return nameWithoutPrefix.substring(0, nameWithoutPrefix.length - 4);
};

/**
 * Recover IDs that match a specific date of birth
 * Searches storage for potential matching IDs
 */
export const findIDsByDOB = (dob: string): string[] => {
  const dobDate = new Date(dob);
  const day = String(dobDate.getDate()).padStart(2, '0');
  const month = String(dobDate.getMonth() + 1).padStart(2, '0');
  const year = dobDate.getFullYear();
  
  // Format DOB part as DDMMYYYY
  const dobPart = `${day}${month}${year}`;
  
  // Try to find IDs that start with this DOB part
  const matchingIDs: string[] = [];
  
  // Check current user data
  const userData = getUserData();
  if (userData && userData.id && userData.id.startsWith(dobPart)) {
    matchingIDs.push(userData.id);
  }
  
  // In a real app, we might search through other stored IDs or a backend
  // With IndexedDB, we would query all users and filter by DOB
  
  return matchingIDs;
};

/**
 * Create a QR code data URL based on user ID
 * Returns a URL that can be used to log in
 */
export const generateIdQRData = (id: string): string => {
  const baseUrl = window.location.origin;
  const loginUrl = `${baseUrl}/?id=${encodeURIComponent(id)}`;
  return loginUrl;
};

/**
 * Import user data from a file
 * Stores in both localStorage and IndexedDB
 */
export const importUserData = (jsonData: string): boolean => {
  try {
    const userData = JSON.parse(jsonData);
    
    // Basic validation to ensure it's valid user data
    if (!userData.id || !userData.name) {
      return false;
    }
    
    // Save to both storages
    saveUserData(userData);
    return true;
  } catch (e) {
    console.error("Failed to import user data:", e);
    return false;
  }
};
