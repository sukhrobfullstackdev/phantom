/**
 * The utilities in this module are inspired by &
 * modified from NextJS to meet our use-case.
 *
 * @see https://github.com/vercel/next.js/blob/c1b2b3f91fd8b858e76353a631c7890a95db6875/packages/next/next-server/lib/router/utils/sorted-routes.ts#L198
 */

import chalk from 'chalk';
import { prettyConsole } from '../pretty-console';
import { removeLeadingSlashes, removeTrailingSlashes } from '../path-utils';
import type { NormalizedRoute, RouteType, SortedRoutes } from './types';

interface UrlNodeInsertOptions {
  routeType: RouteType;
  featureName: string;
  modulePath: string;
  paths: string[];
  pathPrefix?: string;
}

class UrlNode {
  private children: Map<string, UrlNode> = new Map();
  private featureName: string | null = null;
  private modulePath: string | null = null;
  private pathPrefix: string | null = null;
  private routeType: RouteType | null = null;

  public smoosh(prefix: string | NormalizedRoute = '/'): NormalizedRoute[] {
    const childrenPaths = [...this.children.keys()].sort((left, right) => {
      // Sort catch-all routes last
      const leftIsCatchAll = left === '*';
      const rightIsCatchAll = right === '*';
      if (leftIsCatchAll || rightIsCatchAll) {
        if (!leftIsCatchAll && rightIsCatchAll) return -1;
        if (leftIsCatchAll && !rightIsCatchAll) return 1;
        return 0;
      }

      // Sort dynamic routes second-last
      const leftIsDynamic = left.startsWith(':');
      const rightIsDynamic = right.startsWith(':');
      if (leftIsDynamic || rightIsDynamic) {
        if (!leftIsDynamic && rightIsDynamic) return -1;
        if (leftIsDynamic && !rightIsDynamic) return 1;
        return 0;
      }

      // Sort alphebetically
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    });

    const routes = childrenPaths
      .map(c => {
        const child = this.children.get(c)!;

        const prefixedPath = typeof prefix === 'string' ? `${prefix}${c}/` : `${prefix?.path}${c}/`;

        const result: NormalizedRoute[] = [];

        if (child.children.size) {
          result.push(...child.smoosh(prefixedPath));
        }

        if (child.routeType) {
          result.push({
            featureName: child.featureName,
            routeType: child.routeType,
            modulePath: child.modulePath,
            path: removeTrailingSlashes(child.routeType === '_rpc' ? removeLeadingSlashes(prefixedPath) : prefixedPath),
          } as NormalizedRoute);
        }

        return result;
      })
      .reduce((prev, curr) => [...prev, ...curr], []);

    return routes;
  }

  public insert(options: UrlNodeInsertOptions, slugNames: string[] = []) {
    this.pathPrefix = options.pathPrefix ?? '';

    if (!options.paths.length) {
      this.featureName = options.featureName;
      this.modulePath = options.modulePath;
      this.routeType = options.routeType;
      return;
    }

    // The next segment in the urlPaths list
    const nextSegment = options.paths[0];
    const isCatchAll = nextSegment === '*';

    // Check if the segment matches `:something`
    if (nextSegment.startsWith(':') || (isCatchAll && options.paths.length > 1)) {
      // Strip `:`, leaving only `something`
      const segmentName = isCatchAll ? nextSegment : nextSegment.slice(1);
      this._handleSlug(options, segmentName, slugNames);
    }

    // If this UrlNode doesn't have the nextSegment yet, we create a new child UrlNode
    if (!this.children.has(nextSegment)) {
      this.children.set(nextSegment, new UrlNode());
    }

    this.children.get(nextSegment)!.insert(
      {
        featureName: options.featureName,
        modulePath: options.modulePath,
        routeType: options.routeType,
        pathPrefix: `${this.pathPrefix}/${options.paths[0]}`,
        paths: options.paths.slice(1),
      },

      slugNames,
    );
  }

  private _handleSlug(options: UrlNodeInsertOptions, nextSlugName: string, slugNames: string[]) {
    const { featureName, routeType, modulePath } = options;

    slugNames.forEach(slug => {
      if (slug === nextSlugName) {
        prettyConsole.spacer();
        prettyConsole.error(
          'You cannot have the same slug name repeat within a single dynamic path:',
          chalk`\n\n  {cyan ${featureName}} {gray.dim ❯} {gray ${routeType}} {gray.dim ❯} {cyan ${this.pathPrefix?.replace(
            nextSlugName,
            chalk`{cyan.bold ${nextSlugName}}`,
          )}/}{cyan.bold :${nextSlugName}}`,
        );
        prettyConsole.spacer();
        bailout();
      }
    });
    slugNames.push(nextSlugName);

    if (nextSlugName === '*') {
      prettyConsole.spacer();
      prettyConsole.error(
        'A catch-all route must be the last part of the URL.',
        chalk`\n\n  {cyan ${featureName}} {gray.dim ❯} {gray ${routeType}} {gray.dim ❯} {cyan ${this.pathPrefix}/}{cyan.bold *} {cyan.dim (${modulePath})}`,
      );
      prettyConsole.spacer();
      bailout();
    }
  }
}

/**
 * A generic error message we raise when sorting has failed. Generally, we catch
 * this and ignore the error, but in production we want to fail the build if
 * feature framework routes cannot be validated.
 */
function bailout() {
  throw new Error('Failed to sort feature framework routes. Please see logs above for more information.');
}

/**
 * Detects and reports exact duplicate and/or
 * conflicting routes found in `normalizedPages`.
 */
function detectDuplicates(normalizedPages: NormalizedRoute[]) {
  // We save paths visited by the sorter to check for duplicates at the end.
  const visitedPaths = new Map<string, NormalizedRoute[]>();

  for (const page of normalizedPages) {
    // RPC routes don't have dynamic slugs...
    const pathWithoutDynamicSlugs =
      page.routeType === '_rpc' ? page.path : page.path.replace(/:([A-Za-z0-9_]*)/g, '[slug]');

    if (!visitedPaths.has(pathWithoutDynamicSlugs)) {
      visitedPaths.set(pathWithoutDynamicSlugs, [page]);
    } else {
      visitedPaths.get(pathWithoutDynamicSlugs)?.push(page);
    }
  }

  let duplicates = '';

  // Print an error message for duplicate paths we noticed across features.
  for (const pages of visitedPaths.values()) {
    if (pages.length > 1) {
      duplicates += chalk`\n\n  ${pages
        .map(p => {
          return chalk`{cyan ${p.featureName}} {gray.dim ❯} {gray ${p.routeType}} {gray.dim ❯} {cyan.bold ${p.path}} {cyan.dim (${p.modulePath})}`;
        })
        .join('\n  ')}`;
    }
  }

  if (duplicates) {
    prettyConsole.spacer();
    prettyConsole.error('Duplicate or conflicting routes detected:', duplicates);
    prettyConsole.spacer();
    bailout();
  }
}

/**
 * Sorts & validates the given `normalizedRoutes`.
 */
export function getSortedRoutes(normalizedRoutes: NormalizedRoute[]): SortedRoutes {
  detectDuplicates(normalizedRoutes);

  // We need to separate out RPC routes from the rest so that we can maintain an
  // RPC method name that matches a page or API path; these will never conflict
  // so it's okay to do this.
  const pageAndAPIOnlyNormalizedRoutes = normalizedRoutes.filter(p => p.routeType !== '_rpc');
  const rpcOnlyNormalizedRoutes = normalizedRoutes
    .filter(p => p.routeType === '_rpc')
    // eslint-disable-next-line no-nested-ternary
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  // Here the `root` gets injected with multiple paths,
  // and `insert` will break them up into sublevels...
  const root = new UrlNode();
  for (const page of pageAndAPIOnlyNormalizedRoutes) {
    root.insert({
      featureName: page.featureName,
      routeType: page.routeType,
      modulePath: page.modulePath,
      paths: page.path.split('/').filter(Boolean),
    });
  }

  // `smoosh` will then sort those sublevels up to
  // the point where you get the correct route
  // definition priority...
  const sorted = [...root.smoosh(), ...rpcOnlyNormalizedRoutes];

  return sorted.reduce(
    (prev, curr) => {
      const { featureName, routeType, modulePath, path } = curr;

      return {
        ...prev,
        [routeType]: [...prev[routeType], { routeType, featureName, modulePath, path }],
      };
    },
    { _api: [], _pages: [], _rpc: [], allSorted: sorted } as SortedRoutes,
  );
}
