/* eslint-disable no-param-reassign */

import { memoize } from '~/app/libs/lodash-utils';
import path from 'path';
import chalk from 'chalk';
import { EnabledFeatures } from '~/features/manifest';
import { IS_NODE_ENV_PROD } from '~/shared/constants/env';
import { normalizeSlashes, recursiveReadDir, removeFileExt, removeLeadingSlashes, resolveToRoot } from '../path-utils';
import { getSortedRoutes } from './route-sorting';
import { prettyConsole } from '../pretty-console';
import type { NormalizedRoute, RouteType, SortedRoutes } from './types';

export const pageExtensions = ['.ts', '.tsx'];

/**
 * From the `file` and route `type`, format a routing string accordingly.
 */
function getRoute(file: string, type: RouteType) {
  let route = removeLeadingSlashes(removeFileExt(file));

  if (type !== '_rpc') {
    // Re-format `/foo/[bar]/baz` to `/foo/:bar/baz`
    // so that ExpressJS can understand it.
    route = route.replace(/\[([A-Za-z0-9_-]*)\]/g, ':$1');

    // Re-format `/foo/[...bar]` to `/foo/*`
    // so that ExpressJS can understand it.
    route = route.replace(/\[\.\.\.([A-Za-z0-9_-]*)\]/g, '*');

    // Add a single leading slash to the route
    route = `/${route}`;
  }

  // Normalize index routes
  route = route.replace(/\/index$/, '');

  return route;
}

/**
 * Create a list of routes to module path pairings.
 */
export const createRouteToModulePathPairings = memoize(
  async (featureName: string, type: RouteType) => {
    const pathContext = `./features/${featureName}/${type}`;

    const r = (await recursiveReadDir(resolveToRoot(pathContext)))
      .filter(file => file.includes(type) && pageExtensions.includes(path.parse(file).ext))
      .map(file => {
        file = removeLeadingSlashes(normalizeSlashes(file).replace(pathContext, ''));
        const route = getRoute(file, type);
        return [route, file];
      });

    return r;
  },

  (featureName, type) => `${featureName}:${type}`,
);

/**
 * Create a mapping of routes to module paths.
 */
export const createRouteToModulePathMapping = memoize(
  async (featureName: string, type: RouteType) => {
    return Object.fromEntries(await createRouteToModulePathPairings(featureName, type));
  },

  (featureName, type) => `${featureName}:${type}`,
);

/**
 * Get a listing of all feature-based routes of the given `type`.
 */
export const getAllServerSideRoutes = memoize(async () => {
  try {
    // The end result only includes `_api` and `_pages` routes, but we get
    // `_rpc` routes, too, so that we can perform basic validations and
    // de-duping.
    const routeTypes: RouteType[] = ['_api', '_rpc', '_pages'];

    // Get a deeply nested array of route configurations.
    const routes = await Promise.all(
      routeTypes.map(routeType => {
        return Promise.all(
          EnabledFeatures.map(async featureName => {
            return (await createRouteToModulePathPairings(featureName, routeType)).map(([r, modulePath]) => ({
              featureName,
              routeType,
              modulePath,
              path: r,
            }));
          }),
        );
      }),
    );

    // Flatten into a `NormalizedRoute[]`
    const normalizedRoutes: NormalizedRoute[] = routes.flat(Infinity) as any;

    // Sort & validate routes
    return getSortedRoutes(normalizedRoutes);
  } catch (e) {
    if (IS_NODE_ENV_PROD) {
      throw e;
    }

    // In development, we swallow the error so as to not interrupt the dev server.
    return { _api: [], _pages: [], _rpc: [], allSorted: [] } as SortedRoutes;
  }
});

/**
 * Prints all routes (_pages, _api, & _rpc) derived from `input` to the console.
 */
export function printRoutes(input: SortedRoutes) {
  const doPrint = (groupName: string, sortedRoutes: NormalizedRoute[]) => {
    const longestFeatureName = Math.max(...sortedRoutes.map(r => r.featureName.length));

    prettyConsole.spacer();
    prettyConsole.logWithLabel(
      groupName,
      sortedRoutes
        .sort((left, right) => {
          // Re-sort alphebetically by featureName
          if (left.featureName < right.featureName) return -1;
          if (left.featureName > right.featureName) return 1;
          return 0;
        })
        .reduce((prev, curr, i) => {
          const prefix = i === 0 ? prev : `${prev}\n`;
          const spacer = ' '.repeat(longestFeatureName - curr.featureName.length + 1);
          return chalk`${prefix}${spacer} {cyan ${curr.featureName}} {gray.dim ❯} {cyan.bold ${curr.path}}`;
        }, '') || '  None.',
    );
    prettyConsole.spacer();
  };

  doPrint('API Routes', input._api);
  doPrint('Page Routes', input._pages);
  doPrint('RPC Routes', input._rpc);
}

/**
 * Return a filtered array from `sources` with only
 * paths that have valid page extensions.
 */
export function filterValidPages(sources: string[]) {
  return sources.filter(file => pageExtensions.includes(path.parse(file).ext));
}
