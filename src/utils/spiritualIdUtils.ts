
/**
 * Generates a unique spiritual ID with the format OM + 4 digits + 2 characters
 */
export const generateSpiritualId = (): string => {
  // Prefix is always "OM"
  const prefix = "OM";
  
  // Get last 4 digits from timestamp
  const timestamp = Date.now().toString().slice(-4);
  
  // Create a simple hash from screen size and navigator info
  // This adds a level of uniqueness even with the same timestamp
  const screenInfo = `${window.innerWidth}${window.innerHeight}${navigator.userAgent.length}`;
  const screenHash = screenInfo.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Convert hash to 2 alphanumeric characters
  const hashStr = Math.abs(screenHash).toString(36).toUpperCase();
  const suffix = hashStr.length > 2 ? hashStr.substring(0, 2) : hashStr.padEnd(2, 'A');
  
  return `${prefix}${timestamp}${suffix}`;
};

/**
 * Validates if the provided ID follows the spiritual ID format
 */
export const validateSpiritualId = (id: string): boolean => {
  // Basic format validation: starts with OM, followed by 4-6 characters
  const regex = /^OM[A-Z0-9]{4,6}$/;
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
  if (!corrected.startsWith("OM") && corrected.length >= 4) {
    if (corrected.length > 6) {
      corrected = `OM${corrected.substring(0, 6)}`;
    } else {
      corrected = `OM${corrected}`;
    }
  }
  
  return corrected;
};
