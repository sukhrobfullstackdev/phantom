import qs from 'qs';
import { memoize } from '~/app/libs/lodash-utils';
import { inflateString } from '../compression';
import { decodeBase64 } from '../base64';

// --- Query parsing helpers

/**
 * Get the parsed URL query as a plain JS object.
 */
export const getParsedQueryParams = memoize(
  <T = Record<string, any>>(queryString?: string): Partial<T> => {
    const queryStringNormalized =
      queryString?.startsWith('?') || queryString?.startsWith('#')
        ? queryString.substr(1)
        : (queryString || window.location?.search.substr(1)) ?? '';

    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
    if (queryStringNormalized) return qs.parse(queryStringNormalized) as unknown as Partial<T>;
    return {};
  },

  queryString => queryString || window.location?.search,
);

/**
 * Memoize the string arguments given to `getRawOptions` and `getParsedOptions`
 * based on `key` + `queryString`.
 */
/* istanbul ignore next */
const memoizeResolver = (key?: string, queryString?: string) => `${key}:${queryString || window.location?.search}`;

/**
 * Get Base64-encoded options from the URL query at `key` (default: 'params').
 *
 * NOTE:
 * Endpoint options are supplied as Base64-encoded JSON strings attached to the
 * `?{key}=` of the URL query.
 */
export const getRawOptions = memoize(
  (key = 'params', queryString?: string): string => {
    const defaultResult = 'e30'; // "e30" is "{}" in base64 encoding
    const query = getParsedQueryParams<any>(queryString);
    return query[key] ?? defaultResult;
  },

  memoizeResolver,
);

/**
 * Get the parsed options object from the URL query at `key`. This function
 * expects the contents of `key` is a Base64-encoded string. If those contents
 * are compressed (gzipped), they will be decompressed before parsing.
 */
export const getDecodedOptionsFromQueryParams = memoize(
  <T = Record<string, any>>(key = 'params', queryString?: string): Partial<T> => {
    const rawOptions = getRawOptions(key, queryString);

    // First, we try to decompress the rawOptions...
    try {
      return JSON.parse(inflateString(rawOptions));
    } catch {}

    // Reaching this code path means `rawOptions`
    // is probably just encoded JSON...
    try {
      // We use `decode` instead of `decodeURL` because `qs.parse` will have
      // already decoded the URI components for us.
      return JSON.parse(decodeBase64(rawOptions));
    } catch {
      // If we reach another error, then the query string is missing or malformed.
      // We simply return an empty object in that case.
      return {};
    }
  },

  memoizeResolver,
);
