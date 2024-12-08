import loadJS from 'loadjs';
import Semaphore from 'semaphore-async-await';
import type { ClientFeatureModuleType, LoadedFeatureModule } from '~/features/framework';
import type { FeatureName } from '~/features/manifest';
import { manifest } from '../constants/feature-manifest';
import { currentEndpoint } from './match-endpoint';

type FeatureModuleIDResolvers = Record<
  ClientFeatureModuleType,
  (featureName: FeatureName, modulePath?: string) => string
>;

const featureModuleIDResolvers: FeatureModuleIDResolvers = {
  RPC: (featureName, modulePath) => {
    const ctx = require.context('~/features', true, /([A-Za-z0-9_-]*)[\\/](_rpc)[\\/]/, 'weak');
    return ctx.resolve(`./${featureName}/_rpc/${modulePath}`);
  },

  Pages: (featureName, modulePath) => {
    const ctx = require.context('~/features', true, /([A-Za-z0-9_-]*)[\\/](_pages)[\\/]/, 'weak');
    return ctx.resolve(`./${featureName}/_pages/${modulePath}`);
  },
};

/**
 * Synchronously loads a feature module from the Webpack require cache. This
 * function anticipates the required scripts are already loaded (either from
 * the initial server-side render or via `loadFeatureAsync`).
 */
function loadFeatureSync(
  featureName: FeatureName,
  moduleType: 'RPC',
  modulePath: string,
): LoadedFeatureModule<'RPC'> | undefined;

function loadFeatureSync(
  featureName: FeatureName,
  moduleType: 'Pages',
  modulePath: string,
): LoadedFeatureModule<'Pages'> | undefined;

function loadFeatureSync(
  featureName: FeatureName,
  moduleType: ClientFeatureModuleType,
  modulePath?: string,
): LoadedFeatureModule<ClientFeatureModuleType> | undefined {
  try {
    const resolveModuleID = featureModuleIDResolvers[moduleType];
    const featureModuleID = resolveModuleID(featureName, modulePath);

    if (__webpack_modules__[featureModuleID]) {
      return __webpack_require__(featureModuleID);
    }
  } catch {}
}

/**
 * If we receive concurrent JSON RPC requests for the same feature, we want to
 * lock the execution context with a semaphore until that feature is loaded. If
 * we emit conucurrent asynchronous feature loads for the same feature, we'll
 * reach an error.
 */
export const asyncFeatureLoaderLocks = new Map<FeatureName, Semaphore>();

/**
 * Asynchronously loads a feature module, first by checking the Webpack require
 * cache, then by loading the required script depdencies if they are missing.
 */
async function loadFeatureAsync(
  featureName: FeatureName,
  moduleType: 'RPC',
  modulePath: string,
): Promise<LoadedFeatureModule<'RPC'>>;

async function loadFeatureAsync(
  featureName: FeatureName,
  moduleType: 'Pages',
  modulePath: string,
): Promise<LoadedFeatureModule<'Pages'>>;

async function loadFeatureAsync(
  featureName: FeatureName,
  moduleType: ClientFeatureModuleType,
  modulePath?: string,
): Promise<LoadedFeatureModule<ClientFeatureModuleType>> {
  if (asyncFeatureLoaderLocks.has(featureName)) {
    await asyncFeatureLoaderLocks.get(featureName)!.acquire();
  } else {
    asyncFeatureLoaderLocks.set(featureName, new Semaphore(0));
  }

  const resolveModuleID = featureModuleIDResolvers[moduleType];
  const featureModuleID = resolveModuleID(featureName, modulePath);

  // Try to restore synchronously from Webpack's require cache.
  if (__webpack_modules__[featureModuleID]) {
    asyncFeatureLoaderLocks.get(featureName)!.signal();
    return __webpack_require__(featureModuleID);
  }

  return new Promise<any>((resolve, reject) => {
    const deps = manifest.features[featureName]?.chunks;

    if (!deps) {
      reject(new Error(`Feature missing or disabled: \`${featureName}\``));
    } else {
      // Otherwise, load the feature's script
      // dependencies, then require via Webpack.
      loadJS(deps, featureName, {
        success: () => {
          asyncFeatureLoaderLocks.get(featureName)!.signal();
          resolve(__webpack_require__(featureModuleID));
        },

        error: (...args) => {
          asyncFeatureLoaderLocks.get(featureName)!.signal();
          reject(
            new Error(
              `Failed to load feature dependencies: ${args[0]}, feature name: ${featureName}, deps: ${deps}, error: ${args}`,
            ),
          );
        },
        numRetries: 6,
      });
    }
  });
}

export const loadFeature = Object.assign(loadFeatureAsync, { sync: loadFeatureSync });

/**
 * If the currently rendered page is part of a feature, returns an object
 * containing the feature `name` and `metadata`
 */
export function getCurrentFeature(route?: string) {
  const [name, metadata] =
    Object.entries(manifest.features).find(([_, cfg]) => {
      return !!Object.keys(cfg.pages).find(path => (route ?? currentEndpoint()) === path);
    }) ?? [];

  return name && metadata
    ? {
        name: name as FeatureName,
        metadata,
      }
    : undefined;
}

// --- Page-specific parsers ------------------------------------------------ //

type PageParserType = 'parseApiKey' | 'parseTheme' | 'parseLocale';

const pageParserCache: {
  [P in PageParserType]?: ReturnType<NonNullable<NonNullable<LoadedFeatureModule<'Pages'>['default']>[P]>>;
} = {};

type PageParserResult<T extends PageParserType> = (typeof pageParserCache)[T];

/**
 * If the currently rendered page is part of a feature, returns the value
 * parsed from the `parser` type attached to the page definition.
 */
function parseFromPage<T extends Extract<keyof NonNullable<LoadedFeatureModule<'Pages'>['default']>, PageParserType>>(
  parser: T,
): PageParserResult<T> | undefined {
  //
  // We memoize a truthy result for the given `parser` for two reasons:
  //
  //   1. Minor performance enhancement.
  //   2. To ensure deterministic behavior in parts of the core code that use
  //      the parser result, but which do not update between client-side
  //      navigations. For example, `auth.reducer.ts` is namespaced by the
  //      MD5-hash of the developer's API key. If two separate routes were to
  //      parse the API key differently, the store's namespace would become
  //      stale.
  //
  //      So what does this mean for the page parsers? With this limitation,
  //      they are intended to hydrate data for cases where the user has
  //      navigated to the page directly from the browser's URL input, or from
  //      some external link (such as a magic link email). Be aware that React
  //      Router links DO NOT reset this cache.
  //
  //      Probably nobody will ever read this comment or encounter the case
  //      above, but it's an important trade-off to reduce the potential for
  //      complexity in core code.
  //
  // TODO: We should think about raising an error in this function if
  //       page-related side-effects haven't already dequeued from the event
  //       loop. This should be simple to implement, just set a boolean flag at
  //       the top-level of this module and flip it in the body of a
  //       `setTimeout(..., 0)`.
  //
  //       Whether it's worthwhile for the possibility of shipping an error that
  //       would otherwise just be "something undefined" is the golden question.
  //
  if (pageParserCache[parser]) {
    return pageParserCache[parser];
  }

  const route = currentEndpoint();
  const { name, metadata } = getCurrentFeature(route) ?? {};

  if (name && metadata) {
    const result = loadFeature.sync(name, 'Pages', metadata.pages[route])?.default?.[parser]?.() as any;
    pageParserCache[parser] = result;
    return result;
  }
}

export function parseThemeFromPage() {
  return parseFromPage('parseTheme');
}

export function parseLocaleFromPage() {
  return parseFromPage('parseLocale');
}

export function parseApiKeyFromPage() {
  return parseFromPage('parseApiKey');
}
