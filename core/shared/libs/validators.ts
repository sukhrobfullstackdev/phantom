import Color from 'color';
import { isString, isNil } from '~/app/libs/lodash-utils';

export function isValidColor(value?: string | null) {
  if (!value) return false;

  try {
    Color(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns `true` if the given `source` is an email address, `false` otherwise.
 */
export function isValidEmail(source?: string | null) {
  if (!source) return false;

  const emailRegex =
    // eslint-disable-next-line no-useless-escape
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(source);
}

/**
 * Returns `true` if `value` is a valid URL string, `false` otherwise.
 */
export function isValidURL(value?: string | URL | null) {
  if (!value) return false;
  if (value instanceof URL) return true;

  try {
    /* eslint-disable-next-line no-new */
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * If `value` is a `string`, attempts to parse as JSON. If `value` is a plain
 * object, attempts to serialize as JSON, then parse. If parsing fails at any
 * step, returns `false`.
 */
export function isValidJSON(value: any) {
  try {
    if (isNil(value)) return false;

    let result;
    if (isString(value)) result = JSON.parse(value);
    else result = JSON.parse(JSON.stringify(value));

    if (isNil(result)) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Returns `true` if the given `value` is a valid IP address (IPv4 or IPv6), `false` otherwise.
 * This function now accepts a full URL and extracts the hostname for IP address validation.
 */
export function isValidIPAddress(value?: string | null) {
  if (!value) return false;

  let hostname = value;
  if (value.includes('://')) {
    try {
      const url = new URL(value);
      hostname = url.hostname;
    } catch (error) {
      // If URL parsing fails, assume it's not a valid IP
      return false;
    }
  }

  // Regular expression to match IP addresses (both IPv4 and IPv6)
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$|^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$/;
  return ipRegex.test(hostname);
}
