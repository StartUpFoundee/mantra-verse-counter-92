
/**
 * Generates a unique user ID based on DOB and timestamp
 */
export const generateUserID = (dob: string): string => {
  // Extract date components from the date picker value
  const dobDate = new Date(dob);
  const day = String(dobDate.getDate()).padStart(2, '0');
  const month = String(dobDate.getMonth() + 1).padStart(2, '0');
  const year = dobDate.getFullYear();
  
  // Format DOB part as DDMMYYYY
  const dobPart = `${day}${month}${year}`;
  
  // Get current timestamp and take last 4 digits
  const timestamp = new Date().getTime().toString();
  const uniquePart = timestamp.slice(-4);
  
  // Combine to create final ID
  return `${dobPart}_${uniquePart}`;
};

/**
 * Validates if the provided ID follows the spiritual ID format
 */
export const validateUserID = (id: string): boolean => {
  // Validate format: DDMMYYYY_XXXX
  const regex = /^\d{8}_\d{4}$/;
  return regex.test(id);
};

/**
 * Corrects common mistakes in user ID input
 */
export const correctUserID = (id: string): string => {
  // Remove spaces
  let corrected = id.trim();
  
  // Add underscore if missing but seems like a valid ID otherwise
  if (!corrected.includes('_') && corrected.length === 12) {
    corrected = `${corrected.substring(0, 8)}_${corrected.substring(8)}`;
  }
  
  return corrected;
};

/**
 * Extract date of birth from a user ID
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

/**
 * Checks if user is logged in
 */
export const isUserLoggedIn = (): boolean => {
  return localStorage.getItem('chantTrackerUserData') !== null;
};

/**
 * Gets user data from localStorage
 */
export const getUserData = () => {
  const userData = localStorage.getItem('chantTrackerUserData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (userData: any) => {
  localStorage.setItem('chantTrackerUserData', JSON.stringify(userData));
};

/**
 * Log out user by clearing localStorage
 */
export const logoutUser = () => {
  localStorage.removeItem('chantTrackerUserData');
};

/**
 * Generate a spiritual ID based on name
 * This is for compatibility with the SpiritualIdPage
 */
export const generateSpiritualId = (name: string): string => {
  const timestamp = new Date().getTime().toString();
  const uniquePart = timestamp.slice(-4);
  return `OM${name}${uniquePart}`;
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
