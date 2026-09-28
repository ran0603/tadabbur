export interface KdfParams {
  algorithm: 'PBKDF2';
  hash: 'SHA-256';
  iterations: number;
}

export interface KeyWrapMetadata {
  version: number;
  keyId: string;
  wrappedDek: Uint8Array;
  recoveryWrappedDek: Uint8Array;
  salt: Uint8Array;
  iv: Uint8Array;
  recoverySalt: Uint8Array;
  recoveryIv: Uint8Array;
  kdfParams: KdfParams;
}

// Crockford-style Base32 characters excluding confusing characters (0, 1, I, O)
const BASE32_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generates a formatted 24-character 120-bit entropy recovery key
 * Example format: "A2B3-C4D5-E6F7-G8H9-J1K2-M3N4"
 */
export function generateRecoveryKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    const val = bytes[i]! % BASE32_ALPHABET.length;
    str += BASE32_ALPHABET[val];
  }
  // Format into 6 groups of 4 characters
  const groups: string[] = [];
  for (let i = 0; i < str.length; i += 4) {
    groups.push(str.slice(i, i + 4));
  }
  return groups.join('-');
}

/**
 * Normalizes user-entered recovery key by removing whitespace, hyphens, and uppercase conversion
 */
export function normalizeRecoveryKey(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, '');
}

/**
 * Derives a KEK (Key Encryption Key) using PBKDF2 (SHA-256)
 */
export async function deriveKEK(
  secret: string,
  salt: Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Imports 32 raw DEK bytes into a WebCrypto AES-GCM CryptoKey
 */
export async function importRawDEK(rawDek: Uint8Array): Promise<CryptoKey> {
  if (rawDek.length !== 32) {
    throw new Error(`Invalid DEK length: expected 32 bytes, got ${rawDek.length}`);
  }
  return crypto.subtle.importKey(
    'raw',
    rawDek as any,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Creates wrapped DEK metadata using passphrase and recovery key
 */
export async function createKeyWrap(
  rawDek: Uint8Array,
  passphrase: string,
  recoveryKey: string,
  keyId = 'user-key-v1'
): Promise<KeyWrapMetadata> {
  if (!passphrase || passphrase.trim().length < 6) {
    throw new Error('Passphrase must be at least 6 characters long');
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 100000;

  const kek = await deriveKEK(passphrase, salt, iterations);

  const encryptedDekBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    kek,
    rawDek as any
  );

  const normalizedRecKey = normalizeRecoveryKey(recoveryKey);
  const recoverySalt = crypto.getRandomValues(new Uint8Array(16));
  const recoveryIv = crypto.getRandomValues(new Uint8Array(12));

  const recoveryKek = await deriveKEK(normalizedRecKey, recoverySalt, iterations);

  const encryptedRecDekBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: recoveryIv as any },
    recoveryKek,
    rawDek as any
  );

  return {
    version: 1,
    keyId,
    wrappedDek: new Uint8Array(encryptedDekBuffer),
    recoveryWrappedDek: new Uint8Array(encryptedRecDekBuffer),
    salt,
    iv,
    recoverySalt,
    recoveryIv,
    kdfParams: {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations,
    },
  };
}

/**
 * Unwraps DEK using the passphrase
 */
export async function unwrapDEKWithPassphrase(
  keyWrap: KeyWrapMetadata,
  passphrase: string
): Promise<CryptoKey> {
  try {
    const kek = await deriveKEK(
      passphrase,
      keyWrap.salt,
      keyWrap.kdfParams.iterations
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: keyWrap.iv as any },
      kek,
      keyWrap.wrappedDek as any
    );

    return importRawDEK(new Uint8Array(decryptedBuffer));
  } catch (err) {
    throw new Error("This entry can't be opened on this device (invalid passphrase or key corruption).");
  }
}

/**
 * Unwraps DEK using the recovery key
 */
export async function unwrapDEKWithRecoveryKey(
  keyWrap: KeyWrapMetadata,
  recoveryKey: string
): Promise<CryptoKey> {
  try {
    const normalizedRecKey = normalizeRecoveryKey(recoveryKey);
    const kek = await deriveKEK(
      normalizedRecKey,
      keyWrap.recoverySalt,
      keyWrap.kdfParams.iterations
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: keyWrap.recoveryIv as any },
      kek,
      keyWrap.recoveryWrappedDek as any
    );

    return importRawDEK(new Uint8Array(decryptedBuffer));
  } catch (err) {
    throw new Error("This entry can't be opened on this device (invalid recovery key or key corruption).");
  }
}
