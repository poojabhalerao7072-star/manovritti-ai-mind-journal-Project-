/**
 * Web Crypto API AES-GCM 256-bit Client-Side Encryption
 * Provides zero-knowledge privacy: data is encrypted in the browser before reaching Firestore.
 */

const ALGORITHM_NAME = 'AES-GCM';
const KEY_LENGTH = 256;

// Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a new random AES-GCM 256-bit key
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM_NAME,
      length: KEY_LENGTH,
    },
    true, // extractable for local backup/export
    ['encrypt', 'decrypt']
  );
}

/**
 * Export CryptoKey to Base64 string for local persistence or backup
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import Base64 string back to CryptoKey
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const rawKey = base64ToUint8Array(base64Key);
  return await window.crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: ALGORITHM_NAME,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive a deterministic encryption key from User ID + user custom passphrase (or device salt)
 */
export async function deriveKeyFromSecret(secret: string, salt: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM_NAME, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Compute key fingerprint (short SHA-256 hash) for UI display
 */
export async function getKeyFingerprint(key: CryptoKey): Promise<string> {
  try {
    const raw = await window.crypto.subtle.exportKey('raw', key);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', raw);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
  } catch (err) {
    console.error('Error computing fingerprint:', err);
    return 'AES-GCM-256';
  }
}

/**
 * Encrypt plain text using AES-GCM (generates fresh 12-byte IV for every write)
 */
export async function encryptText(
  plainText: string,
  key: CryptoKey
): Promise<{ cipherText: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  // AES-GCM standard initialization vector is 12 bytes (96 bits)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv,
    },
    key,
    data
  );

  return {
    cipherText: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt cipher text using AES-GCM and the corresponding IV
 */
export async function decryptText(
  cipherText: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  try {
    const data = base64ToUint8Array(cipherText);
    const iv = base64ToUint8Array(ivBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM_NAME,
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption failed - Invalid key or corrupted payload]';
  }
}

/**
 * Local Storage Key Manager for the active user
 */
const STORAGE_PREFIX = 'manovritti_enc_key_';

export async function getOrCreateUserKey(userId: string): Promise<CryptoKey> {
  const storageKey = `${STORAGE_PREFIX}${userId}`;
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    try {
      return await importKeyFromBase64(stored);
    } catch (e) {
      console.warn('Could not import stored key, creating fresh key', e);
    }
  }

  // Generate a fresh key and store locally in user's browser sandbox
  const newKey = await generateMasterKey();
  const exported = await exportKeyToBase64(newKey);
  localStorage.setItem(storageKey, exported);
  return newKey;
}

export async function storeUserKey(userId: string, key: CryptoKey): Promise<void> {
  const storageKey = `${STORAGE_PREFIX}${userId}`;
  const exported = await exportKeyToBase64(key);
  localStorage.setItem(storageKey, exported);
}
