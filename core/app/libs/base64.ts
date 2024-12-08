function percentToByte(p: string) {
  return String.fromCharCode(parseInt(p.slice(1), 16));
}

function byteToPercent(b: string) {
  return `%${`00${b.charCodeAt(0).toString(16)}`.slice(-2)}`;
}

/**
 * Encodes a URI-safe Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * utf8 -> base64
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function btoaUTF8(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, percentToByte));
}

/**
 * Decodes a URI-safe Base64 string. Safe for UTF-8 characters.
 * Original source is from the `universal-base64` NPM package.
 *
 * base64 -> utf8
 *
 * @source https://github.com/blakeembrey/universal-base64/blob/master/src/browser.ts
 */
function atobUTF8(str: string): string {
  try {
    return decodeURIComponent(Array.from(atob(str), byteToPercent).join(''));
  } catch {
    // If there happens to be an invalid URI character in the previous
    // operation, we fall back to using vanilla `atob`.
    try {
      return atob(str);
    } catch (error) {
      // Last ditch effort to convert URL-safe Base64 to standard Base64.
      return atob(str.replace(/_/g, '/').replace(/-/g, '+'));
    }
  }
}

/**
 * Determines if the given `data` was encoded using `encodeURIComponent`.
 */
function isEncodedURIComponent(data: string) {
  return decodeURIComponent(data) !== data;
}

/**
 * Transform Base64-encoded data to Base64URL-encoded data.
 *
 * base64 -> base64URL
 */
export function toBase64URL(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Transform Base64URL-encoded data to Base64-encoded data.
 *
 * base64URL -> base64
 */
export function fromBase64URL(base64URL: string) {
  let result = base64URL.replace(/-/g, '+').replace(/_/g, '/');

  // Replace padding characters (`=`)
  if (result.length % 4 !== 0) {
    result += '='.repeat(4 - (result.length % 4));
  }

  return result;
}

/**
 * Decode a Base64 string (alias for `atob`).
 *
 * base64 -> utf8
 */
export function decodeBase64(data: string): string {
  return atobUTF8(data);
}

/**
 * Decode a URL-safe Base64 string.
 *
 * base64URL -> utf8
 */
export function decodeBase64URL(data: string): string {
  if (isEncodedURIComponent(data)) {
    return atobUTF8(decodeURIComponent(data));
  }

  return atobUTF8(fromBase64URL(data));
}

/**
 * Encode a Base64 string (alias for `btoa`).
 *
 * utf8 -> base64
 */
export function encodeBase64(data: string): string {
  return btoaUTF8(data);
}

/**
 * Encode a URL-safe Base64 string.
 *
 * base64 -> base64URL
 */
export function encodeBase64URL(data: string): string {
  return toBase64URL(btoaUTF8(data));
}

export function parseJWT(jwt: string) {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Cannot parse invalid jwt');
  }

  const header = JSON.parse(decodeBase64URL(parts[0]));
  const payload = JSON.parse(decodeBase64URL(parts[1]));
  const sig = parts[2];

  return {
    header,
    payload,
    sig,
  };
}
