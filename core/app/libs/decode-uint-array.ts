import { decodeBase64URL } from './base64';

export function base64BinaryToUint8Array(base64Binary = '') {
  const binaryString = decodeBase64URL(base64Binary);
  const charData = binaryString.split('').map(x => x.charCodeAt(0));
  const bytes = new Uint8Array(charData);

  return bytes;
}

export function uint8ArrayToString(data: Uint8Array) {
  return String.fromCharCode(...data);
}

export function uint8ArrayToBase64(data: Uint8Array) {
  return btoa(uint8ArrayToString(data));
}
