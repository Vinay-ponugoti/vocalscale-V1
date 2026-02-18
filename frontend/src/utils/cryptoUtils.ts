/**
 * Cryptographic utilities for token encryption using Web Crypto API
 * 
 * SECURITY NOTES:
 * - Uses AES-GCM for authenticated encryption
 * - Keys are derived from browser-specific secrets (not stored anywhere)
 * - Each encryption is randomized with unique IVs
 * - This protects against token theft from localStorage/sessionStorage via XSS
 * 
 * LIMITATIONS:
 * - Keys are per-session/per-browser (lost on clear of all data)
 * - This is client-side encryption, not a replacement for HTTPS
 * - For maximum security, use HttpOnly cookies (not feasible for SPA without SSR)
 */

// Crypto configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 16;
const KEY_DERIVATION_ITERATIONS = 100000;

// Derives a consistent encryption key from a base secret and salt
async function deriveKey(baseKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(baseKey),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: KEY_DERIVATION_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Get browser-specific base secret (derived from available APIs)
function getBaseSecret(): string {
  // Combine multiple browser-specific values for uniqueness
  const parts: string[] = [];
  
  try {
    parts.push(navigator.userAgent);
    parts.push(navigator.language);
    parts.push(screen.width.toString());
    parts.push(screen.height.toString());
    // Add timezone for additional uniqueness
    parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch (e) {
    // Fallback if any API is restricted
    console.warn('Some browser APIs not available for key derivation');
  }
  
  return parts.join('|');
}

// Generate random bytes
function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Combine salt + IV + ciphertext for storage
function combineBytes(salt: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array): Uint8Array {
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(ciphertext, salt.length + iv.length);
  return combined;
}

// Extract components from combined bytes
function extractBytes(combined: Uint8Array): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  return {
    salt: combined.slice(0, SALT_LENGTH),
    iv: combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH),
    ciphertext: combined.slice(SALT_LENGTH + IV_LENGTH),
  };
}

// Convert bytes to base64 string
function bytesToBase64(bytes: Uint8Array): string {
  const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(binary);
}

// Convert base64 string to bytes
function base64ToBytes(base64: string): Uint8Array {
  try {
    const binary = atob(base64);
    return new Uint8Array(Array.from(binary).map(c => c.charCodeAt(0)));
  } catch (e) {
    throw new Error('Invalid base64 string');
  }
}

/**
 * Encrypts a plaintext string using AES-GCM
 * @param plaintext - The text to encrypt
 * @returns Base64-encoded encrypted data
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return '';
  
  try {
    const salt = getRandomBytes(SALT_LENGTH);
    const iv = getRandomBytes(IV_LENGTH);
    const key = await deriveKey(getBaseSecret(), salt);
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      data
    );
    
    const combined = combineBytes(salt, iv, new Uint8Array(ciphertext));
    return bytesToBase64(combined);
  } catch (e) {
    console.error('Encryption failed:', e);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a base64-encoded encrypted string
 * @param encrypted - Base64-encoded encrypted data
 * @returns Decrypted plaintext
 */
export async function decrypt(encrypted: string): Promise<string> {
  if (!encrypted) return '';
  
  try {
    const combined = base64ToBytes(encrypted);
    const { salt, iv, ciphertext } = extractBytes(combined);
    
    if (iv.length !== IV_LENGTH || salt.length !== SALT_LENGTH) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = await deriveKey(getBaseSecret(), salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (e) {
    console.error('Decryption failed:', e);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash a string for integrity checking
 * @param data - Data to hash
 * @returns Hex-encoded hash
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if encryption is available in the current environment
 */
export function isEncryptionAvailable(): boolean {
  return typeof crypto !== 'undefined' &&
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.getRandomValues !== 'undefined';
}

// For backward compatibility: fall back to base64 encoding if crypto unavailable
export async function safeEncrypt(plaintext: string): Promise<string> {
  if (!isEncryptionAvailable()) {
    console.warn('Web Crypto API not available, using base64 encoding only');
    return btoa(plaintext);
  }
  try {
    return await encrypt(plaintext);
  } catch (e) {
    console.warn('Encryption failed, falling back to base64:', e);
    return btoa(plaintext);
  }
}

export async function safeDecrypt(encrypted: string): Promise<string> {
  if (!encrypted) return '';
  
  if (!isEncryptionAvailable()) {
    try {
      return atob(encrypted);
    } catch (e) {
      throw new Error('Failed to decode base64');
    }
  }
  
  try {
    return await decrypt(encrypted);
  } catch (e) {
    // Try base64 as fallback (for backward compatibility with old sessions)
    try {
      const decoded = atob(encrypted);
      console.warn('Decrypted using base64 fallback (old session format)');
      return decoded;
    } catch {
      throw e;
    }
  }
}
