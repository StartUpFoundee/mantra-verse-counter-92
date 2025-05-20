
/**
 * Generates a unique spiritual ID with the format OM + name + 2-3 characters
 */
export const generateSpiritualId = (name?: string): string => {
  // Prefix is always "OM"
  const prefix = "OM";
  
  // Process the name if provided
  const processedName = name ? name.trim().replace(/\s+/g, "").substring(0, 10) : "";
  
  // Get last 2 digits from timestamp
  const timestamp = Date.now().toString().slice(-2);
  
  // Create a simple hash from screen size and navigator info
  // This adds a level of uniqueness even with the same timestamp
  const screenInfo = `${window.innerWidth}${window.innerHeight}${navigator.userAgent.length}`;
  const screenHash = screenInfo.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Convert hash to a single alphanumeric character
  const hashStr = Math.abs(screenHash).toString(36).toUpperCase();
  const suffix = hashStr.length > 1 ? hashStr.substring(0, 1) : 'A';
  
  // If no name is provided, fallback to the previous ID format with 4 timestamp digits
  if (!processedName) {
    const fullTimestamp = Date.now().toString().slice(-4);
    const longerSuffix = hashStr.length > 2 ? hashStr.substring(0, 2) : hashStr.padEnd(2, 'A');
    return `${prefix}${fullTimestamp}${longerSuffix}`;
  }
  
  return `${prefix}${processedName}${timestamp}${suffix}`;
};

/**
 * Validates if the provided ID follows the spiritual ID format
 */
export const validateSpiritualId = (id: string): boolean => {
  // Updated format validation: starts with OM, followed by at least 3 more characters
  const regex = /^OM[A-Za-z0-9]{3,}$/;
  return regex.test(id);
};

/**
 * Corrects common mistakes in spiritual ID input
 */
export const correctSpiritualId = (id: string): string => {
  // Convert to uppercase
  let corrected = id.toUpperCase();
  
  // Replace common mistypes
  corrected = corrected.replace(/0/g, "O");
  corrected = corrected.replace(/[^A-Z0-9]/g, "");
  
  // Add OM prefix if missing but seems like a valid ID otherwise
  if (!corrected.startsWith("OM") && corrected.length >= 3) {
    corrected = `OM${corrected}`;
  }
  
  return corrected;
};

/**
 * Extract name from a spiritual ID if possible
 */
export const extractNameFromId = (id: string): string | null => {
  if (!id.startsWith("OM")) return null;
  
  // Remove the OM prefix
  const withoutPrefix = id.substring(2);
  
  // If the remaining part is less than 4 characters, it's probably not a name-based ID
  if (withoutPrefix.length < 4) return null;
  
  // Extract all letters until we hit a number
  const nameMatch = withoutPrefix.match(/^([A-Za-z]+)/);
  if (nameMatch && nameMatch[1].length >= 2) {
    return nameMatch[1];
  }
  
  return null;
};

/**
 * Spiritual icons available for profile selection
 */
export const spiritualIcons = [
  { id: "om", symbol: "🕉️", name: "Om" },
  { id: "lotus", symbol: "🪷", name: "Lotus" },
  { id: "namaste", symbol: "🙏", name: "Namaste" },
  { id: "peace", symbol: "☮️", name: "Peace" },
  { id: "star", symbol: "✨", name: "Star" },
  { id: "moon", symbol: "🌙", name: "Moon" },
  { id: "sun", symbol: "☀️", name: "Sun" },
  { id: "bell", symbol: "🔔", name: "Bell" },
  { id: "incense", symbol: "🧘", name: "Meditation" },
  { id: "mandala", symbol: "🔯", name: "Mandala" },
];
