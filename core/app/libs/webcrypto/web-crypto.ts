import { data } from '~/app/services/web-storage/data-api';
import { decodeBase64URL } from '~/app/libs/base64';
import { globalCache } from '~/shared/libs/cache';

export const RELAYER_STORE_KEY_PRIVATE_KEY = 'RELAYER_STORE_KEY_PRIVATE_KEY';
export const RELAYER_STORE_KEY_PUBLIC_JWK = 'RELAYER_STORE_KEY_PUBLIC_JWK';
export const RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC = 'RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC';
export const RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE = 'RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE';
const ALGO_NAME = 'ECDSA';
const ALGO_CURVE = 'P-256';

export const signatureSHA256Type = { name: ALGO_NAME, hash: { name: 'SHA-256' } };

const EC_GEN_PARAMS: EcKeyGenParams = {
  name: ALGO_NAME,
  namedCurve: ALGO_CURVE,
};

export function clearKeys() {
  data.removeItem(RELAYER_STORE_KEY_PUBLIC_JWK);
  data.removeItem(RELAYER_STORE_KEY_PRIVATE_KEY);
}

export function isWebCryptoSupported() {
  const hasCrypto = typeof window !== 'undefined' && !!(window.crypto as never);
  const hasSubtleCrypto = hasCrypto && !!(window.crypto.subtle as never);

  return hasCrypto && hasSubtleCrypto;
}

export async function generateWCKP() {
  const { subtle } = window.crypto;
  const kp = await subtle.generateKey(
    EC_GEN_PARAMS,
    false, // need to export the public key which means private exports too
    ['sign', 'verify'],
  );

  // export keys so we can send the public key.
  const jwkPublicKey = await subtle.exportKey('jwk', kp.publicKey);

  // cache the keypair in case error storing with localForage
  await globalCache.get('kp', async () => kp, 1000 * 60 * 10); // cache for 10 minutes

  // persist keys
  await data.setItem(RELAYER_STORE_KEY_PRIVATE_KEY, kp.privateKey);
  // persist the jwk public key since it needs to be exported anyways
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_JWK, jwkPublicKey);
}

export function uint8ToUrlBase64(uint8: Uint8Array) {
  let bin = '';
  uint8.forEach(code => {
    bin += String.fromCharCode(code);
  });
  return binToUrlBase64(bin);
}

function binToUrlBase64(bin: string) {
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
}

export function base64ToUint8(base64: string) {
  const binaryString = decodeBase64URL(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateUAKP() {
  const { subtle } = window.crypto;
  const kp = await subtle.generateKey(EC_GEN_PARAMS, false, ['sign', 'verify']);

  // persist keys
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_UA_PRIVATE, kp.privateKey);
  // persist the jwk public key since it needs to be exported anyways
  await data.setItem(RELAYER_STORE_KEY_PUBLIC_UA_PUBLIC, kp.publicKey);

  return kp;
}

export function isJWKValid(key: object): boolean {
  return Object.hasOwn(key, 'x') && Object.hasOwn(key, 'y') && Object.hasOwn(key, 'crv') && Object.hasOwn(key, 'kty');
}
