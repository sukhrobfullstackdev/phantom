/* eslint-disable no-param-reassign, import/order */

// Algorithms
import CryptoAES from 'crypto-js/aes';
import CryptoMD5 from 'crypto-js/md5';
import sha256 from 'crypto-js/sha256';

// Encoders
import EncodeUTF8 from 'crypto-js/enc-utf8';

export const HAS_BUILT_IN_CRYPTO = typeof window !== 'undefined' && !!(window.crypto as any);
export const HAS_SUBTLE_CRYPTO = HAS_BUILT_IN_CRYPTO && !!(window.crypto.subtle as any);

export const AES = {
  /**
   * AES encrypts `message` using `secretPassphrase`.
   */
  encrypt(message: string, secretPassphrase: string) {
    const ciphertext = CryptoAES.encrypt(message, secretPassphrase);
    const result = ciphertext.toString();

    // Mark the secret passphrase variable for garbage collection.
    (secretPassphrase as any) = null;

    return result;
  },

  /**
   * AES decrypts `message` using `secretPassphrase`.
   */
  decrypt(message: string, secretPassphrase: string) {
    const bytes = CryptoAES.decrypt(message, secretPassphrase);
    const result = bytes.toString(EncodeUTF8);

    // Mark the secret passphrase variable for garbage collection.
    (secretPassphrase as any) = null;

    return result;
  },
};

export const MD5 = {
  /**
   * Produces a MD5 hash of the given `message`.
   */
  digest(message?: string) {
    const hash = CryptoMD5(message ?? '');
    return hash.toString();
  },
};

export const SHA256 = {
  digest(message?: string) {
    const hash = sha256(message ?? '');
    return hash.toString();
  },
};

/**
 * Creates a cryptographically random string using the browser's built-in
 * `Crypto` API, falling back to `Math.random` if required. The resulting string
 * is URL-safe and within the valid character range for OAuth 2.0 code
 * challenges.
 */
export function createRandomString(size: number) {
  const bytes = new Uint8Array(size);

  if (HAS_BUILT_IN_CRYPTO) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i += 1) bytes[i] = Math.floor(Math.random() * Math.floor(255));
  }

  return bytesToOAuth2CompatibleString(bytes);
}

/**
 * Stringifies `bytes` using the OAuth 2.0 `code_verifier` character set.
 */
function bytesToOAuth2CompatibleString(bytes: Uint8Array) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

  return Array.from(bytes)
    .map((value: number) => charset[value % charset.length])
    .join('');
}
