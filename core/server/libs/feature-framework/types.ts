import type { FeatureName } from '~/features/manifest';

/**
 * We perform routing for three separate use-cases:
 *
 *   - Server-side API endpoints
 *   - Client-side pages
 *   - Client-side RPC endpoints
 *
 * Each requires some alterations to the behavior of `createRouteMapping`.
 */
export type RouteType = '_api' | '_rpc' | '_pages';

export interface NormalizedRoute {
  featureName: FeatureName;
  routeType: RouteType;
  modulePath: string;
  path: string;
}

export type SortedRoutes = Record<RouteType | 'allSorted', NormalizedRoute[]>;
