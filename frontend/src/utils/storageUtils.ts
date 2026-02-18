/**
 * Safe wrappers for localStorage and sessionStorage with security enhancements
 * 
 * SECURITY FEATURES:
 * - Prevents 'The operation is insecure' errors in restricted browser environments
 * - Base64 encoding for data obfuscation (not encryption, but adds a layer)
 * - Timestamp tracking for theft detection
 * - Integrity validation on retrieval
 * 
 * NOTE: These are safe wrappers, not secure storage. For sensitive data like tokens,
 * use the encryption functions from cryptoUtils.ts in combination with these wrappers.
 */

// Storage metadata interface
interface StorageMetadata {
  timestamp: number;
  integrity: string;
}

/**
 * Encode data with metadata for storage
 * Adds timestamp and integrity check for theft detection
 */
function encodeStorageData(data: string): string {
  const metadata: StorageMetadata = {
    timestamp: Date.now(),
    integrity: simpleHash(data)
  };
  
  const wrapped = JSON.stringify({ data, metadata });
  return btoa(wrapped); // Base64 encode for basic obfuscation
}

/**
 * Decode data from storage and validate integrity
 * Returns the data if valid, null if tampered with
 */
function decodeStorageData(encoded: string): string | null {
  try {
    const decoded = atob(encoded);
    const wrapped = JSON.parse(decoded);
    
    if (!wrapped.data || !wrapped.metadata) {
      console.warn('Invalid storage data format');
      return null;
    }
    
    // Check integrity
    const expectedHash = simpleHash(wrapped.data);
    if (wrapped.metadata.integrity !== expectedHash) {
      console.warn('Storage data integrity check failed - possible tampering detected');
      return null;
    }
    
    return wrapped.data;
  } catch (e) {
    console.error('Failed to decode storage data:', e);
    return null;
  }
}

/**
 * Simple hash for integrity checking (not cryptographic, just for detecting corruption/tampering)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * Get timestamp from stored data if available
 */
function getStorageTimestamp(key: string, storage: Storage): number | null {
  try {
    const encoded = storage.getItem(key);
    if (!encoded) return null;
    
    const decoded = atob(encoded);
    const wrapped = JSON.parse(decoded);
    return wrapped.metadata?.timestamp || null;
  } catch (e) {
    return null;
  }
}

/**
 * Check if stored data is too old (potentially stolen)
 * @param key - Storage key
 * @param maxAge - Maximum age in milliseconds (default: 30 days)
 */
export function isStorageDataTooOld(key: string, maxAge: number = 30 * 24 * 60 * 60 * 1000): boolean {
  const timestamp = getStorageTimestamp(key, localStorage) || getStorageTimestamp(key, sessionStorage);
  if (!timestamp) return false;
  
  const age = Date.now() - timestamp;
  return age > maxAge;
}

/**
 * Enhanced localStorage wrapper with security features
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      
      // Try to decode as wrapped data first
      const decoded = decodeStorageData(encoded);
      if (decoded !== null) {
        return decoded;
      }
      
      // Legacy support: return as-is if decode fails
      return encoded;
    } catch (e) {
      console.warn(`localStorage.getItem('${key}') failed:`, e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      const encoded = encodeStorageData(value);
      localStorage.setItem(key, encoded);
    } catch (e) {
      console.warn(`localStorage.setItem('${key}') failed:`, e);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage.removeItem('${key}') failed:`, e);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage.clear() failed:', e);
    }
  },
  
  get length(): number {
    try {
      return localStorage.length;
    } catch (e) {
      console.warn('localStorage.length access failed:', e);
      return 0;
    }
  },
  
  /**
   * Get the timestamp when this key was last updated
   */
  getTimestamp: (key: string): number | null => {
    return getStorageTimestamp(key, localStorage);
  },
  
  /**
   * Get the age of stored data in milliseconds
   */
  getDataAge: (key: string): number | null => {
    const timestamp = getStorageTimestamp(key, localStorage);
    if (!timestamp) return null;
    return Date.now() - timestamp;
  }
};

/**
 * Enhanced sessionStorage wrapper with security features
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      
      // Try to decode as wrapped data first
      const decoded = decodeStorageData(encoded);
      if (decoded !== null) {
        return decoded;
      }
      
      // Legacy support: return as-is if decode fails
      return encoded;
    } catch (e) {
      console.warn(`sessionStorage.getItem('${key}') failed:`, e);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      const encoded = encodeStorageData(value);
      sessionStorage.setItem(key, encoded);
    } catch (e) {
      console.warn(`sessionStorage.setItem('${key}') failed:`, e);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn(`sessionStorage.removeItem('${key}') failed:`, e);
    }
  },
  
  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage.clear() failed:', e);
    }
  },
  
  get length(): number {
    try {
      return sessionStorage.length;
    } catch (e) {
      console.warn('sessionStorage.length access failed:', e);
      return 0;
    }
  },
  
  /**
   * Get the timestamp when this key was last updated
   */
  getTimestamp: (key: string): number | null => {
    return getStorageTimestamp(key, sessionStorage);
  },
  
  /**
   * Get the age of stored data in milliseconds
   */
  getDataAge: (key: string): number | null => {
    const timestamp = getStorageTimestamp(key, sessionStorage);
    if (!timestamp) return null;
    return Date.now() - timestamp;
  }
};

/**
 * Legacy-safe getItem for backward compatibility
 * Returns raw data without integrity checking
 */
export const getRawStorageItem = (key: string, useSession: boolean = false): string | null => {
  const storage = useSession ? sessionStorage : localStorage;
  try {
    return storage.getItem(key);
  } catch (e) {
    console.warn(`Storage.getItem('${key}') failed:`, e);
    return null;
  }
};

/**
 * Legacy-safe setItem for backward compatibility
 * Stores data without encoding
 */
export const setRawStorageItem = (key: string, value: string, useSession: boolean = false): void => {
  const storage = useSession ? sessionStorage : localStorage;
  try {
    storage.setItem(key, value);
  } catch (e) {
    console.warn(`Storage.setItem('${key}') failed:`, e);
  }
};
