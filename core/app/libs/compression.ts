import { inflate } from 'pako';
import { base64BinaryToUint8Array } from './decode-uint-array';

/**
 * Given a Base64-encoded string of compressed binary data, decode and
 * decompress the data.
 */
export function inflateString(base64Binary: string): string {
  const bytes = base64BinaryToUint8Array(base64Binary);

  try {
    return inflate(bytes, { to: 'string' });
  } catch (e) {
    // Pako does not wrap error messages in `Error` objects for some reason.
    throw new Error(e);
  }
}
