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
 * Decode a Base64 string.
 *
 * base64 -> utf8
 */
export function decodeBase64(data: string): string {
  return Buffer.from(data, 'base64').toString('utf8');
}

/**
 * Decode a URL-safe Base64 string.
 *
 * base64URL -> utf8
 */
export function decodeBase64URL(data: string): string {
  if (isEncodedURIComponent(data)) {
    return Buffer.from(decodeURIComponent(data), 'base64').toString('utf8');
  }

  return Buffer.from(fromBase64URL(data), 'base64').toString('utf8');
}

/**
 * Encode a Base64 string.
 *
 * utf8 -> base64
 */
export function encodeBase64(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64');
}

/**
 * Encode a URL-safe Base64 string.
 *
 * utf8 -> base64URL
 */
export function encodeBase64URL(data: string): string {
  return toBase64URL(Buffer.from(data, 'utf8').toString('base64'));
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
