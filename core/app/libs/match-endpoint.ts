import { uniq, isEmpty, map, flatten } from '~/app/libs/lodash-utils';

import { matchPath } from 'react-router-dom';
import { Endpoint } from '~/server/routes/endpoint';
import { ensureArray } from '~/shared/libs/array-helpers';
import { manifest } from '../constants/feature-manifest';

/**
 * Returns `true` if the given `endpoint` matches with the current value of
 * `window.location.pathname`.
 */
export function matchEndpoint(endpoint: Endpoint): boolean;
/**
 * Returns `true` if the _any_ of the given `endpoint` values matches with the
 * current value of `window.location.pathname`.
 */
export function matchEndpoint(endpoint: Endpoint[]): boolean;
/**
 * Returns `true` if the given `path` matches with _any_ of the given
 * `endpoint` values.
 */
export function matchEndpoint(path: string, endpoint: Endpoint): boolean;
/**
 * Returns `true` if the given `path` matches with the given `endpoint`.
 */
export function matchEndpoint(path: string, endpoint: Endpoint[]): boolean;
export function matchEndpoint(...args: any[]): boolean {
  const path = isEmpty(args[1]) ? window.location.pathname : args[0];
  const endpoint = isEmpty(args[1]) ? args[0] : args[1];
  return !!ensureArray(endpoint).find(item => matchPath(path, { exact: true, path: item }));
}

const allEndpoints = uniq(
  flatten([
    ...map(Object.values(Endpoint), i => Object.values(i)),
    ...map(Object.values(manifest.features), i => Object.keys(i.pages)),
  ]),
);

/**
 * Returns the current endpoint (as parsed from `window.location.pathname`).
 */
export function currentEndpoint(): string | '*' {
  const path = window.location.pathname;
  const match = allEndpoints.find(item => matchPath(path, { exact: true, path: item }));
  return match ?? '*';
}
